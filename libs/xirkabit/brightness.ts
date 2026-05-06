//% color=#7600A8 weight=100 icon="\uf042"
namespace led {

    //% blockId=led_plot_brightness
    //% block="plot brightness x %x y %y brightness %b"
    //% x.min=0 x.max=4 y.min=0 y.max=4 b.min=0 b.max=255 b.defl=255
    //% shim=led::plotBrightness
    //% advanced=true
    //% weight=95 
    export function plotBrightness(x: number, y: number, b: number): void {
        return
    }

    //% blockId=led_point_brightness
    //% block="point x %x y %y brightness"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% shim=led::pointBrightness
    //% advanced=true
    //% weight=90
    export function pointBrightness(x: number, y: number): number {
        return 0
    }

    //% blockId=led_brightness_value
    //% block="brightness"
    //% shim=led::getBrightness
    //% advanced=true
    //% weight=85
    export function getBrightness(): number {
        return 0
    }

    //% blockId=led_set_brightness
    //% block="set brightness %b"
    //% b.min=0 b.max=255 b.defl=255
    //% shim=led::setBrightness
    //% advanced=true
    //% weight=80
    export function setBrightness(b: number): void {
        return
    }

   //% blockId=device_led_enable
   //% block="led enable %on"
   //% shim=led::ledEnable
   //% advanced=true
   //% parts="ledmatrix"
   //% weight=75
    export function ledEnable(e: boolean): void {
        return
    }
}