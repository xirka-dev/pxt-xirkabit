//% color=#7600A8 weight=101 icon="\uf205"
namespace led {

    /**
     * Toggle an LED at position (x, y)
     */
    //% blockId=led_toggle block="toggle x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=90
    //% shim=led::toggle
    export function toggle(x: number, y: number): void {
        if(point(x, y)) {
            unplot(x, y);
        } else {
            plot(x, y);
        }
    }
    
    //% help=led/plot-bar-graph weight=20
    //% blockId=device_plot_bar_graph block="plot bar graph of $value up to $high|| serial write $valueToConsole" icon="\uf080" blockExternalInputs=true
    //% parts="ledmatrix" shim=led::plotBarGraph
    //% valueToConsole.shadow=toggleOnOff
    //% valueToConsole.defl=true
    //% weight=75
    export function plotBarGraph(value: number, high: number): void
    {
        return
    }

}
