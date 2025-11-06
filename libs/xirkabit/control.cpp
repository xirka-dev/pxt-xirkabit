#include "pxt.h"

namespace control {

    /**
     * Schedules code that run in the background.
     */
    //% help=control/in-background blockAllowMultiple=1 afterOnStart=true
    //% blockId="control_in_background" block="run in background" blockGap=8
    void inBackground(Action a) {
      runInParallel(a);
    }
}
