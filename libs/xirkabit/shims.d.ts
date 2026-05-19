// Auto-generated. Do not edit.


declare interface BlocklyImage {}


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


    /**
     * Provides access to basic micro:bit functionality.
     */
    //% color=#1E90FF weight=116 icon="\uf00a"
declare namespace basic {

    /**
     * Draws an image on the LED screen.
     * @param leds pattern of LEDs to turn on/off
     */
    //% help=basic/plot-leds weight=80
    //% parts="ledmatrix" imageLiteral=1 shim=basic::plotLeds
    function plotLeds(leds: string): void;

    /**
     * Draws an image on the LED screen.
     * @param leds the pattern of LED to turn on/off.
     * @param interval time in milliseconds to pause after drawing.
     */
    //% help=basic/show-leds
    //% weight=95 blockGap=8
    //% imageLiteral=1 async
    //% blockId=device_show_leds
    //% block="show leds" icon="\uf00a"
    //% parts="ledmatrix" interval.defl=400 shim=basic::showLeds
    function showLeds(leds: string, interval?: int32): void;

    /**
     * Turn off all LEDs
     */
    //% help=basic/clear-screen weight=79
    //% blockId=device_clear_display block="clear screen"
    //% parts="ledmatrix" shim=basic::clearScreen
    function clearScreen(): void;

    /**
     * Display text on the display, one character at a time. If the string fits on the screen (i.e. is one letter), does not scroll.
     * @param text the text to scroll on the screen, eg: "Hello!"
     * @param interval how fast to shift characters; eg: 150, 100, 200, -100
     */
    //% help=basic/show-string
    //% weight=87 blockGap=16
    //% block="show|string %text"
    //% async
    //% blockId=device_print_message
    //% parts="ledmatrix"
    //% text.shadowOptions.toString=true interval.defl=150 shim=basic::showString
    function showString(text: string, interval?: int32): void;

    /**
     * Shows a sequence of LED screens as an animation.
     * @param leds pattern of LEDs to turn on/off
     * @param interval time in milliseconds between each redraw.
     */
    //% help=basic/show-animation imageLiteral=1 async
    //% parts="ledmatrix" interval.defl=400 shim=basic::showAnimation
    function showAnimation(leds: string, interval?: int32): void;
}
declare namespace input {

    /**
     * Gets the temperature in Celsius degrees (°C).
     */
    //% weight=55
    //% help=input/temperature
    //% blockId=device_temperature block="temperature (°C)" blockGap=8
    //% parts="thermometer" shim=input::temperature
    function temperature(): int32;
}
declare namespace led {

    /**
     * Check if LED at (x,y) is on
     */
    //% blockId=led_point block="point x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4 weight=80 shim=led::point
    function point(x: int32, y: int32): boolean;

    /**
     * Turn on an LED at position (x, y)
     */
    //% blockId=led_plot block="plot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=95 shim=led::plot
    function plot(x: int32, y: int32): void;

    /**
     * Turn off an LED at position (x, y)
     */
    //% blockId=led_unplot block="unplot x %x y %y"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% weight=85 shim=led::unplot
    function unplot(x: int32, y: int32): void;

    /**
     * Cancels the current animation and clears other pending animations.
     */
    //% weight=70 help=led/stop-animation
    //% blockId=device_stop_animation block="stop animation"
    //% parts="ledmatrix"
    //% advanced=true shim=led::stopAnimation
    function stopAnimation(): void;
}



    //% color=#7600A8 weight=101 icon="\uf205"
declare namespace led {

    /**
     * Turn on the specified LED with specific brightness using x, y coordinates (x is horizontal, y is vertical). (0,0) is upper left.
     * @param x the horizontal coordinate of the LED starting at 0
     * @param y the vertical coordinate of the LED starting at 0
     * @param b the brightness from 0 (off) to 255 (bright), eg:255
     */
    //% help=led/plot-brightness weight=78
    //% blockId=device_plot_brightness block="plot|x %x|y %y|brightness %b" blockGap=8
    //% parts="ledmatrix"
    //% x.min=0 x.max=4 y.min=0 y.max=4 b.min=0 b.max=255
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    //% advanced=true shim=led::plotBrightness
    function plotBrightness(x: int32, y: int32, b: int32): void;

    /**
     * Get the brightness state of the specified LED using x, y coordinates. (0,0) is upper left.
     * @param x the horizontal coordinate of the LED
     * @param y the vertical coordinate of the LED
     */
    //% help=led/point-brightness weight=76
    //% blockId=device_point_brightness block="point|x %x|y %y brightness"
    //% parts="ledmatrix"
    //% x.min=0 x.max=4 y.min=0 y.max=4
    //% x.fieldOptions.precision=1 y.fieldOptions.precision=1
    //% advanced=true shim=led::pointBrightness
    function pointBrightness(x: int32, y: int32): int32;

    /**
     * Set the screen brightness from 0 (off) to 255 (full bright).
     * @param b the brightness value, eg:255, 127, 0
     */
    //% help=led/set-brightness weight=59
    //% blockId=device_set_brightness block="set brightness %b"
    //% parts="ledmatrix"
    //% advanced=true
    //% b.min=0 b.max=255 shim=led::setBrightness
    function setBrightness(b: int32): void;

    /**
     * Get the screen brightness from 0 (off) to 255 (full bright).
     */
    //% help=led/brightness weight=60
    //% blockId=device_get_brightness block="brightness" blockGap=8
    //% parts="ledmatrix"
    //% advanced=true shim=led::brightness
    function brightness(): int32;

    /**
     * Turns on or off the display
     */
    //% help=led/enable blockId=device_led_enable block="led enable %on"
    //% advanced=true parts="ledmatrix" shim=led::enable
    function enable(on: boolean): void;
}

// Auto-generated. Do not edit. Really.
