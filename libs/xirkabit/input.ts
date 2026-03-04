
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

// ==========================================
// ESP32-CAM AI VISION EXTENSION (HUSKYLENS ARCHITECTURE)
// ==========================================

//% color="#d65cd6" weight=20 icon="\uf030" block="ESP32-CAM"
namespace esp32cam {

    // --- ALAMAT I2C ---
    const ADDR_HAND = 0x20; // Alamat ESP32-CAM (Hand Detection)
    const ADDR_FACE = 0x21; // Alamat ESP32-CAM (Face Detection)

    export enum CameraMode {
        //% block="Face Camera"
        Face = ADDR_FACE,
        //% block="Hand Camera"
        Hand = ADDR_HAND
    }

    export enum DetectedObject {
        //% block="Open Hand"
        Open = 1,
        //% block="Closed Hand"
        Closed = 2
    }

    // Variabel Memori (Buffer) untuk menyimpan hasil "Request Data Once"
    let _activeCamera = ADDR_FACE; // Default kamera aktif
    let _lastX = 0;
    let _lastY = 0;
    let _lastW = 0;
    let _lastH = 0;
    let _lastID = 0;

    // ==========================================
    // BAGIAN 1: SETUP & REQUEST DATA (JANTUNG SISTEM)
    // ==========================================

    /**
     * Memilih ESP32-CAM mana yang akan diajak berkomunikasi (Wajah atau Tangan).
     */
    //% block="ESP32-CAM set active camera to %camType"
    //% group="1. Setup & Request"
    //% weight=100
    export function setActiveCamera(camType: CameraMode): void {
        _activeCamera = camType;
        // Bersihkan memori saat ganti kamera agar data tidak tercampur
        _lastX = 0; _lastY = 0; _lastW = 0; _lastH = 0; _lastID = 0;
    }

    /**
     * Mengecek koneksi kabel I2C. Program akan tertahan di blok ini 
     * sampai ESP32-CAM benar-benar terhubung dan merespons.
     */
    //% block="ESP32-CAM initialize I2C until success"
    //% group="1. Setup & Request"
    //% weight=110
    export function initializeI2C(): void {
        let isConnected = false;
        
        while (!isConnected) {
            try {
                // Mencoba "mengetuk pintu" dengan membaca 1 byte dummy
                // Jika I2C tidak terhubung, biasanya akan menghasilkan error atau buffer kosong
                let ping = pins.i2cReadBuffer(_activeCamera, 1, false);
                
                // Asumsi jika berhasil membaca sesuatu, berarti perangkat terhubung
                isConnected = true; 
            } catch (e) {
                isConnected = false;
            }

            // Jika belum terhubung, beri jeda setengah detik lalu coba lagi
            if (!isConnected) {
                basic.pause(500); 
            }
        }
    }

    /**
     * Meminta data dari kamera aktif SATU KALI dan menyimpannya ke memori (result).
     * PENTING: Taruh blok ini di bagian paling atas dalam blok "Forever".
     */
    //% block="ESP32-CAM request data once and save into the result"
    //% group="1. Setup & Request"
    //% weight=90
    export function requestDataOnce(): void {
        // 1. Reset ID ke 0 di awal (Asumsi tidak ada objek sebelum dibuktikan)
        _lastID = 0; 

        try {
            // 2. Ketuk pintu I2C sekali saja
            let buf = pins.i2cReadBuffer(_activeCamera, 16, false);
            
            // 3. Validasi Protokol (0x55, 0xAA)
            if (buf[0] == 0x55 && buf[1] == 0xAA) {
                let sum = 0;
                for (let i = 0; i < 15; i++) {
                    sum += buf[i];
                }
                
                // 4. Jika valid, simpan ke saku/memori XirkaBit (result)
                if ((sum & 0xFF) == buf[15]) {
                    _lastX = buf[5] | (buf[6] << 8);
                    _lastY = buf[7] | (buf[8] << 8);
                    _lastW = buf[9] | (buf[10] << 8);
                    _lastH = buf[11] | (buf[12] << 8);
                    _lastID = buf[13] | (buf[14] << 8);
                }
            }
        } catch (e) {
            // Jika kabel I2C copot, program Xirka tidak akan crash
        }
    }

    // ==========================================
    // BAGIAN 2: LOGIKA PENGECEKAN (MEMBACA DARI MEMORI LOKAL)
    // ==========================================

    /**
     * Mengecek apakah wajah terdeteksi dari memori result terakhir.
     */
    //% block="ESP32-CAM check if face is on screen from the result"
    //% group="2. Detection Logic"
    //% weight=80
    export function isFaceOnScreen(): boolean {
        // Pastikan kita sedang mode Face, dan ID-nya adalah 1
        if (_activeCamera == ADDR_FACE) {
            return _lastID == 1; 
        }
        return false;
    }

    /**
     * Mengecek apakah bentuk tangan tertentu terdeteksi dari memori result terakhir.
     */
    //% block="ESP32-CAM check if hand %obj is on screen from the result"
    //% group="2. Detection Logic"
    //% weight=70
    export function isHandOnScreen(obj: DetectedObject): boolean {
        // Pastikan kita sedang mode Hand, dan ID-nya cocok
        if (_activeCamera == ADDR_HAND) {
            return _lastID == obj;
        }
        return false;
    }

    /**
     * Mengecek apakah ada objek apa pun (kotak merah) yang terdeteksi di layar.
     */
    //% block="ESP32-CAM check if any frame is on screen from the result"
    //% group="2. Detection Logic"
    //% weight=60
    export function isAnyFrameOnScreen(): boolean {
        return _lastID > 0;
    }

    // ==========================================
    // BAGIAN 3: KOORDINAT OBJEK (DARI MEMORI LOKAL)
    // ==========================================
    
    /**
     * Mendapatkan nilai X (kiri ke kanan) dari memori result.
     */
    //% block="ESP32-CAM get X center from the result"
    //% group="3. Object Coordinates"
    //% weight=50
    export function getX(): number {
        return _lastX;
    }

    /**
     * Mendapatkan nilai Y (atas ke bawah) dari memori result.
     */
    //% block="ESP32-CAM get Y center from the result"
    //% group="3. Object Coordinates"
    //% weight=40
    export function getY(): number {
        return _lastY;
    }

    /**
     * Mendapatkan lebar (Width) kotak objek dari memori result.
     */
    //% block="ESP32-CAM get Width from the result"
    //% group="3. Object Coordinates"
    //% weight=30
    export function getW(): number {
        return _lastW;
    }

    /**
     * Mendapatkan tinggi (Height) kotak objek dari memori result.
     */
    //% block="ESP32-CAM get Height from the result"
    //% group="3. Object Coordinates"
    //% weight=20
    export function getH(): number {
        return _lastH;
    }
}