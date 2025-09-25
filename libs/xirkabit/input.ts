
//enum Button {
//    A = DAL.DEVICE_ID_BUTTON_A,
//    B = DAL.DEVICE_ID_BUTTON_B,
//    AB = DAL.DEVICE_ID_BUTTON_AB
//}

//namespace pxt {
//  export function registerWithDal(id : number, event : number , a : Action, flags : number): void {
//    if (!findBinding(id, event)) {
//        devMessageBus.listen(id, event, dispatchEvent, flags);
//        if (event == 0) {
//            // we're registering for all events on given ID
//            // need to remove old listeners for specific events
//            curr = findBinding(id, -1);
//            while (curr) {
//                devMessageBus.ignore(id, curr.value, dispatchEvent);
//                curr = nextBinding(curr.next, id, -1);
//            }
//        }
//    }
//    setBinding(id, event, a);
//
//  }
//
//}

/**
 * Events and data from sensors
 */
//% color=#D400D4 weight=111 icon="\uf192"
namespace input {
//    /**
//     * Do something when a button (A, B or both A+B) is pushed down and released again.
//     * @param button the button that needs to be pressed
//     * @param body code to run when event is raised
//     */
//    //% help=input/on-button-pressed weight=85 blockGap=16
//    //% blockId=device_button_event block="on button|%NAME|pressed"
//    //% parts="buttonpair"
//    export function onButtonPressed(button: number, body: Action): void {
//        //registerWithDal((int)button, MICROBIT_BUTTON_EVT_CLICK, body);
//        registerWithDal((int)button, MICROBIT_BUTTON_EVT_CLICK, body);
//    }

//    /**
//     * Do something when a button (A, B or both A+B) is pushed down and released again.
//     * @param button the button that needs to be pressed
//     * @param body code to run when event is raised
//     */
//    //% help=input/on-button-pressed weight=85 blockGap=16
//    //% blockId=device_button_event block="on button|%NAME|pressed"
//    //% parts="buttonpair"
//    export function onButtonPressed(button: number, body: Action): void {
//        //registerWithDal((int)button, MICROBIT_BUTTON_EVT_CLICK, body);
//        //pxt->registerWithDal(button, DAL.DEVICE_BUTTON_EVT_CLICK, body);
//        //const p = pins.pinByCfg(pin);
//        //pxt.registerWithDal(button, DAL.DEVICE_BUTTON_EVT_CLICK, body, 16);
//        //pxt.registerWithDal(button, 3, body, 16);
//    }

////    /**
////     * Attaches code to run when the screen is facing up.
////     * @param body TODO
////     */
////    //% help=input/on-screen-up
////    export function onScreenUp(body: () => void): void {
////        onGesture(Gesture.ScreenUp, body);
////    }
////
////    /**
////     * Attaches code to run when the screen is facing down.
////     * @param body TODO
////     */
////    //% help=input/on-screen-down
////    export function onScreenDown(body: () => void): void {
////        onGesture(Gesture.ScreenDown, body);
////    }
////
////    /**
////     * Attaches code to run when the device is shaken.
////     * @param body TODO
////     */
////    //% deprecated=true
////    //% help=input/on-shake
////    export function onShake(body: () => void): void {
////        onGesture(Gesture.Shake, body);
////    }
////
////    /**
////     * Attaches code to run when the logo is oriented upwards and the board is vertical.
////     * @param body TODO
////     */
////    //% help=input/on-logo-up
////    export function onLogoUp(body: () => void): void {
////        onGesture(Gesture.LogoUp, body);
////    }
////
////    /**
////     * Attaches code to run when the logo is oriented downwards and the board is vertical.
////     * @param body TODO
////     */
////    //% help=input/on-logo-down
////    export function onLogoDown(body: () => void): void {
////        onGesture(Gesture.LogoDown, body);
////    }
////
////    /**
////     * Obsolete, use input.calibrateCompass instead.
////     */
////    //% weight=0 help=input/calibrate-compass
////    export function calibrate() {
////        input.calibrateCompass();
////    }
////
////
////    /**
////     * Gets the number of milliseconds elapsed since power on.
////     */
////    //% help=input/running-time weight=50 blockGap=8
////    //% blockId=device_get_running_time block="running time (ms)"
////    //% advanced=true
////    export function runningTime() {
////        return control.millis();
////    }
////
////    /**
////     * Gets the number of microseconds elapsed since power on.
////     */
////    //% help=input/running-time-micros weight=49
////    //% blockId=device_get_running_time_micros block="running time (micros)"
////    //% advanced=true
////    export function runningTimeMicros() {
////        return control.micros();
////    }
}
