
/**
 * Provides access to basic micro:bit functionality.
 */
//% color=#1E90FF weight=116 icon="\uf00a"
namespace basic {
    //% help=basic/forever weight=55 blockGap=16 blockAllowMultiple=1 afterOnStart=true
    //% blockId=device_forever block="forever" icon="\uf01e"
    export function forever(a: () => void) {
        loops.forever(a);
    }

    /**
     * Pause for the specified time in milliseconds
     * @param ms how long to pause for, eg: 100, 200, 500, 1000, 2000
     */
    //% help=basic/pause weight=54
    //% async block="pause (ms) %pause" blockGap=16
    //% blockId=device_pause icon="\uf110"
    //% pause.shadow=timePicker
    export function pause(millis: number) {
        loops.pause(millis);
    }
}
