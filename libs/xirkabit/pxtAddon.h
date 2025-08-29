#ifndef PXTADDON_H
#define PXTADDON_H

#define DEBUG_IMAGES 1

#pragma GCC diagnostic ignored "-Wunused-parameter"

#include "XirkaBitCompat.h"

namespace pxt {

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

}

// MakeCode blocks
namespace loops {
  void pause(int);
}

#endif
