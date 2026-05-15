#include "pxt.h"
#include "pxtAddon.h"
#include <stdio.h>

namespace led
{
    static uint8_t fb_brightness[5][5];
    static bool dirty[5][5];
    bool brightnessDirty = false;
    uint8_t globalBrightness = 255;  // default full brightness

    //% blockHidden=true
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

    //% blockId=led_point_brightness
    //% block="point x %x y %y brightness"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=84
    int pointBrightness(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return 0;
        return (int)fb_brightness[y][x];
    }

    //% blockId=led_set_brightness
    //% block="set brightness %b"
    //% b.min=0 b.max=255
    void setBrightness(int b) {
        if (b < 0) b = 0;
        if (b > 255) b = 255;
        globalBrightness = (uint8_t)b;
        matrixDirty = true;   // trigger flush
    }

    //% blockId=led_brightness_value
    //% block="brightness"
    int getBrightness() {
        return (int)globalBrightness;
    }
}
