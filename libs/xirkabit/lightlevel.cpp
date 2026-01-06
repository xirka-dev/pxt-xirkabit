#include "pxtAddon.h"

namespace xirkabit {

    //%
    int lightLevelInternal() {
        pxt::serialXirkabit::sendCommand("ALED", nullptr, false);

        int lv = pxt::serialXirkabit::readResponse();
        //lv = lv / 4;

        if (lv < 0) lv = 0;
        if (lv > 255) lv = 255;

        return lv;
    }

}
