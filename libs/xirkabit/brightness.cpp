#include "pxt.h"
#include "pxtAddon.h"
#include <stdio.h>

//% color=#7600A8 weight=101 icon="\uf205"
namespace led
{
    static uint8_t fb_brightness[5][5];
    static bool dirty[5][5];
    static bool ledEnabled = true;
    bool brightnessDirty = false;
    uint8_t globalBrightness = 255;  // default full brightness
    uint8_t lastBrightness = globalBrightness;
    bool isShowingString = false;

    /**
     * Turn on the specified LED with specific brightness using x, y coordinates (x is horizontal, y is vertical). (0,0) is upper left.
     * @param x the horizontal coordinate of the LED starting at 0
     * @param y the vertical coordinate of the LED starting at 0
     * @param b the brightness from 0 (off) to 255 (bright), eg:255
     */
    //% help=led/plot-brightness weight=78
    //% blockId=device_plot_brightness block="plot|x %x|y %y|brightness %b" blockGap=8
    //% parts="ledmatrix"
    //% x.min=0 x.max=4 y.min=0 y.max=4 b.min=0 b.max=255
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    //% advanced=true
    void plotBrightness(int x, int y, int b)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        fb_brightness[y][x] = (uint8_t)b;
        dirty[y][x] = true;
        brightnessDirty = true;
    }

    int mergePixel(int y, int x) {
        float scale = globalBrightness / 255.0f;
        if (fb_brightness[y][x] > 0)
            return (int)(fb_brightness[y][x] * scale);
        if (matrixState[y][x])
            return (int)(globalBrightness);
        return 0;
    }

    //% blockHidden=true
    void flushBrightness() {
        char buf[160];
        snprintf(buf, 159, "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]",
            mergePixel(0,0), mergePixel(0,1), mergePixel(0,2), mergePixel(0,3), mergePixel(0,4),
            mergePixel(1,0), mergePixel(1,1), mergePixel(1,2), mergePixel(1,3), mergePixel(1,4),
            mergePixel(2,0), mergePixel(2,1), mergePixel(2,2), mergePixel(2,3), mergePixel(2,4),
            mergePixel(3,0), mergePixel(3,1), mergePixel(3,2), mergePixel(3,3), mergePixel(3,4),
            mergePixel(4,0), mergePixel(4,1), mergePixel(4,2), mergePixel(4,3), mergePixel(4,4)
        );

        // while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        // pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("LBMTRX", buf, false);
        // pxt::serialXirkabit::serialBusy = false;
        memset(dirty, 0, sizeof(dirty));
    }

    void tickBrightness() {
        if (!brightnessDirty) return;
        matrixDirty = true;
        brightnessDirty = false;
    }

    /**
     * Get the brightness state of the specified LED using x, y coordinates. (0,0) is upper left.
     * @param x the horizontal coordinate of the LED
     * @param y the vertical coordinate of the LED
     */
    //% help=led/point-brightness weight=76
    //% blockId=device_point_brightness block="point|x %x|y %y brightness"
    //% parts="ledmatrix"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    //% advanced=true
    int pointBrightness(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return 0;
        return (int)fb_brightness[y][x];
    }

    /**
     * Set the screen brightness from 0 (off) to 255 (full bright).
     * @param b the brightness value, eg:255, 127, 0
     */
    //% help=led/set-brightness weight=59
    //% blockId=device_set_brightness block="set brightness %b"
    //% parts="ledmatrix"
    //% advanced=true
    //% b.min=0 b.max=255
    void setBrightness(int b) {
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        if (!ledEnabled) {
            lastBrightness = (uint8_t)b;
            return;
        }
        globalBrightness = (uint8_t)b;
        if (!isShowingString) matrixDirty = true;   // trigger flush
    }

    /**
     * Get the screen brightness from 0 (off) to 255 (full bright).
     */
    //% help=led/brightness weight=60
    //% blockId=device_get_brightness block="brightness" blockGap=8
    //% parts="ledmatrix"
    //% advanced=true
    int brightness() {
        return (int)globalBrightness;
    }

    /**
    * Turns on or off the display
    */
    //% help=led/enable blockId=device_led_enable block="led enable %on"
    //% advanced=true parts="ledmatrix"
    void enable(bool on) {
        if(on == ledEnabled) return;

        if (on) {
            ledEnabled = on;
            setBrightness(lastBrightness);
        }
        else {
            lastBrightness = globalBrightness;
            setBrightness(0);
            ledEnabled = on;
        }
    }
}
