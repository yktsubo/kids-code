// micro:bit v2 用 受信プログラム
// 音はブラウザ側で再生。micro:bitはLED表示のみ。
bluetooth.startUartService()

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
        // 音符に対応するLEDパターンを表示（音はブラウザで再生）
        let toneData = line.replace("TONE:", "")
        let parts = toneData.split(":")
        let freq = parseFloat(parts[0])
        // 周波数に応じてLEDの高さを変える（ビジュアライザー）
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
        basic.clearScreen()
    }
})
