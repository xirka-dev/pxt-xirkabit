#include "pxt.h"
#include "pxtAddon.h"

namespace pxt {

LogFAT usbmsc;

}

namespace control {
  //%
  void enableUsbMsc() {
    usb.add(usbmsc);
    usbmsc.addFiles();
  }
}
