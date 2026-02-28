// micro:bit v2 用 受信プログラム
// BLE + music.ringTone() で音を鳴らす
// control.inBackground / soundExpression は使わない
bluetooth.startUartService()

let lastToneTime = 0

bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
    basic.pause(500)
    basic.clearScreen()
})

bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
    basic.pause(500)
    basic.clearScreen()
})

input.onButtonPressed(Button.A, function () {
    bluetooth.uartWriteString("BTN:A\n")
})

input.onButtonPressed(Button.B, function () {
    bluetooth.uartWriteString("BTN:B\n")
})

// タイムアウトで音を自動停止
basic.forever(function () {
    if (lastToneTime > 0 && input.runningTime() - lastToneTime > 500) {
        music.ringTone(0)
        lastToneTime = 0
    }
    basic.pause(50)
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))

    if (line.length == 0) {
        return
    }

    if (line.includes("LED:")) {
        let data = line.replace("LED:", "")
        let rows = data.split(",")
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < 5; x++) {
                if (y < rows.length && x < rows[y].length && rows[y].charAt(x) == "1") {
                    led.plot(x, y)
                } else {
                    led.unplot(x, y)
                }
            }
        }
    } else if (line.includes("TONE:")) {
        let toneData = line.replace("TONE:", "")
        let parts = toneData.split(":")
        let freq = parseFloat(parts[0])
        // ringTone で鳴らす（inBackground なし）
        music.ringTone(freq)
        lastToneTime = input.runningTime()
        // 周波数に応じてLEDビジュアライザー
        let level = 0
        if (freq < 300) level = 1
        else if (freq < 400) level = 2
        else if (freq < 500) level = 3
        else if (freq < 600) level = 4
        else level = 5
        basic.clearScreen()
        for (let row = 5 - level; row < 5; row++) {
            for (let col = 1; col < 4; col++) {
                led.plot(col, row)
            }
        }
    } else if (line.includes("CLEAR")) {
        music.ringTone(0)
        lastToneTime = 0
        basic.clearScreen()
    }
})
