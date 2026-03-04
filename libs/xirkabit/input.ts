
const enum TouchPin {
    P0 = DAL.CFG_PIN_P0,
    P1 = DAL.CFG_PIN_P1,
    P2 = DAL.CFG_PIN_P2
}

namespace input {
    // ==========================================
    // 1. MAGNETOMETER CONFIG & CALIBRATION
    // ==========================================
    const MAG_ADDR = 0x1E;
    const OUTX_L_REG_M = 0x68;
    const WHO_AM_I_REG = 0x4F;
    const CHIP_ID_LSM303 = 0x40;

    // DATA KALIBRASI (XirkaBit Specific)
    const OFFSET_X = -86; 
    const OFFSET_Y = -137;
    const SCALE_X = 1;
    const SCALE_Y = 1.03634;
    const ROTATION_OFFSET = 180; 

    let isMagInitialized = false;

    function initMagnetometer() {
        let buf = pins.createBuffer(2);
        buf[0] = 0x60; buf[1] = 0x00; // Continuous mode
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        buf[0] = 0x62; buf[1] = 0x01; // BDU enabled
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        isMagInitialized = true;
    }

    // ==========================================
    // 2. MAGNETOMETER BLOCK
    // ==========================================

    /**
     * Gets the compass heading in degrees (0 to 360).
     */
    //% help=input/compass-heading
    //% weight=10
    //% blockId=device_heading block="compass heading (°)"
    //% parts="magnetometer"
    export function compassHeading(): number {
        if (!isMagInitialized) { initMagnetometer(); basic.pause(20); }

        // --- SAFETY CHECK (ANTI-STUCK & SIMULATOR) ---
        // Cek ID Chip.
        pins.i2cWriteNumber(MAG_ADDR, WHO_AM_I_REG, NumberFormat.UInt8BE);
        let whoami = pins.i2cReadNumber(MAG_ADDR, NumberFormat.UInt8LE);
        
        if (whoami != CHIP_ID_LSM303) {
            // Simulator Mode: Return 0 (Diam/Clean) sesuai permintaan
            return 0; 
        }

        // --- BACA DATA HARDWARE ---
        pins.i2cWriteNumber(MAG_ADDR, OUTX_L_REG_M, NumberFormat.UInt8BE);
        let data = pins.i2cReadBuffer(MAG_ADDR, 6);

        let x_raw = data.getNumber(NumberFormat.Int16LE, 0);
        let y_raw = data.getNumber(NumberFormat.Int16LE, 2); 
        
        // --- PROSES MATEMATIKA ---
        // 1. Centering (Hard Iron Calibration)
        let x_centered = x_raw - OFFSET_X;
        let y_centered = y_raw - OFFSET_Y;
        // Apply Scale (Soft Iron Calibration)
        x_centered = x_centered * SCALE_X;
        y_centered = y_centered * SCALE_Y;

        // 2. Hitung Sudut
        let heading = Math.atan2(y_centered, x_centered) * 180 / Math.PI;

        // 3. Rotasi Board
        heading = heading - ROTATION_OFFSET;

        // 4. Normalisasi (0-360)
        while (heading < 0) heading += 360;
        
        return Math.floor(heading);
    }

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
