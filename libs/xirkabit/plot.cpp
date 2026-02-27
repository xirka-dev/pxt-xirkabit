#include "pxt.h"
#include "pxtAddon.h"
#include "stdio.h"

namespace led
{
    static bool matrixState[5][5] = {false};
    bool matrixDirty = false;

    static void flushMatrix() {
        char buf[32];
        snprintf(buf, sizeof(buf), "[%d,%d,%d,%d,%d]",
            (matrixState[0][0]<<4)|(matrixState[0][1]<<3)|(matrixState[0][2]<<2)|(matrixState[0][3]<<1)|matrixState[0][4],
            (matrixState[1][0]<<4)|(matrixState[1][1]<<3)|(matrixState[1][2]<<2)|(matrixState[1][3]<<1)|matrixState[1][4],
            (matrixState[2][0]<<4)|(matrixState[2][1]<<3)|(matrixState[2][2]<<2)|(matrixState[2][3]<<1)|matrixState[2][4],
            (matrixState[3][0]<<4)|(matrixState[3][1]<<3)|(matrixState[3][2]<<2)|(matrixState[3][3]<<1)|matrixState[3][4],
            (matrixState[4][0]<<4)|(matrixState[4][1]<<3)|(matrixState[4][2]<<2)|(matrixState[4][3]<<1)|matrixState[4][4]
        );

        while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("LMTRX", buf, false);
        pxt::serialXirkabit::serialBusy = false;
    }

    void tickMatrix() {
        if (!matrixDirty) return;
        matrixDirty = false;
        flushMatrix();
    }

    //% blockId=led_point block="point x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    bool point(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4)
            return false;
        return matrixState[y][x];
    }

    //% blockId=led_plot block="plot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    void plot(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        matrixState[y][x] = true;
        matrixDirty = true; 
    }

    //% blockId=led_unplot block="unplot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    void unplot(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        matrixState[y][x] = false;
        matrixDirty = true; 
    }

    //% blockId=led_toggle block="toggle x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    void toggle(int x, int y) {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        matrixState[y][x] = !matrixState[y][x];
        matrixDirty = true;
        sendSerial("toggle dirty\r\n", 14);
    }

    //% blockHidden=true
    void clearMatrix() {
        memset(matrixState, 0, sizeof(matrixState));
        flushMatrix();
    }
}