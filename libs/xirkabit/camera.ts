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