// micro:bit v2 用 受信プログラム
// MakeCode (https://makecode.microbit.org/) の JavaScript モードに貼り付けてください
// Bluetooth UART でブラウザからコマンドを受信し、LED・音を制御します

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

    if (line.includes("LED:")) {
        let data = line.replace("LED:", "")
        let rows = data.split(",")
        for (let y = 0; y <= 4; y++) {
            for (let x = 0; x <= 4; x++) {
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
        let dur = parseFloat(parts[1])
        if (freq > 0 && dur > 0) {
            pins.analogSetPitchPin(AnalogPin.P0)
            pins.analogPitch(freq, dur)
        }
    } else if (line.includes("CLEAR")) {
        basic.clearScreen()
    }
})
