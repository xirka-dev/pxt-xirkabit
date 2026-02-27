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


    // what's the current high value
    let barGraphHigh = 0;
    // when was the current high value recorded
    let barGraphHighLast = 0;

    /**
     * Controls where plotbargraph prints to the console
     **/
    export let barGraphToConsole = true

        /**
     * Displays a vertical bar graph based on the `value` and `high` value.
     * If `high` is 0, the chart gets adjusted automatically.
     * @param value current value to plot
     * @param high maximum value. If 0, maximum value adjusted automatically, eg: 0
     * @param valueToConsole if true, prints value to the serial port
     */
    //% help=led/plot-bar-graph weight=20
    //% blockId=device_plot_bar_graph block="plot bar graph of $value up to $high|| serial write $valueToConsole" icon="\uf080" blockExternalInputs=true
    //% parts="ledmatrix"
    //% valueToConsole.shadow=toggleOnOff
    //% valueToConsole.defl=true
    export function plotBarGraph(value: number, high: number): void
    {
        if (isNaN(value)) {
            basic.clearScreen()
            return
        }

        value = Math.abs(value)

        if (high <= 0) high = 1

        let v = value / high
        let dv = 1 / 16
        let k = 0

        for (let y = 4; y >= 0; --y) {
            for (let x = 0; x < 3; ++x) {
                if (k > v) {
                    led.unplot(2 - x, y)
                    led.unplot(2 + x, y)
                } else {
                    led.plot(2 - x, y)
                    led.plot(2 + x, y)
                }
                k += dv
            }
        }
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
