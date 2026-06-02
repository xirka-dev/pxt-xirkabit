let heading = 0
basic.pause(5000)
console.log("Hi")
basic.pause(2000)
input.compassHeading()
const offsets = input.getCompassOffsets()
console.log("Run # " + settings.runNumber())
console.log(
    "Offsets X is " +
    offsets[0] +
    ", Y is " +
    offsets[1] +
    ", Z is " +
    offsets[2]
)

basic.forever(function () {
    if (input.AB.isPressed()) {
        console.log("Calibrating compass...")
        input.calibrateCompass()
        console.log("Done!")
        const offsets = input.getCompassOffsets()
        console.log(
            "Offsets X is " +
            offsets[0] +
            ", Y is " +
            offsets[1] +
            ", Z is " +
            offsets[2]
        )
    }
    
    heading = input.compassHeading()
    console.log("Heading is " + heading)
    heading = (heading == 0) ? 0 : (360 - heading)
    if (heading <= 22 || heading >= 338) {
        basic.showArrow(ArrowNames.North)
    } else if (heading <= 67) {
        basic.showArrow(ArrowNames.NorthEast)
    } else if (heading <= 112) {
        basic.showArrow(ArrowNames.East)
    } else if (heading <= 157) {
    	basic.showArrow(ArrowNames.SouthEast)
    } else if (heading <= 202) {
        basic.showArrow(ArrowNames.South)
    } else if (heading <= 247) {
        basic.showArrow(ArrowNames.SouthWest)
    } else if (heading <= 292) {
        basic.showArrow(ArrowNames.West)
    } else {
        basic.showArrow(ArrowNames.NorthWest)
    }
    basic.pause(100)
})
