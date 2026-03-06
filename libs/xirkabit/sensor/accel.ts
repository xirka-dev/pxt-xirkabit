namespace input {
    // ===== LSM303AGR I2C =====
    const ACC_ADDR = 0x19;
    const CTRL_REG1_A = 0x20;
    const CTRL_REG4_A = 0x23;
    // Use autoincrement bit (MSB=1) for bulk read
    const OUT_X_L_A = 0x28;

    let accInit = false;

    function initAccel() {
        if (accInit) return;

        // ---- CTRL_REG1_A (Enable X/Y/Z + 50 Hz) ----
        let buf1 = pins.createBuffer(2);
        buf1[0] = CTRL_REG1_A;
        buf1[1] = 0x57;
        pins.i2cWriteBuffer(ACC_ADDR, buf1);

        // ---- CTRL_REG4_A (High-resolution enable) ----
        let buf2 = pins.createBuffer(2);
        buf2[0] = CTRL_REG4_A;
        buf2[1] = 0x08;
        pins.i2cWriteBuffer(ACC_ADDR, buf2);

        basic.pause(20);
        accInit = true;
    }

    function readAccelRaw(): number[] {
        initAccel();

        // IMPORTANT: auto-increment register address (0x80)
        pins.i2cWriteNumber(
            ACC_ADDR,
            OUT_X_L_A | 0x80,
            NumberFormat.UInt8LE,
            false
        );

        let buf = pins.i2cReadBuffer(ACC_ADDR, 6);

        let x = buf.getNumber(NumberFormat.Int16LE, 0);
        let y = buf.getNumber(NumberFormat.Int16LE, 2);
        let z = buf.getNumber(NumberFormat.Int16LE, 4);

        return [x, y, z];
    }

    //%
    export function accelX(): number { return readAccelRaw()[0]; }

    //%
    export function accelY(): number { return readAccelRaw()[1]; }

    //%
    export function accelZ(): number { return readAccelRaw()[2]; }

    //%
    export function accelStrength(): number {
        const r = readAccelRaw();
        return Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]);
    }
}
