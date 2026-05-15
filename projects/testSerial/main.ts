basic.pause(5000)

let i = 0
basic.forever(function () {
    let myString = "Hello ABCDEFGH i is " + convertToText(i)
    serial.writeLine(myString)
    console.log("Printing: " + myString)
    i += 1
    basic.pause(5000)
})
