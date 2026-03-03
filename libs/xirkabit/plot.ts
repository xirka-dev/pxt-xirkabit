//% color=#7600A8 weight=101 icon="\uf205"
namespace led {

    /**
     * Turn on an LED at position (x, y)
     */
    //% blockId=led_plot block="plot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function plot(x: number, y: number): void {
        plotNative(x, y)
    }

    /**
     * Turn off an LED at position (x, y)
     */
    //% blockId=led_unplot block="unplot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function unplot(x: number, y: number): void {
        unplotNative(x, y)
    }

    /**
     * Toggle an LED at position (x, y)
     */
    //% blockId=led_toggle block="toggle x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    export function toggle(x: number, y: number): void {
        toggleNative(x, y)
    }

    /**
     * Check if LED at (x,y) is on
     */
    //% blockId=led_point block="point x %x y %y"
    export function point(x: number, y: number): boolean {
        return pointNative(x, y)
    }

    //% help=led/plot-bar-graph weight=20
    //% blockId=device_plot_bar_graph block="plot bar graph of $value up to $high|| serial write $valueToConsole" icon="\uf080" blockExternalInputs=true
    //% parts="ledmatrix" shim=led::plotBarGraph
    //% valueToConsole.shadow=toggleOnOff
    //% valueToConsole.defl=true
    export function plotBarGraph(value: number, high: number): void
    {
        return
    }

    //% shim=led::plot
    declare function plotNative(x: number, y: number): void

    //% shim=led::unplot
    declare function unplotNative(x: number, y: number): void

    //% shim=led::toggle
    declare function toggleNative(x: number, y: number): void

    //% shim=led::point
    declare function pointNative(x: number, y: number): boolean
}
