#include "pxt.h"
#include "pxtAddon.h"

#if DEBUG_IMAGES
#include <cstdio>
#endif

PXT_VTABLE(RefMImage, ValType::Object)

RefMImage::RefMImage(ImageData *d) : PXT_VTABLE_INIT(RefMImage), img(d) {
    img->incr();
}

void RefMImage::destroy(RefMImage *t) {
    t->img->decr();
}

void RefMImage::print(RefMImage *t) {
    DMESG("RefMImage %p size=%d x %d", t, t->img->width, t->img->height);
}

void RefMImage::makeWritable() {
    if (img->isReadOnly()) {
        MicroBitImage i(img);
        img = i.clone().leakData();
    }
}

void RefMImage::scan(RefMImage *t) {}

unsigned RefMImage::gcsize(RefMImage *t) {
    return (sizeof(*t) + 3) >> 2;
}

/**
 * Creation, manipulation and display of LED images.
 */
//% color=#7600A8 weight=31 icon="\uf03e"
//% advanced=true
namespace images {
/**
 * Creates an image that fits on the LED screen.
 */
//% weight=75 help=images/create-image
//% blockId=device_build_image block="create image"
//% parts="ledmatrix"
BlocklyImage createImage(ImageLiteral_ leds) {
#if DEBUG_IMAGES
    static const char msg[] = "createImage\r\n";
    sendSerial(msg, sizeof(msg));

    char msg2[128];
    snprintf(msg2, 127, "Ptr: %0p Data: 0x%0X\r\n", leds, *(uint32_t*)leds);
    sendSerial(msg2, strlen(msg2));
#endif
    BlocklyImage img = NEW_GC(RefMImage, imageBytes(leds));
#if DEBUG_IMAGES
    snprintf(msg2, 127, "Created: %0p\r\n", img);
    sendSerial(msg2, strlen(msg2));
#endif
    return img;
}

/**
 * Creates an image with 2 frames.
 */
//% weight=74 help=images/create-big-image
//% blockId=device_build_big_image block="create big image" imageLiteral=2
//% parts="ledmatrix"
BlocklyImage createBigImage(ImageLiteral_ leds) {
    return createImage(leds);
}

//%
Buffer charCodeBuffer(int charCode) {
    if(charCode < MICROBIT_FONT_ASCII_START || charCode > MICROBIT_FONT_ASCII_END)
        return NULL;
// #if MICROBIT_CODAL
    auto font = codal::BitmapFont::getSystemFont();
// #else
//     auto font = MicroBitFont::getSystemFont();
// #endif
    const int offset = (charCode - MICROBIT_FONT_ASCII_START) * 5;;
    const uint8_t* charBuffer = font.characters + offset;
    
    return PXT_CREATE_BUFFER(charBuffer, 5);
}

} // namespace images

namespace BlocklyImageMethods {

/**
 * Plots the image at a given column to the screen
 */
//% help=images/plot-image
//% parts="ledmatrix"
void plotImage(BlocklyImage sprite, int xOffset = 0) {
    // uBit.display.print(MicroBitImage(i->img), -xOffset, 0, 0, 0);
#if DEBUG_IMAGES
    static const char msg[] = "plotImage\r\n";
    sendSerial(msg, sizeof(msg));

    char msg2[128];
    snprintf(msg2, 127, "Width: %d Height: %d Ptr: %0p\r\n",
        sprite->img->width,
        sprite->img->height,
        sprite->img->data
    );
    sendSerial(msg2, strlen(msg2));
    for(int i=0; i < 5; i++){
        msg2[0] = '\0';
        if(i >= sprite->img->height){
            snprintf(msg2, 127, ". . . . .\r\n");
            sendSerial(msg2, strlen(msg2));
            continue;
        }

        for(int j=0; j < 5; j++){
            char msg3[3] = "  ";
            msg3[0] = 
                ((j+xOffset) >= sprite->img->width) ? '.' :
                sprite->img->data[i*sprite->img->width + j + xOffset] ? '#' : '.'
            ;
            strncat(msg2, msg3, 128-strlen(msg2));
        }
        strncat(msg2, "\r\n", 128-strlen(msg2));
        sendSerial(msg2, strlen(msg2));

    }
#endif
}

/**
 * Shows an frame from the image at offset ``x offset``.
 * @param xOffset column index to start displaying the image
 * @param interval time in milliseconds to pause after drawing
 */
//% help=images/show-image weight=80 blockNamespace=images
//% blockId=device_show_image_offset block="show image %sprite(myImage)|at offset %offset ||and interval (ms) %interval"
//% interval.defl=400
//% blockGap=8 parts="ledmatrix" async
void showImage(BlocklyImage sprite, int xOffset, int interval = 400) {
    // uBit.display.print(MicroBitImage(sprite->img), -xOffset, 0, 0, interval);
#if DEBUG_IMAGES
    static const char msg[] = "showImage is ";
    sendSerial(msg, sizeof(msg));
#endif
    plotImage(sprite, xOffset);
    loops::pause(interval);
}

/**
 * Draws the ``index``-th frame of the image on the screen.
 * @param xOffset column index to start displaying the image
 */
//% help=images/plot-frame weight=80
//% parts="ledmatrix"
void plotFrame(BlocklyImage i, int xOffset) {
    // TODO showImage() used in original implementation
#if DEBUG_IMAGES
    static const char msg[] = "plotFrame is ";
    sendSerial(msg, sizeof(msg));
#endif
    plotImage(i, xOffset * i->img->height);
}

/**
 * Scrolls an image.
 * @param frameOffset x offset moved on each animation step, eg: 1, 2, 5
 * @param interval time between each animation step in milli seconds, eg: 200
 */
//% help=images/scroll-image weight=79 async blockNamespace=images
//% blockId=device_scroll_image
//% block="scroll image %sprite(myImage)|with offset %frameoffset|and interval (ms) %delay"
//% blockGap=8 parts="ledmatrix"
void scrollImage(BlocklyImage id, int frameOffset, int interval) {
#if DEBUG_IMAGES
    static const char msg[] = "scrollImage\r\n";
    sendSerial(msg, sizeof(msg));
#endif
    MicroBitImage i(id->img);
    // uBit.display.animate(i, interval, frameOffset, MICROBIT_DISPLAY_ANIMATE_DEFAULT_POS, 0);
}

/**
 * Sets all pixels off.
 */
//% help=images/clear
//% parts="ledmatrix"
void clear(BlocklyImage i) {
    i->makeWritable();
    MicroBitImage(i->img).clear();
}

/**
 * Sets a specific pixel brightness at a given position
 */
//%
//% parts="ledmatrix"
void setPixelBrightness(BlocklyImage i, int x, int y, int value) {
    i->makeWritable();
    MicroBitImage(i->img).setPixelValue(x, y, value);
}

/**
 * Gets the pixel brightness ([0..255]) at a given position
 */
//%
//% parts="ledmatrix"
int pixelBrightness(BlocklyImage i, int x, int y) {
    int pix = MicroBitImage(i->img).getPixelValue(x, y);
    if (pix < 0)
        return 0;
    return pix;
}

/**
 * Gets the width in columns
 */
//% help=functions/width
int width(BlocklyImage i) {
    return i->img->width;
}

/**
 * Gets the height in rows (always 5)
 */
//%
int height(BlocklyImage i) {
    return i->img->height;
}

/**
 * Set a pixel state at position ``(x,y)``
 * @param x pixel column
 * @param y pixel row
 * @param value pixel state
 */
//% help=images/set-pixel
//% parts="ledmatrix"
void setPixel(BlocklyImage i, int x, int y, bool value) {
    setPixelBrightness(i, x, y, value ? 255 : 0);
}

/**
 * Get the pixel state at position ``(x,y)``
 * @param x pixel column
 * @param y pixel row
 */
//% help=images/pixel
//% parts="ledmatrix"
bool pixel(BlocklyImage i, int x, int y) {
    return pixelBrightness(i, x, y) > 0;
}

/**
 * Show a particular frame of the image strip.
 * @param frame image frame to show
 */
//% weight=70 help=images/show-frame
//% parts="ledmatrix" async
void showFrame(BlocklyImage i, int frame, int interval = 400) {
#if DEBUG_IMAGES
    static const char msg[] = "showFrame is ";
    sendSerial(msg, sizeof(msg));
#endif
    showImage(i, frame * i->img->height, interval);
}
} // namespace BlocklyImageMethods
