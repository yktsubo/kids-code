// micro:bit MakeCode 用 JavaScript コード
// このコードを https://makecode.microbit.org/ に貼り付けて、micro:bit に書き込んでください。
// UART サービスで PC からコマンドを受信し、LED表示・音再生を行います。

bluetooth.startUartService()

let connected = false

bluetooth.onBluetoothConnected(function () {
    connected = true
    basic.showIcon(IconNames.Yes)
    basic.pause(500)
    basic.clearScreen()
})

bluetooth.onBluetoothDisconnected(function () {
    connected = false
    basic.showIcon(IconNames.No)
    basic.pause(500)
    basic.clearScreen()
})

// ボタン押下を UART で送信
input.onButtonPressed(Button.A, function () {
    bluetooth.uartWriteString("BTN:A\n")
})

input.onButtonPressed(Button.B, function () {
    bluetooth.uartWriteString("BTN:B\n")
})

// UART 受信バッファ
let buf = ""

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    
    if (line.indexOf("LED:") === 0) {
        // LED:xxxxx,xxxxx,xxxxx,xxxxx,xxxxx
        let data = line.substr(4)
        let rows = data.split(",")
        for (let y = 0; y < 5; y++) {
            if (y < rows.length) {
                for (let x = 0; x < 5; x++) {
                    if (x < rows[y].length && rows[y].charAt(x) === "1") {
                        led.plot(x, y)
                    } else {
                        led.unplot(x, y)
                    }
                }
            }
        }
    } else if (line.indexOf("TONE:") === 0) {
        // TONE:frequency:duration
        let parts = line.substr(5).split(":")
        let freq = parseInt(parts[0])
        let dur = parseInt(parts[1])
        if (freq > 0 && dur > 0) {
            music.playTone(freq, dur)
        }
    } else if (line === "CLEAR") {
        basic.clearScreen()
    }
})
