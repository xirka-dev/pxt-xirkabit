const enum TouchPin {
    P0 = DAL.CFG_PIN_P0, P1 = DAL.CFG_PIN_P1, P2 = DAL.CFG_PIN_P2
}

namespace input {
    // --- KONFIGURASI SENSOR ---
    const MAG_ADDR = 0x1E;
    const OUTX_L_REG_M = 0x68;
    const WHO_AM_I_REG = 0x4F;
    const CHIP_ID_LSM303 = 0x40;

    // ==========================================
    // DATA KALIBRASI (HASIL PENGUKURAN ANDA)
    // ==========================================
    // X Range: -432 s/d 19   -> Tengahnya ~ -206
    // Y Range: -470 s/d -48  -> Tengahnya ~ -259
    const OFFSET_X = -206; 
    const OFFSET_Y = -259;
    
    // Rotasi pemasangan chip (agar Utara Board = Utara Bumi)
    const ROTATION_OFFSET = 190; 
    // ==========================================

    let isMagInitialized = false;

    function initMagnetometer() {
        let buf = pins.createBuffer(2);
        buf[0] = 0x60; buf[1] = 0x00; // Continuous mode
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        buf[0] = 0x62; buf[1] = 0x01; // BDU enabled
        pins.i2cWriteBuffer(MAG_ADDR, buf);
        isMagInitialized = true;
    }

    // --- FUNGSI WAJIB SYSTEM (JANGAN DIHAPUS) ---
    export function onButtonPressed(b: Button, a:()=>void){b.onEvent(ButtonEvent.Click,a);}
    export function runningTime(){return control.millis();}
    export function runningTimeMicros(){return control.micros();}
    export function onPinPressed(n:TouchPin,b:()=>void){const p=pins.pinByCfg(n) as DigitalInOutPin;if(p){p.setPull(PinPullMode.PullUp);p.onEvent(PinEvent.Fall,b);}}
    export function onPinReleased(n:TouchPin,b:()=>void){const p=pins.pinByCfg(n) as DigitalInOutPin;if(p){p.setPull(PinPullMode.PullUp);p.onEvent(PinEvent.Rise,b);}}
    export function pinIsPressed(n:TouchPin):boolean{const p=pins.pinByCfg(n) as DigitalInOutPin;if(!p)return false;p.setPull(PinPullMode.PullUp);return p.digitalRead()==false;}

    /**
     * Gets the compass heading in degrees (0 to 360).
     */
    //% help=input/compass-heading
    //% weight=10
    //% blockId=device_heading block="compass heading (°)"
    //% parts="magnetometer"
    export function compassHeading(): number {
        if (!isMagInitialized) { initMagnetometer(); basic.pause(20); }

        // 1. CEK SIMULATOR (Safety Check)
        // Kita pakai metode "KTP" (Who Am I)
        // Jika Simulator, kita return animasi putar biar gak bosan (angka 0)
        pins.i2cWriteNumber(MAG_ADDR, WHO_AM_I_REG, NumberFormat.UInt8BE);
        let whoami = pins.i2cReadNumber(MAG_ADDR, NumberFormat.UInt8LE);

        if (whoami != CHIP_ID_LSM303) {
            // Mode Simulator: Putar pelan berdasarkan waktu
            return (control.millis() / 50) % 360; 
        }

        // 2. BACA DATA SENSOR (HARDWARE ASLI)
        pins.i2cWriteNumber(MAG_ADDR, OUTX_L_REG_M, NumberFormat.UInt8BE);
        let data = pins.i2cReadBuffer(MAG_ADDR, 6);

        let x_raw = data.getNumber(NumberFormat.Int16LE, 0);
        let y_raw = data.getNumber(NumberFormat.Int16LE, 2); 
        
        // 3. TERAPKAN KALIBRASI (CENTERING)
        // Matematika: Kita geser titik pusatnya ke 0,0
        // Karena Offset nilainya minus (-206), maka: 
        // x - (-206) sama dengan x + 206.
        let x_centered = x_raw - OFFSET_X;
        let y_centered = y_raw - OFFSET_Y;

        // 4. HITUNG SUDUT
        let heading = Math.atan2(y_centered, x_centered) * 180 / Math.PI;

        // 5. NORMALISASI & ROTASI
        if (heading < 0) heading += 360;
        
        // Tambahkan koreksi rotasi 220 derajat
        heading = (heading + ROTATION_OFFSET) % 360;

        return Math.floor(heading);
    }
}