#include "pxtAddon.h"
#include "math.h"

namespace xirkabit {

    //%
    int lightLevelInternal() {
        while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
        pxt::serialXirkabit::serialBusy = true;
        pxt::serialXirkabit::sendCommand("ALED", nullptr, false);
        int raw = pxt::serialXirkabit::readResponse(800);
        pxt::serialXirkabit::serialBusy = false;

        if (raw < 0) raw = 0;
        float threshold = 20.0f;
        float max_input = 400.0f; // Senter maksimal di 400
        float cleaned;

        if (raw <= threshold) {
            cleaned = 0.0f;
        } else {
            cleaned = (float)(raw - threshold) / (max_input - threshold);
        }

        if (cleaned > 1.0f) cleaned = 1.0f;

        float gamma = powf(cleaned, 0.20f);

        int lv = (int)(gamma * 255.0f);

        if (lv > 255) lv = 255;
        if (lv < 0) lv = 0;
        /*
        if (lv < 0) lv = 0;
        if (lv > 255) lv = 255;
        */
        return lv;
    }

}
