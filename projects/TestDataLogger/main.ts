const buttonA = "ButtonA"
const buttonB = "ButtonB"
const buttonAB = "ButtonAB"

control.runInParallel(function () {
    while (true) {
        led.toggle(2, 2)
        basic.pause(500)
    }
})

basic.pause(5000)
console.log("Hi")
basic.pause(2000)

const list = settings.list()
console.log(`There are ${list.length} user settings`)
if (list.length > 0)
    list.forEach(function(name) {
        if (name.includes("logCount"))
            console.log(`Key "${name}" is "${settings.readNumber(name)}"`)
        else if (name.includes("log"))
            console.log(`Key "${name}" is "${settings.readString(name)}"`)
        else
            console.log(`Key "${name}" is "${settings.readBuffer(name).toHex()}"`)
    })

console.log('Enabling mirror to serial...')
datalogger.mirrorToSerial(true)
console.log('Setting column titles...')
datalogger.setColumnTitles(buttonA, buttonB, buttonAB)

const rowCount = datalogger.getNumberOfRows()
console.log(`.\r\nThere are ${rowCount} rows in the log:`)
console.log(datalogger.getRows(0, rowCount))
console.log('.')

function recordButtons(stateA: boolean, stateB: boolean, stateAB: boolean) {
    datalogger.log(
        datalogger.createCV(buttonA, stateA.toString()),
        datalogger.createCV(buttonB, stateB.toString()),
        datalogger.createCV(buttonAB, stateAB.toString())
    )
    if (stateA) led.plot(0, 2)
    else led.unplot(0, 2)
    if (stateB) led.plot(4, 2)
    else led.unplot(4, 2)
    if (stateAB) led.plot(2, 0)
    else led.unplot(2, 0)
}

console.log('Registering button callbacks...')
input.onButtonPressed(input.A, ()=>{recordButtons(true,false,false)})
input.onButtonPressed(input.B, ()=>{recordButtons(false,true,false)})
input.onButtonPressed(input.AB, ()=>{recordButtons(false,false,true)})

basic.forever(function () {
    console.log('Ping')
    basic.pause(2000)
})
