let i = 0
let start = false
let wait = false
basic.forever(function () {
    if (2 <= i && i <= 3) {
        console.log("LED matrix disabled")
        led.enable(false)
    } else {
        console.log("LED matrix enabled")
        led.enable(true)
    }
    start = true
    basic.showString("Hello there!")
    start = false
    while (wait) {
        basic.pause(15)
    }
})
basic.forever(function () {
    if (start) {
        wait = true
        basic.pause(2000)
        led.stopAnimation()
        basic.pause(500)
        led.plot(4, 2)
        basic.pause(200)
        led.toggle(4, 2)
        basic.pause(200)
        led.toggle(4, 2)
        basic.pause(200)
        led.unplot(4, 2)
        if (led.point(0, 2)) {
            led.plot(2, 0)
        } else {
            led.plot(2, 4)
        }
        console.log("Global brightness is " + convertToText(led.brightness()))
        console.log("<0,0> brightness is " + convertToText(led.pointBrightness(0, 0)))
        basic.pause(200)
        led.plotBrightness(0, 0, 128)
        basic.pause(2000)
        i += 1
        if (i <= 2) {
            led.setBrightness(128)
        } else if (i < 4) {
            led.setBrightness(255)
        } else {
            i = 0
        }
        console.log("i is " + convertToText(i))
        console.log("Global brightness is " + convertToText(led.brightness()))
        console.log("<0,0> brightness is " + convertToText(led.pointBrightness(0, 0)))
        wait = false
        while (start) {
            basic.pause(15)
        }
    }
})
