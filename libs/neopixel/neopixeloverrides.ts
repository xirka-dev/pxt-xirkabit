
/**
 * Functions to operate NeoPixel strips.
 */
//% weight=5 color=#2699BF icon="\uf110"
namespace neopixel {

    export class NeoPixelStrip extends light.NeoPixelStrip {
        showColor(color: number): void {
            this.setAll(color);
        }
    }

    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the strip, eg: 24,30,60,64
     */
    //% blockId="neopixel_create2" block="NeoPixel at pin %pin|with %numleds|leds as %mode"
    //% weight=90 blockGap=8
    //% parts="neopixel"
    //% trackArgs=0,2
    //% blockSetVariable=strip
    export function create(
        pin: DigitalPin,
        numleds: number,
        mode: NeoPixelMode
    ): NeoPixelStrip {
        const strip = new NeoPixelStrip();
        strip._mode = mode;
        strip._length = Math.max(0, numleds | 0);
        strip._dataPin = pins.pinByCfg(pin);
        if (strip._dataPin) // board with on-board LEDs won't have a default pin
            strip._dataPin.digitalWrite(false);
        return strip;
    }
}
