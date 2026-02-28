// micro:bit v2 用 受信プログラム
bluetooth.startUartService()

let currentFreq = 0
let toneEndTime = 0

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

// Background loop to stop tones after duration
basic.forever(function () {
    if (currentFreq > 0 && input.runningTime() > toneEndTime) {
        music.ringTone(0)
        currentFreq = 0
    }
    basic.pause(20)
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
        let dur = parseFloat(parts[1])
        if (freq > 0 && dur > 0) {
            music.ringTone(freq)
            currentFreq = freq
            toneEndTime = input.runningTime() + dur
        }
    } else if (line.includes("CLEAR")) {
        basic.clearScreen()
    }
})
