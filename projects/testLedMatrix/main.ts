basic.clearScreen()

basic.pause(6000)
console.log("Begin!")
basic.pause(2000)
console.log("Hello from xirka:bit")
let img = images.arrowImage(ArrowNames.North)
let img2 = images.arrowImage(ArrowNames.South)
let img3 = images.createImage(`
    . . # .
    . # . #
    # . # .
`)
let i = 0
basic.forever(function () {
    console.log("Ping " + i)
    basic.pause(1000)
    i += 1
    if (i >= 2) {
        img.plotImage(1)
        basic.pause(1000)
        img2.showImage(2, 1000)
        img3.plotFrame(0)
        basic.pause(1000)
        img.scrollImage(1, 200)
        basic.pause(1000)
        img2.clear()
        img2.showImage(0, 1000)
        img2.setPixelBrightness(2, 2, 128)
        img2.showImage(0, 1000)
        console.log("Pixel at (2,2) is " + img2.pixelBrightness(2,2))
        console.log("Width is " + img3.width() + " and Height is " + img3.height())
        img2.setPixel(0,0, true)
        img2.showImage(0, 1000)
        console.log("Pixel at (0,0) is " + img2.pixel(0,0))
        img3.showFrame(0, 1000)
        basic.showIcon(IconNames.Heart, 1000)
        basic.showIcon(IconNames.SmallHeart, 1000)
        basic.showArrow(ArrowNames.NorthWest, 1000)
        basic.showArrow(ArrowNames.SouthEast, 1000)
        i = 0
    }
})
