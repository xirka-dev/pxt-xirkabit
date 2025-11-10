
namespace control {

    /**
     * Schedules code that run in the background.
     */
    //% help=control/in-background blockAllowMultiple=1 afterOnStart=true
    //% blockId="control_in_background" block="run in background" blockGap=8
    export function inBackground(a: () => void) {
        control.runInParallel(a);
    }

    /**
     * Returns the major version of the xirka:bit
     */
    //% help=control/hardware-version
    export function hardwareVersion(): string {
        return "0.1";
    }
}
