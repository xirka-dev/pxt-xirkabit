#include "pxt.h"
#include "pxtAddon.h"
#include <stdio.h>

namespace led
{
    static uint8_t fb_brightness[5][5];
    static bool dirty[5][5];

    //% blockHidden=true
    void plotBrightness(int x, int y, int b)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4)
        {
            return;
        }

        if (b < 0)
        {
            b = 0;
        }
        else if (b > 255)
        {
            b = 255;
        }

        fb_brightness[y][x] = (uint8_t)b;
        dirty[y][x] = true;
    }

    //% blockHidden=true
    void flushBrightness()
    {
        char buf[20];

        for (int y = 0; y < 5; y++)
        {
            for (int x = 0; x < 5; x++)
            {
                if (!dirty[y][x]) continue;

                sprintf(buf, "%d,%d,%d", x, y, fb_brightness[y][x]);
                
                while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
                pxt::serialXirkabit::serialBusy = true;
                pxt::serialXirkabit::sendCommand("LBSET", buf, true);
                pxt::serialXirkabit::serialBusy = false;
                
                fiber_sleep(10);  // beri jeda ATtiny proses
                dirty[y][x] = false;
            }
        }
    }

    //% blockHidden=true
    /**
     * Get the brightness state of the specified LED using x, y coordinates. (0,0) is upper left.
     * @param x the horizontal coordinate of the LED
     * @param y the vertical coordinate of the LED
     */
    //% blockId=led_get_brightness block="point|x %x|y %y brightness"
    //% x.min=0 x.max=4
    //% y.min=0 y.max=4
    //% weight=85
    int getbrightness(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4)
        {
            return 0;
        }

        char buf[8];
        sprintf(buf, "%d,%d", x, y);

        while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("LBGET", buf, true);
        int val = pxt::serialXirkabit::readResponse(500);
        pxt::serialXirkabit::serialBusy = false;

        return val;
    }
}
