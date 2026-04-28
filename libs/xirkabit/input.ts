
const enum TouchPin {
  P0 = DAL.CFG_PIN_P0,
  P1 = DAL.CFG_PIN_P1,
  P2 = DAL.CFG_PIN_P2
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
  
  /**
     * Reads the light level applied to the LED screen in a range from ``0`` (dark) to ``255`` bright.
     */
    //% help=input/light-level weight=57
    //% blockId=device_get_light_level block="light level" blockGap=8
    //% parts="ledmatrix"
    export function lightLevel(): number {
        return lightLevelInternal();
    }

    //% shim=xirkabit::lightLevelInternal
    declare function lightLevelInternal(): number;
}
