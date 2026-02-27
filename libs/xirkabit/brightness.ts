//% color=#7600A8 weight=100 icon="\uf042"
namespace led {

    let dirty = false
    let scheduled = false

    //% blockId=led_plot_brightness
    //% block="plot brightness x %x y %y b %b"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% b.min=0 b.max=255
    export function plotBrightness(x: number, y: number, b: number): void {
        plotBrightnessNative(x, y, b)
        dirty = true

        if (!scheduled) {
            scheduled = true
            control.runInParallel(() => {
                basic.pause(0)   // tunggu semua block selesai
                if (dirty) {
                    flushBrightnessNative()
                    dirty = false
                }
                scheduled = false
            })
        }
    }

    //% blockId=led_brightness
    export function brightness(x: number, y: number): number {
        return brightnessNative(x, y)
    }

    // ===== native =====
    //% shim=led::plotBrightness
    declare function plotBrightnessNative(x: number, y: number, b: number): void

    //% shim=led::getbrightness
    declare function brightnessNative(x: number, y: number): number

    //% shim=led::flushBrightness
    //% blockHidden=true
    declare function flushBrightnessNative(): void
}
