// Auto-generated. Do not edit.


    /**
     * Creation, manipulation and display of LED images.
     */
    //% color=#7600A8 weight=31 icon="\uf03e"
    //% advanced=true
declare namespace images {

    /**
     * Creates an image that fits on the LED screen.
     */
    //% weight=75 help=images/create-image
    //% blockId=device_build_image block="create image"
    //% parts="ledmatrix" imageLiteral=1 shim=images::createImage
    function createImage(leds: string): BlocklyImage;

    /**
     * Creates an image with 2 frames.
     */
    //% weight=74 help=images/create-big-image
    //% blockId=device_build_big_image block="create big image" imageLiteral=2
    //% parts="ledmatrix" shim=images::createBigImage
    function createBigImage(leds: string): BlocklyImage;
}


declare interface BlocklyImage {
    /**
     * Plots the image at a given column to the screen
     */
    //% help=images/plot-image
    //% parts="ledmatrix" xOffset.defl=0 shim=BlocklyImageMethods::plotImage
    plotImage(xOffset?: int32): void;

    /**
     * Shows an frame from the image at offset ``x offset``.
     * @param xOffset column index to start displaying the image
     * @param interval time in milliseconds to pause after drawing
     */
    //% help=images/show-image weight=80 blockNamespace=images
    //% blockId=device_show_image_offset block="show image %sprite(myImage)|at offset %offset ||and interval (ms) %interval"
    //%
    //% blockGap=8 parts="ledmatrix" async interval.defl=400 shim=BlocklyImageMethods::showImage
    showImage(xOffset: int32, interval?: int32): void;

    /**
     * Draws the ``index``-th frame of the image on the screen.
     * @param xOffset column index to start displaying the image
     */
    //% help=images/plot-frame weight=80
    //% parts="ledmatrix" shim=BlocklyImageMethods::plotFrame
    plotFrame(xOffset: int32): void;

    /**
     * Scrolls an image.
     * @param frameOffset x offset moved on each animation step, eg: 1, 2, 5
     * @param interval time between each animation step in milli seconds, eg: 200
     */
    //% help=images/scroll-image weight=79 async blockNamespace=images
    //% blockId=device_scroll_image
    //% block="scroll image %sprite(myImage)|with offset %frameoffset|and interval (ms) %delay"
    //% blockGap=8 parts="ledmatrix" shim=BlocklyImageMethods::scrollImage
    scrollImage(frameOffset: int32, interval: int32): void;

    /**
     * Sets all pixels off.
     */
    //% help=images/clear
    //% parts="ledmatrix" shim=BlocklyImageMethods::clear
    clear(): void;

    /**
     * Sets a specific pixel brightness at a given position
     */
    //%
    //% parts="ledmatrix" shim=BlocklyImageMethods::setPixelBrightness
    setPixelBrightness(x: int32, y: int32, value: int32): void;

    /**
     * Gets the pixel brightness ([0..255]) at a given position
     */
    //%
    //% parts="ledmatrix" shim=BlocklyImageMethods::pixelBrightness
    pixelBrightness(x: int32, y: int32): int32;

    /**
     * Gets the width in columns
     */
    //% help=functions/width shim=BlocklyImageMethods::width
    width(): int32;

    /**
     * Gets the height in rows (always 5)
     */
    //% shim=BlocklyImageMethods::height
    height(): int32;

    /**
     * Set a pixel state at position ``(x,y)``
     * @param x pixel column
     * @param y pixel row
     * @param value pixel state
     */
    //% help=images/set-pixel
    //% parts="ledmatrix" shim=BlocklyImageMethods::setPixel
    setPixel(x: int32, y: int32, value: boolean): void;

    /**
     * Get the pixel state at position ``(x,y)``
     * @param x pixel column
     * @param y pixel row
     */
    //% help=images/pixel
    //% parts="ledmatrix" shim=BlocklyImageMethods::pixel
    pixel(x: int32, y: int32): boolean;

    /**
     * Show a particular frame of the image strip.
     * @param frame image frame to show
     */
    //% weight=70 help=images/show-frame
    //% parts="ledmatrix" async interval.defl=400 shim=BlocklyImageMethods::showFrame
    showFrame(frame: int32, interval?: int32): void;
}

// Auto-generated. Do not edit. Really.
