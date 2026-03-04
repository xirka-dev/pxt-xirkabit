#include "pxt.h"
#include "pxtAddon.h"
#include "stdio.h"

namespace led
{
    bool matrixState[5][5] = {false};
    bool matrixDirty = false;

    static void flushMatrix() {
        char buf[160];
        uint8_t onVal = (uint8_t)((globalBrightness));  // 0-255

        snprintf(buf, 159, "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]",
            matrixState[0][0]?onVal:0, matrixState[0][1]?onVal:0, matrixState[0][2]?onVal:0, matrixState[0][3]?onVal:0, matrixState[0][4]?onVal:0,
            matrixState[1][0]?onVal:0, matrixState[1][1]?onVal:0, matrixState[1][2]?onVal:0, matrixState[1][3]?onVal:0, matrixState[1][4]?onVal:0,
            matrixState[2][0]?onVal:0, matrixState[2][1]?onVal:0, matrixState[2][2]?onVal:0, matrixState[2][3]?onVal:0, matrixState[2][4]?onVal:0,
            matrixState[3][0]?onVal:0, matrixState[3][1]?onVal:0, matrixState[3][2]?onVal:0, matrixState[3][3]?onVal:0, matrixState[3][4]?onVal:0,
            matrixState[4][0]?onVal:0, matrixState[4][1]?onVal:0, matrixState[4][2]?onVal:0, matrixState[4][3]?onVal:0, matrixState[4][4]?onVal:0
        );

        while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("LBMTRX", buf, false);  // ganti dari LMTRX
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
    }

    //% blockHidden=true
    void clearMatrix() {
        memset(matrixState, 0, sizeof(matrixState));
        flushMatrix();
    }

    //% help=led/plot-bar-graph weight=20
    //% blockId=device_plot_bar_graph block="plot bar graph of %value up to %high"
    //% parts="ledmatrix"
    void plotBarGraph(int value, int high) {
        if (high <= 0) high = 1;
        if (value < 0) value = -value;

        float v = (float)value / high;
        float dv = 1.0f / 16.0f;
        float k = 0;

        for (int y = 4; y >= 0; y--) {
            for (int x = 0; x < 3; x++) {
                if (k > v) {
                    matrixState[y][2 - x] = false;
                    if ( x!= 0) matrixState[y][2 + x] = false;
                } else {
                    matrixState[y][2 - x] = true;
                    if ( x != 0) matrixState[y][2 + x] = true;
                }
                k += dv;
            }
        }

        matrixDirty = true;
        tickMatrix(); 
    }
}