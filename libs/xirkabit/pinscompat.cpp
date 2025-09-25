#include "pxt.h"


//#undef Button               // need to get codal Button back in scope here
//#include "XirkaBitCompat.h"

enum class DigitalPin {
    //% blockIdentity="pins._digitalPin"
    P0 = CFG_PIN_P0,
    //% blockIdentity="pins._digitalPin"
    P1 = CFG_PIN_P1,
    //% blockIdentity="pins._digitalPin"
    P2 = CFG_PIN_P2,
    //% blockIdentity="pins._digitalPin"
    P3 = CFG_PIN_P3,
    //% blockIdentity="pins._digitalPin"
    P4 = CFG_PIN_P4,
    //% blockIdentity="pins._digitalPin"
    P5 = CFG_PIN_P5,
    //% blockIdentity="pins._digitalPin"
    P6 = CFG_PIN_P6,
    //% blockIdentity="pins._digitalPin"
    P7 = CFG_PIN_P7,
    //% blockIdentity="pins._digitalPin"
    P8 = CFG_PIN_P8,
    //% blockIdentity="pins._digitalPin"
    P9 = CFG_PIN_P9,
    //% blockIdentity="pins._digitalPin"
    P10 = CFG_PIN_P10,
    //% blockIdentity="pins._digitalPin"
    P11 = CFG_PIN_P11,
    //% blockIdentity="pins._digitalPin"
    P12 = CFG_PIN_P12,
    //% blockIdentity="pins._digitalPin"
    P13 = CFG_PIN_P13,
    //% blockIdentity="pins._digitalPin"
    P14 = CFG_PIN_P14,
    //% blockIdentity="pins._digitalPin"
    P15 = CFG_PIN_P15,
    //% blockIdentity="pins._digitalPin"
    P16 = CFG_PIN_P16,
    //% blockIdentity="pins._digitalPin"
    //% blockHidden=1
    P19 = CFG_PIN_P19,
    //% blockIdentity="pins._digitalPin"
    //% blockHidden=1
    P20 = CFG_PIN_P20,
};


namespace DigitalInOutPinMethods {

  void digitalWrite(DigitalInOutPin name, bool value);

}

namespace pins {


DigitalInOutPin pinByCfg(int key) ;


    /**
     * Sets the digital pin status
     * @param pin
     * @param value 
     */
    //% deprecated=1
    void digitalWritePin (int pin,  int value) {
    // void pins::digitalWritePin (DigitalPin pin,  int value) {
        // const auto p = pins.pinByCfg(pin);
        auto p = pins::pinByCfg(pin);
        if (p){
            // p.digitalWrite(!!value);
            DigitalInOutPinMethods::digitalWrite(p, !!value);
        }
    }


    //%
    DevicePin *getPinAddress(int id) {
        return getPin(id);
    }

}

