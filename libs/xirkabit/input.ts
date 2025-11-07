
const enum TouchPin {
    P0 = DAL.CFG_PIN_P0,
    P1 = DAL.CFG_PIN_P1,
    P2 = DAL.CFG_PIN_P2
}

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

     /**
     * Do something when a pin is touched and released again (while also touching the GND pin).
     * @param name the pin that needs to be pressed, eg: TouchPin.P0
     * @param body the code to run when the pin is pressed
     */
    //% help=input/on-pin-pressed weight=83 blockGap=32
    //% blockId=device_pin_event block="on pin %name|pressed"
    export function onPinPressed(name: TouchPin, body: () => void): void {
        const pin = pins.pinByCfg(name) as DigitalInOutPin;
        if (pin) {
            pin.setPull(PinPullMode.PullUp);
            pin.onEvent(PinEvent.Fall, body);
        }
    }

    /**
     * Do something when a pin is released.
     * @param name the pin that needs to be released, eg: TouchPin.P0
     * @param body the code to run when the pin is released
     */
    //% help=input/on-pin-released weight=6 blockGap=16
    //% blockId=device_pin_released block="on pin %NAME|released"
    //% advanced=true
    export function onPinReleased(name: TouchPin, body: () => void): void {
        const pin = pins.pinByCfg(name) as DigitalInOutPin;
        if (pin) {
            pin.setPull(PinPullMode.PullUp);
            pin.onEvent(PinEvent.Rise, body);
        }
    }

    /**
     * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
     * @param name pin used to detect the touch, eg: TouchPin.P0
     */
    //% help=input/pin-is-pressed weight=58
    //% blockId="device_pin_is_pressed" block="pin %NAME|is pressed"
    //% blockGap=8
    export function pinIsPressed(name: TouchPin): boolean {
        const pin = pins.pinByCfg(name) as DigitalInOutPin;
        if(!pin) return false;
        pin.setPull(PinPullMode.PullUp);
        return pin.digitalRead() == false;
    }
}
