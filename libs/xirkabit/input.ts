const enum TouchPin {
  P0 = DAL.CFG_PIN_P0,
  P1 = DAL.CFG_PIN_P1,
  P2 = DAL.CFG_PIN_P2,
}

enum TouchEvent {
  //% block="pressed"
  Pressed = 1,
  //% block="released"
  Released = 2,
  //% block="touched"
  Touched = 3,
  //% block="long pressed"
  LongPressed = 4,
}

// Enum untuk UI Dropdown
const enum DetectedSound {
  //% block="quiet"
  Quiet = 1,
  //% block="loud"
  Loud = 2,
}

const enum SoundThreshold {
  //% block="quiet"
  Quiet = 1,
  //% block="loud"
  Loud = 2,
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

namespace input {
  let adcBusy = false;
  const DEVICE_ID_MICROPHONE = 3001; // ID unik untuk event suara
  const DEVICE_ID_LOGO = 3002;

  let sensorsInitialized = false;
  let currentLogoValue = 0;
  let isLogoPressed = false;
  let logoStartTime = 0;
  let longPressDone = false;

  let logoBaseline = 933; // Default, akan diupdate otomatis

  function initSensors(): void {
    if (sensorsInitialized) return;
    sensorsInitialized = true;

    control.inBackground(() => {
      const logoPin = pins.pinByCfg(DAL.CFG_PIN_B2) as AnalogInPin;
      if (!logoPin) return;

      // --- TAHAP KALIBRASI OTOMATIS ---
      // Ambil rata-rata 5 sampel saat startup sebagai baseline baru
      let sum = 0;
      for (let i = 0; i < 5; i++) {
        sum += logoPin.analogRead();
        basic.pause(50);
      }
      logoBaseline = sum / 5;
      // -------------------------------

      while (true) {
        if (!adcBusy) {
          adcBusy = true;
          let val = logoPin.analogRead();
          adcBusy = false;

          if (val > 0) {
            currentLogoValue = val;
            processLogoLogic(val);
          }
        }
        basic.pause(20); // Dipercepat ke 20ms agar lebih responsif di EduBit
      }
    });
  }
  let releaseCounter = 0;
  function processLogoLogic(currentVal: number) {
    let now = control.millis();
    let delta = Math.abs(currentVal - logoBaseline);

    const TOUCH_THRESHOLD = 50;
    const RELEASE_THRESHOLD = 30;
    const LONG_PRESS_MS = 1000;

    if (!isLogoPressed) {
      // --- FASE 1: MENYENTUH (TOUCHED) ---
      if (delta > TOUCH_THRESHOLD) {
        isLogoPressed = true;
        logoStartTime = now;
        releaseCounter = 0;
        // Kirim event Touched
        control.raiseEvent(DEVICE_ID_LOGO, TouchEvent.Touched);
      }
    } else {
      // --- FASE 2: SEDANG MENEMPEL ---
      // Kita membiarkan loop berjalan tanpa mengirim event
      // agar tidak menumpuk di antrian micro:bit.

      // --- FASE 3: MELEPASKAN JARI ---
      if (delta < RELEASE_THRESHOLD) {
        releaseCounter++;

        // Gunakan verifikasi yang lebih kuat (5x pembacaan = 100ms)
        // agar layar LED punya waktu untuk bernapas
        if (releaseCounter >= 5) {
          let duration = now - logoStartTime;
          isLogoPressed = false;
          releaseCounter = 0;

          // URUTAN EVENT YANG BENAR:
          // 1. Kirim Released dulu
          control.raiseEvent(DEVICE_ID_LOGO, TouchEvent.Released);

          // 2. Beri jeda sangat singkat agar event Released sempat diproses
          control.waitMicros(1000);

          // 3. Kirim Pressed atau LongPressed
          if (duration >= LONG_PRESS_MS) {
            control.raiseEvent(DEVICE_ID_LOGO, TouchEvent.LongPressed);
          } else {
            // Pastikan bukan noise (min 100ms)
            if (duration > 100) {
              control.raiseEvent(DEVICE_ID_LOGO, TouchEvent.Pressed);
            }
          }
        }
      } else {
        releaseCounter = 0;
      }
    }
  }
  // ==========================================
  // 1. MAGNETOMETER CONFIG & CALIBRATION
  // ==========================================
  const MAG_ADDR = 0x1e;
  const OUTX_L_REG_M = 0x68;
  const WHO_AM_I_REG = 0x4f;
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
    buf[0] = 0x60;
    buf[1] = 0x00; // Continuous mode
    pins.i2cWriteBuffer(MAG_ADDR, buf);
    buf[0] = 0x62;
    buf[1] = 0x01; // BDU enabled
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
  //% parts="magnetometer"initMicrophone
  export function compassHeading(): number {
    if (!isMagInitialized) {
      initMagnetometer();
      basic.pause(20);
    }

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
    let heading = (Math.atan2(y_centered, x_centered) * 180) / Math.PI;

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
    if (!pin) return false;
    pin.setPull(PinPullMode.PullUp);
    return pin.digitalRead() == false;
  }

  /**
   * Panggil fungsi C++ melalui shim
   */
  //% shim=input::getRawSoundLevel
  function getRawSoundLevel(): number {
    // Baris ini akan diabaikan oleh compiler saat dijalankan di hardware,
    // karena akan langsung memanggil fungsi di input.cpp
    return 0;
  }

  /**
   * Membaca tingkat suara (0-255).
   */
  //% help=input/sound-level
  //% blockId=device_get_sound_level block="sound level"
  //% parts="microphone" weight=34 group="microphone"
  export function soundLevel(): number {
    // Beri jeda kecil agar ADC tidak dikunci terus menerus oleh Logo
    if (adcBusy) {
      basic.pause(5);
      if (adcBusy) return 0;
    }
    // Panggil shim C++ (getRawSoundLevel)
    return getRawSoundLevel();
  }

  /**
   * Beraksi ketika suara keras atau pelan terdengar.
   */
  //% blockId=input_on_sound block="on %sound sound"
  //% group="microphone" weight=88
  export function onSound(sound: DetectedSound, handler: () => void): void {
    initSensors(); // Pastikan loop berjalan
    control.onEvent(DEVICE_ID_MICROPHONE, <number>sound, handler);
  }

  /**
   * Mengatur ambang batas suara di sisi C++.
   */
  //% blockId=input_set_sound_threshold block="set %sound sound threshold to %value"
  //% value.min=0 value.max=255 value.defl=128
  //% group="microphone" weight=10
  //% shim=input::setSoundThresholdCpp
  export function setSoundThreshold(
    sound: SoundThreshold,
    value: number,
  ): void {
    return;
  }

  /**
   * Jalankan kode ketika logo disentuh.
   */
  //% blockId=device_on_logo_event block="on logo %event"
  //% weight=95
  export function onLogoEvent(event: TouchEvent, handler: () => void) {
    initSensors();
    // Menggunakan control.onEvent dengan ID unik dan nilai event
    control.onEvent(DEVICE_ID_LOGO, event, handler);
  }

  /**
   * Membaca nilai analog logo.
   */
  //% blockId=device_get_logo_level block="logo level"
  //% weight=34 group="logo"
  export function logoLevel(): number {
    initSensors();
    return currentLogoValue;
  }
}
