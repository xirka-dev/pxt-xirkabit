#include "pxtAddon.h"
#include "math.h"

namespace xirkabit {

    //%
    int lightLevelInternal() {
        pxt::serialXirkabit::sendCommand("ALED", nullptr, false);

        int raw = pxt::serialXirkabit::readResponse();
        if (raw < 0) raw = 0;
        if (raw > 255 ) raw = 255;

        float norm = raw / 255.0f;
        float gamma = sqrt(norm);

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
