#ifndef XIRKABIT_IMAGES_H
#define XIRKABIT_IMAGES_H
#ifndef DONOTINCLUDE_H

#include "pxtAddon.h"

namespace images {
  BlocklyImage createImage(ImageLiteral_ leds);
}

namespace BlocklyImageMethods {
  void plotImage(BlocklyImage sprite, int xOffset = 0);
  void showImage(BlocklyImage sprite, int xOffset, int interval = 400);
}

#endif
#endif
