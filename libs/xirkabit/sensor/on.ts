namespace input {
    // ===== LSM303AGR I2C =====
    const ACC_ADDR = 0x19;
    const CTRL_REG1_A = 0x20;
    const CTRL_REG4_A = 0x23;
    const OUT_X_L_A = 0x28; // Low byte X

    // event source id (lokal)
    const ACC_EVENT = 4000;

    let lastX_raw = 0;
    let lastY_raw = 0;
    let lastZ_raw = 0;

    // ===== FILTERED STATE =====
    let accX = 0
    let accY = 0
    let accZ = 0
    let accStrength = 0


    let accInitialized = false;

    function initHWAccel() {
        if (accInitialized) return;

        // REG1: 50Hz + enable XYZ
        let buf = pins.createBuffer(2);
        buf[0] = CTRL_REG1_A;
        buf[1] = 0x67;
        pins.i2cWriteBuffer(ACC_ADDR, buf);

        // REG4: set high-resolution bit (keep default FS = ±2g)
        buf[0] = CTRL_REG4_A;
        buf[1] = 0x08; // HR bit
        pins.i2cWriteBuffer(ACC_ADDR, buf);

        // REG2_A: HP filter OFF
        buf[0] = 0x21;
        buf[1] = 0x01;
        pins.i2cWriteBuffer(ACC_ADDR, buf);


        accInitialized = true;
        basic.pause(50);
    }

    function signExtend12(v: number): number {
        if (v & 0x800) return v - 0x1000;
        return v;
    }


    function readAccelRaw(): number[] {
        initHWAccel();

        pins.i2cWriteNumber(ACC_ADDR, OUT_X_L_A | 0x80, NumberFormat.UInt8LE, false);
        const d = pins.i2cReadBuffer(ACC_ADDR, 6);

        let x = signExtend12(((d[1] << 8) | d[0]) >> 4);
        let y = signExtend12(((d[3] << 8) | d[2]) >> 4);
        let z = signExtend12(((d[5] << 8) | d[4]) >> 4);

        return [x, y, z];
    }
    // ===== LOW PASS FILTER =====
    const LPF_ALPHA = 0.2

    function updateAccel() {
        const [rx, ry, rz] = readAccelRaw()

        accX += LPF_ALPHA * (rx - accX)
        accY += LPF_ALPHA * (ry - accY)
        accZ += LPF_ALPHA * (rz - accZ)

        accStrength = Math.sqrt(accX * accX + accY * accY + accZ * accZ)
    }

    // ===== Axis enum =====
    export enum XirkabitAxis {
        //% block="x"
        X = 0,
        //% block="y"
        Y = 1,
        //% block="z"
        Z = 2,
        //% block="strength"
        Strength = 3
    }

    // ===== Rotation enum =====
    export enum XirkabitRotation {
        //% block="pitch"
        Pitch = 0,
        //% block="roll"
        Roll = 1
    }

    // ===== Range =====
    export enum XirkabitAccelRange {
        //% block="2g"
        G2 = 0,
        //% block="4g"
        G4 = 1,
        //% block="8g"
        G8 = 2,
        //% block="16g"
        G16 = 3
    }

    // ===== 1. Rotation block =====
    //% blockId=xirkabit_rotation
    //% block="rotation %rot"
    export function rotation(rot: XirkabitRotation): number {
        const [x, y, z] = readAccelRaw();
        const radToDeg = 180 / Math.PI;

        if (rot == XirkabitRotation.Pitch)
            return -Math.atan2(x, Math.sqrt(y * y + z * z)) * radToDeg;
        else
            return -Math.atan2(y, Math.sqrt(x * x + z * z)) * radToDeg;
    }

    // ===== 2. Raw acceleration block =====
    //% blockId=xirkabit_acceleration
    //% block="acceleration (raw) %axis"
    export function accelerationRaw(axis: XirkabitAxis): number {
        const [x, y, z] = readAccelRaw();
        switch (axis) {
            case XirkabitAxis.X: return x;
            case XirkabitAxis.Y: return y;
            case XirkabitAxis.Z: return z;
            default: return Math.sqrt(x * x + y * y + z * z) | 0;
        }
    }

    // ===== Gesture enum =====
    export enum XirkabitGesture {
        //% block="shake"
        Shake = 1,
        //% block="logo up"
        LogoUp = 2,
        //% block="logo down"
        LogoDown = 3,
        //% block="screen up"
        ScreenUp = 4,
        //% block="screen down"
        ScreenDown = 5,
        //% block="tilt left"
        TiltLeft = 6,
        //% block="tilt right"
        TiltRight = 7,
        //% block="free fall"
        FreeFall = 8,
        //% block="3g"
        ThreeG = 9,
        //% block="6g"
        SixG = 10,
        //% block="8g"
        EightG = 11
    }

    // ===== 3. onGesture event =====
    //% blockId=xirkabit_on_gesture
    //% block="on %gesture"
    export function onGesture(gesture: XirkabitGesture, handler: () => void) {
        control.onEvent(ACC_EVENT, gesture, handler);
    }

    // ===== Thresholds (tuning for LSM303-like readings) =====
    const SHAKE_DELTA = 1200;
    const TH_TILT = 800;
    const TH_FREEFALL = 500;
    const TH_3G = 1000;
    const TH_6G = 1500;
    const TH_8G = 2000;

    let lastShake = 0;
    let lastOrient = 0;
    let lastFreefall = 0;
    let lastG = 0;
    let lastOrientationGesture = 0;
    let freeFallCount = 0;


    // ===== Background gesture detection =====
    control.inBackground(() => {
        initHWAccel();
        let gravityBaseline = 1000;


        while (true) {
            const [x, y, z] = readAccelRaw();
            const strength = Math.sqrt(x * x + y * y + z * z) | 0;
            const now = control.millis();

            // SHAKE 

            if (now - lastShake > 0) {
                const dx = Math.abs(x - lastX_raw);
                const dy = Math.abs(y - lastY_raw);
                const dz = Math.abs(z - lastZ_raw);

                const jerk = dx + dy + dz

                if (jerk > SHAKE_DELTA) {
                    lastShake = now
                    control.raiseEvent(ACC_EVENT, XirkabitGesture.Shake)
                }

                lastX_raw = x;
                lastY_raw = y;
                lastZ_raw = z;
            }



            // ORIENTATION (cooldown 250 ms) - mapping consistent with isGesture
            if (now - lastOrient > 250) {
                let currentGesture = 0;

                // SCREEN (telentang / tengkurap)
                if (z > TH_TILT) {
                    currentGesture = XirkabitGesture.ScreenUp;
                } else if (z < -TH_TILT) {
                    currentGesture = XirkabitGesture.ScreenDown;
                }
                // LOGO (tegak logo atas / bawah)
                else if (y > TH_TILT) {
                    currentGesture = XirkabitGesture.TiltLeft;
                } else if (y < -TH_TILT) {
                    currentGesture = XirkabitGesture.TiltRight;
                }
                else if (x < -TH_TILT) {
                    currentGesture = XirkabitGesture.LogoUp;
                } else if (x > TH_TILT) {
                    currentGesture = XirkabitGesture.LogoDown;
                }


                // raise event
                if (currentGesture != 0 && currentGesture != lastOrientationGesture) {
                    control.raiseEvent(ACC_EVENT, currentGesture);
                    lastOrientationGesture = currentGesture;
                }

                lastOrient = now;
            }


            // FREE FALL
            const gLoss = Math.abs(strength - gravityBaseline);

            if (gLoss > 600) {
                freeFallCount++;
            } else {
                freeFallCount = 0;
            }

            if (freeFallCount >= 4 && now - lastFreefall > 300) {
                lastFreefall = now;
                freeFallCount = 0;
                control.raiseEvent(ACC_EVENT, XirkabitGesture.FreeFall);
            }


            // G-FORCE LEVELS (cooldown 300 ms)
            if (now - lastG > 300) {
                if (strength > TH_8G) control.raiseEvent(ACC_EVENT, XirkabitGesture.EightG);
                else if (strength > TH_6G) control.raiseEvent(ACC_EVENT, XirkabitGesture.SixG);
                else if (strength > TH_3G) control.raiseEvent(ACC_EVENT, XirkabitGesture.ThreeG);
                lastG = now;
            }

            basic.pause(50); // sampling period
        }
    });

    // ===== 4. isGesture block =====
    //% blockId=xirkabit_is_gesture
    //% block="is %gesture gesture"
    export function isGesture(gesture: XirkabitGesture): boolean {
        const [x, y, z] = readAccelRaw();
        const strength = Math.sqrt(x * x + y * y + z * z);

        switch (gesture) {
            case XirkabitGesture.Shake: {
                const dx = Math.abs(x - lastX_raw);
                const dy = Math.abs(y - lastY_raw);
                const dz = Math.abs(z - lastZ_raw);
                return (dx > SHAKE_DELTA || dy > SHAKE_DELTA || dz > SHAKE_DELTA);
            }
            case XirkabitGesture.FreeFall: return (control.millis() - lastFreefall) < 200;
            case XirkabitGesture.ScreenUp: return z > TH_TILT;
            case XirkabitGesture.ScreenDown: return z < -TH_TILT;
            case XirkabitGesture.LogoUp: return x > TH_TILT;
            case XirkabitGesture.LogoDown: return x < -TH_TILT;
            case XirkabitGesture.TiltLeft: return y < -TH_TILT;
            case XirkabitGesture.TiltRight: return y > TH_TILT;
            case XirkabitGesture.ThreeG: return strength > TH_3G;
            case XirkabitGesture.SixG: return strength > TH_6G;
            case XirkabitGesture.EightG: return strength > TH_8G;
        }
        return false;
    }

    // ===== 5.  Set accelerometer range =====
    //% blockId=xirkabit_set_accel_range
    //% block="set accelerometer %range"
    export function setAccelerometer(range: XirkabitAccelRange) {
        initHWAccel();

        // keep HR bit (0x08) and OR with FS bits
        let fs = 0x00;
        switch (range) {
            case XirkabitAccelRange.G2: fs = 0x00; break;
            case XirkabitAccelRange.G4: fs = 0x10; break;
            case XirkabitAccelRange.G8: fs = 0x20; break;
            case XirkabitAccelRange.G16: fs = 0x30; break;
        }

        const buf = pins.createBuffer(2);
        buf[0] = CTRL_REG4_A;
        buf[1] = 0x08 | fs; // HR bit + FS
        pins.i2cWriteBuffer(ACC_ADDR, buf);
        basic.pause(10);
    }

}