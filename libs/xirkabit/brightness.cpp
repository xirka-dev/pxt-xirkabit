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

    //% blockHidden=true
    void flushBrightness()
    {
        char buf[160];
        float scale = globalBrightness / 255.0f;

        snprintf(buf, 159, "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]",
            fb_brightness[0][0], fb_brightness[0][1], fb_brightness[0][2], fb_brightness[0][3], fb_brightness[0][4],
            fb_brightness[1][0], fb_brightness[1][1], fb_brightness[1][2], fb_brightness[1][3], fb_brightness[1][4],
            fb_brightness[2][0], fb_brightness[2][1], fb_brightness[2][2], fb_brightness[2][3], fb_brightness[2][4],
            fb_brightness[3][0], fb_brightness[3][1], fb_brightness[3][2], fb_brightness[3][3], fb_brightness[3][4],
            fb_brightness[4][0], fb_brightness[4][1], fb_brightness[4][2], fb_brightness[4][3], fb_brightness[4][4]
        );

        while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("LBMTRX", buf, false);
        pxt::serialXirkabit::serialBusy = false;

        memset(dirty, 0, sizeof(dirty));
    }

    void tickBrightness() {
        if (!brightnessDirty) return;
        brightnessDirty = false;
        flushBrightness();
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
