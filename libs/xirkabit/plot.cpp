#include "pxt.h"
#include "pxtAddon.h"
#include "stdio.h"

namespace led
{
    bool matrixState[5][5] = {false};
    bool matrixDirty = false;

    static void flushMatrix() {
        static char buf[160];
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
    }

    void tickMatrix() {
        if (!matrixDirty && !brightnessDirty) return;
        matrixDirty = false;
        brightnessDirty = false;
        flushMatrix();
    }

    /**
     * Check if LED at (x,y) is on
     */
    //% blockId=led_point block="point x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4 weight=80
    bool point(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4)
            return false;
        return matrixState[y][x];
    }

    /**
     * Turn on an LED at position (x, y)
     */
    //% blockId=led_plot block="plot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=95 
    void plot(int x, int y)
    {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        matrixState[y][x] = true;
        matrixDirty = true; 
    }

    /**
     * Turn off an LED at position (x, y)
     */
    //% blockId=led_unplot block="unplot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=85
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
        matrixDirty = true; 
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

    /**
     * Cancels the current animation and clears other pending animations.
     */
    //% weight=70 help=led/stop-animation
    //% blockId=device_stop_animation block="stop animation"
    //% parts="ledmatrix"
    //% advanced=true
    void stopAnimation()
    {
        led::isShowingString = false;  // clear flag
    
        // while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        // pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("STOP", nullptr, false);
        // pxt::serialXirkabit::serialBusy = false;
        
        led::matrixDirty = true;
        led::tickMatrix();
    }
}