#ifndef PXTADDON_H
#define PXTADDON_H

#pragma GCC diagnostic ignored "-Wunused-parameter"

#include "XirkaBitCompat.h"

#ifdef CODAL_CONFIG_H
#define XIRKABIT_CODAL 1
#else
#define XIRKABIT_CODAL 0
#endif

namespace pxt {

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

#if XIRKABIT_CODAL
// avoid clashes with codal-defined classes
#define Image MImage
#endif

typedef RefMImage *Image;

}
#endif
