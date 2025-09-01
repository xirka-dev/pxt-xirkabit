#ifndef XIRKABIT_IMAGES_H
#define XIRKABIT_IMAGES_H
#ifndef DONOTINCLUDE_H

#include "pxtAddon.h"

namespace images {
  BlocklyImage createImage(ImageLiteral_ leds);
}

namespace BlocklyImageMethods {
  void plotImage(BlocklyImage sprite, int xOffset = 0);
}

#endif
#endif
