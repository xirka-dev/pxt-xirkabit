let received = ""
let i = 0
let myString = ""
basic.pause(5000)
console.log("Hi")
basic.pause(2000)
xirkabt.startXirkaBluetooth()
basic.forever(function () {
    myString = "i is " + convertToText(i)
    xirkabt.xirkaSendLine(myString)
    console.log(myString)
    i += 1
    basic.pause(1000)
})
basic.forever(function () {
    received = xirkabt.uartReadUntil(Delimiters.NewLine)
    if (!(received.isEmpty())) {
        console.log("Bluetooth read: " + received)
    }
})
