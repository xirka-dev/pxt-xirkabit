// ==========================================
// XIRKABIT COMPASS / MAGNETOMETER (LSM303AGR)
// ==========================================

// Making a menu of choice x, y, z and strength on magnetic force block.
const enum Dimension {
    //% block="x"
    X = 0,
    //% block="y"
    Y = 1,
    //% block="z"
    Z = 2,
    //% block="strength"
    Strength = 3
} 

namespace input {
    const MAG_ADDR = 0x1E;
    const OUTX_L_REG_M = 0x68;
    const WHO_AM_I_REG = 0x4F;
    const CHIP_ID_LSM303 = 0x40;

    // Sensitivity of LSM303AGR (1.5 mG/LSB = 0.15 µT/LSB)
    const SENSITIVITY_AGR = 0.15;

    // Offset definition for x, y, and z.
    let magOffsetX = 0; 
    let magOffsetY = 0;
    let magOffsetZ = 0;
    
    const ROTATION_OFFSET = 270; 

    let isMagInitialized = false;

    // [Fungsi Pembacaan Data Raw]

    function readRawMag(): number[] {
        pins.i2cWriteNumber(MAG_ADDR, OUTX_L_REG_M, NumberFormat.UInt8BE);
        let data = pins.i2cReadBuffer(MAG_ADDR, 6);
        
        // Taking the raw data from LSM303AGR register
        let rawX = data.getNumber(NumberFormat.Int16LE, 0);
        let rawY = data.getNumber(NumberFormat.Int16LE, 2);
        let rawZ = data.getNumber(NumberFormat.Int16LE, 4);

        // Orientasi bersifat subjektif
        // Orientasi sebagai berikut agar logo, label, dan LED pada xirkabit menjadi bagian "muka"
        let x = rawY; 
        let y = -rawX;
        let z = -rawZ;

        return [x, y, z];
    }

    function initMagnetometer() {
        let buf = pins.createBuffer(2);
        buf[0] = 0x60; buf[1] = 0x00; // CFG_REG_A_M (10Hz, Continuous)
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        buf[0] = 0x62; buf[1] = 0x01; // CFG_REG_C_M (BDU enabled)
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        isMagInitialized = true;
    }

    // [Block "Magnetic Force"]

    //% help=input/magnetic-force
    //% weight=15
    //% blockId=input_magnetic_force block="magnetic force (µT)|%dim"
    //% parts="magnetometer"
    export function magneticForce(dim: Dimension): number {
        if (!isMagInitialized) { initMagnetometer(); basic.pause(20); }
        
        // Safety Check ID
        try {
            pins.i2cWriteNumber(MAG_ADDR, WHO_AM_I_REG, NumberFormat.UInt8BE);
            if (pins.i2cReadNumber(MAG_ADDR, NumberFormat.UInt8LE) != CHIP_ID_LSM303) return 0;
        } catch(e) { return 0; }

        let raw = readRawMag();
        
        // Koreksi dengan offset hasil kalibrasi
        let x_corr = raw[0] - magOffsetX;
        let y_corr = raw[1] - magOffsetY;
        let z_corr = raw[2] - magOffsetZ;

        // Konversi ke uT, dikalikan dengan sensitivitas sensor
        let x_uT = x_corr * SENSITIVITY_AGR;
        let y_uT = y_corr * SENSITIVITY_AGR;
        let z_uT = z_corr * SENSITIVITY_AGR;

        switch (dim) {
            case Dimension.X: return Math.round(x_uT);
            case Dimension.Y: return Math.round(y_uT);
            case Dimension.Z: return Math.round(z_uT);
            case Dimension.Strength:
                // Hitung strength - resultan vektor total dari x, y, dan z
                return Math.round(Math.sqrt(x_uT * x_uT + y_uT * y_uT + z_uT * z_uT));
            default: return 0;
        }
    }

    // [Block "Calibrate Compass"]

    //% help=input/calibrate-compass
    //% blockId=input_calibrate_compass block="calibrate compass"
    //% weight=20
    export function calibrateCompass(): void {
        if (!isMagInitialized) { initMagnetometer(); basic.pause(20); }

        // Nilai min/max dasar yang ekstrem
        let minX = 32000; let maxX = -32000;
        let minY = 32000; let maxY = -32000;
        let minZ = 32000; let maxZ = -32000;

        basic.clearScreen();
        // Instruksi visual: Tampilkan panah putar atau diamond
        basic.showIcon(IconNames.SmallDiamond);

        let score = 0;
        let requiredScore = 40;
        let startTime = control.millis();

        // Loop Kalibrasi
        while (score < requiredScore) {
            // Timeout 20 detik (beri waktu lebih lama untuk putar 3D)
            if (control.millis() - startTime > 20000) break;

            let raw = readRawMag();
            let x = raw[0];
            let y = raw[1];
            let z = raw[2];
            
            let isNewRecord = false;

            // Cek Rekor Baru (X, Y, dan Z)
            if (x < minX - 2) { minX = x; isNewRecord = true; }
            if (x > maxX + 2) { maxX = x; isNewRecord = true; }
            if (y < minY - 2) { minY = y; isNewRecord = true; }
            if (y > maxY + 2) { maxY = y; isNewRecord = true; }
            if (z < minZ - 2) { minZ = z; isNewRecord = true; }
            if (z > maxZ + 2) { maxZ = z; isNewRecord = true; }

            if (isNewRecord) {
                score++;
                startTime = control.millis(); // Reset timer
            }

            // Visualisasi Progress (Diamond membesar)
            if (score < 10) basic.showIcon(IconNames.SmallDiamond, 0); 
            else if (score < 20) basic.showIcon(IconNames.SmallSquare, 0);
            else if (score < 30) basic.showIcon(IconNames.Diamond, 0);
            else basic.showIcon(IconNames.Square, 0);
            
            basic.pause(20);
        }

        // Simpan Hasil Offset Baru
        // Syarat sukses: minimal ada variasi data di X, Y, dan Z
        if (minX != 32000 && maxX != -32000 && minZ != 32000) {
            magOffsetX = (maxX + minX) / 2;
            magOffsetY = (maxY + minY) / 2;
            magOffsetZ = (maxZ + minZ) / 2; // Hitung offset Z juga
            
            basic.clearScreen();
            basic.showIcon(IconNames.Yes);
        } else {
            basic.clearScreen();
            basic.showIcon(IconNames.No);
        }
        basic.pause(1000);
        basic.clearScreen();
    }

    // [Block "Compass Heading"]

    //% help=input/compass-heading
    //% weight=10
    //% blockId=device_heading block="compass heading (°)"
    //% parts="magnetometer"
    export function compassHeading(): number {
        if (!isMagInitialized) { initMagnetometer(); basic.pause(20); }

        try {
            pins.i2cWriteNumber(MAG_ADDR, WHO_AM_I_REG, NumberFormat.UInt8BE);
            // Baca dummy saja
            pins.i2cReadNumber(MAG_ADDR, NumberFormat.UInt8LE);
        } catch(e) { return 0; }

        let raw = readRawMag();
        
        // Gunakan offset yang sudah dikalibrasi
        let x_centered = raw[0] - magOffsetX;
        let y_centered = raw[1] - magOffsetY;

        // Heading hanya butuh X dan Y (untuk kompas datar)
        let heading = Math.atan2(y_centered, x_centered) * 180 / Math.PI;

        if (heading < 0) heading += 360;
        heading = (heading + ROTATION_OFFSET) % 360;

        return Math.floor(heading);
    }
}