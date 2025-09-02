#ifndef PXTADDON_H
#define PXTADDON_H

#define DEBUG_IMAGES 1
#define DEBUG_ATTINY 1

#pragma GCC diagnostic ignored "-Wunused-parameter"

#include "XirkaBitCompat.h"
#include "serial-target.h"

namespace pxt {

// Serial comms to ATtiny on board
namespace serialXirkabit {
  void sendCommand(const char *cmd, const char *value);
}

// Image handling
class RefMImage : public RefObject {
  public:
    ImageData *img;

    RefMImage(ImageData *d);
    void makeWritable();
    static void destroy(RefMImage *map);
    static void print(RefMImage *map);
    static void scan(RefMImage *t);
    static unsigned gcsize(RefMImage *t);
};

typedef uint32_t ImageLiteral_;

static inline ImageData *imageBytes(ImageLiteral_ lit) {
    return (ImageData *)lit;
}

typedef RefMImage *BlocklyImage;

struct XirkaBitImage {
  uint8_t data[5];
};

}

// MakeCode blocks
namespace loops {
  void pause(int);
}
namespace pins {
  DigitalInOutPin pinByCfg(int key);
}
namespace serial {
  SerialDevice internalCreateSerialDevice(DigitalInOutPin tx, DigitalInOutPin rx, int id);
}

#endif
