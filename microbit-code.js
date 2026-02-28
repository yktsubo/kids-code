// micro:bit v2 用 受信プログラム
// 音はブラウザから再生。micro:bitはLED表示 + 音のビジュアライザー。
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
        // 音の高さに応じたLEDバー表示（ビジュアライザー）
        let toneData = line.replace("TONE:", "")
        let parts = toneData.split(":")
        let freq = parseFloat(parts[0])
        basic.clearScreen()
        let level = 0
        if (freq <= 262) level = 1
        else if (freq <= 330) level = 2
        else if (freq <= 392) level = 3
        else if (freq <= 523) level = 4
        else level = 5
        for (let row = 5 - level; row < 5; row++) {
            for (let col = 1; col <= 3; col++) {
                led.plot(col, row)
            }
        }
    } else if (line.includes("CLEAR")) {
        basic.clearScreen()
    }
})
