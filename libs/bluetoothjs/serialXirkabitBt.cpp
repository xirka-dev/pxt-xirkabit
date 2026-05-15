#include "pxtAddon.h"

namespace xirkabt {

  //%
  void beginJdy23() {
    pxt::serialXirkabit::sendCommand("BTRST", "0", true);
    pxt::serialXirkabit::sendCommand("BTPWRC", "1", true);
    fiber_sleep(100);
    pxt::serialXirkabit::sendCommand("BTRST", "1", true);
    fiber_sleep(100);
  }

} // namespace xirkabt
