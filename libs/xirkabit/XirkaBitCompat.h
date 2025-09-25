#ifndef XIRKABITCOMPAT_H
#define XIRKABITCOMPAT_H

#include "codal-core/inc/types/BitmapFont.h"
#include "codal-core/inc/types/Image.h"
//#include "codal-core/inc/core/CodalComponent.h" // check path from libs/core---samd/dal.d.ts
//#include "codal-microbit-v2/inc/compat/MicroBitCompat.h" // check path from libs/core/dal.d.ts

#define MICROBIT_FONT_ASCII_END                                 BITMAP_FONT_ASCII_END
#define MICROBIT_FONT_ASCII_START                               BITMAP_FONT_ASCII_START

#define MICROBIT_ID_BUTTON_A                                    DEVICE_ID_BUTTON_A
#define MICROBIT_ID_BUTTON_B                                    DEVICE_ID_BUTTON_B
#define MICROBIT_ID_BUTTON_AB                                   DEVICE_ID_BUTTON_AB
#define MICROBIT_BUTTON_EVT_CLICK                               DEVICE_BUTTON_EVT_CLICK

//
// MicroBit types
//
typedef codal::Image MicroBitImage;

#endif
