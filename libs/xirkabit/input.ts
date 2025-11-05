/**
 * Events and data from sensors
 */
//% color=#D400D4 weight=111 icon="\uf192"
namespace input {
    /**
     * Do something when a button (A, B or both A+B) is pushed down and released again.
     * @param button the button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% help=input/on-button-pressed weight=85 blockGap=16
    //% blockId=device_button_event block="on button|%NAME|pressed"
    //% parts="buttonpair"
    export function onButtonPressed(button: Button, body: () => void): void {
        button.onEvent(ButtonEvent.Click, body);
    }

    /**
     * Gets the number of milliseconds elapsed since power on.
     */
    //% help=input/running-time weight=50 blockGap=8
    //% blockId=device_get_running_time block="running time (ms)"
    //% advanced=true
    export function runningTime() {
        return control.millis();
    }

    /**
     * Gets the number of microseconds elapsed since power on.
     */
    //% help=input/running-time-micros weight=49
    //% blockId=device_get_running_time_micros block="running time (micros)"
    //% advanced=true
    export function runningTimeMicros() {
        return control.micros();
    }
}
