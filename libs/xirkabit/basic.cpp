#include <cstdio>
#include "pxt.h"
#include "pxtAddon.h"
#include "images.h"

/**
 * Provides access to basic micro:bit functionality.
 */
//% color=#1E90FF weight=116 icon="\uf00a"
namespace basic {
  /**
   * Draws an image on the LED screen.
   * @param leds pattern of LEDs to turn on/off
   */
  //% help=basic/plot-leds weight=80
  //% parts="ledmatrix"
  void plotLeds(ImageLiteral_ leds) {
    BlocklyImageMethods::plotImage(images::createImage(leds));
  }

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
  //% parts="ledmatrix"
  void showLeds(ImageLiteral_ leds, int interval = 400) {
    plotLeds(leds);
    loops::pause(interval);
  }

  /**
   * Turn off all LEDs
   */
  //% help=basic/clear-screen weight=79
  //% blockId=device_clear_display block="clear screen"
  //% parts="ledmatrix"
  void clearScreen() {
    led::clearMatrix();
    //led::tickMatrix();
}

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
  //% text.shadowOptions.toString=true
  void showString(String text, int interval = 150) {
    if (interval <= 0)
      interval = 1;
    int l = text ? text->getUTF8Size() : 0;
    if (l == 0) {
      clearScreen();
      fiber_sleep(interval * 5);
    // } else if (l > 1) {
      // uBit.display.scroll(MSTR(text), interval);
    } else {
      led::tickMatrix();
      // uBit.display.printChar(text->getUTF8Data()[0], interval * 5);
      while (pxt::serialXirkabit::serialBusy) fiber_sleep(1);
      pxt::serialXirkabit::serialBusy = true;
      char strCmd[128];
      snprintf(strCmd,sizeof(strCmd),"%s|%d",PXT_STRING_DATA(text),led::globalBrightness);

      led::isShowingString = true;
      serialXirkabit::sendCommand("STR",strCmd,true);
      // serialXirkabit::sendCommand("STR", PXT_STRING_DATA(text), true);
      pxt::serialXirkabit::serialBusy = false;

      int length = PXT_STRING_DATA_LENGTH(text);
      loops::pause(interval * length * 5);
      fiber_sleep(200);

      led::isShowingString = false;
    }
  }

  /**
   * Shows a sequence of LED screens as an animation.
   * @param leds pattern of LEDs to turn on/off
   * @param interval time in milliseconds between each redraw.
   */
  //% help=basic/show-animation imageLiteral=1 async
  //% parts="ledmatrix"
  void showAnimation(ImageLiteral_ leds, int interval = 400) {
    // uBit.display.animate(MicroBitImage(imageBytes(leds)), interval, 5, 0, 0);
  }
}
