#include <cstdio>
#include "pxtAddon.h"

namespace pxt::serialXirkabitBt {
  static SerialDevice serialXirkabitBt = nullptr;

  bool initSerial(void){
    if(serialXirkabitBt) return true;

    serialXirkabitBt = serial::internalCreateSerialDevice(
      pins::pinByCfg(CFG_PIN_B22),
      pins::pinByCfg(CFG_PIN_B23),
      1
    );

    if(!serialXirkabitBt){
#if DEBUG_ATTINY
      static const char msg[] = "Failed to init serial to ATtiny!\r\n";
      sendSerial(msg, sizeof(msg));
#endif
      return false;
    }

    return true;
  }
  
  void sendCommand(const char *cmd, const char *value, bool addQuote){
    if(!initSerial()) return;

    char msg[128];

    if(value == nullptr){
      snprintf(msg, 127, "{\"CMD\":\"%s\"}", cmd);
    }
    else if(addQuote){
      snprintf(msg, 127, "{\"CMD\":\"%s\",\"DATA\":\"%s\"}", cmd, value);
    }
    else {
      snprintf(msg, 127, "{\"CMD\":\"%s\",\"DATA\":%s}", cmd, value);
    }
#if DEBUG_ATTINY
    sendSerial(msg, strlen(msg));
    sendSerial("\r\n", 2);
#endif

    Buffer data = mkBuffer(msg, strlen(msg));
    registerGCObj(data);
    if(data == nullptr){
#if DEBUG_ATTINY
      static const char msg[] = "serialXirkabitBt::sendCommand: Failed to allocate buffer!\r\n";
      sendSerial(msg, sizeof(msg));
#endif
      return;
    }
#if DEBUG_ATTINY
    snprintf(msg, 127, "data ptr: %p\r\n", data);
    sendSerial(msg, strlen(msg));
#endif
    serialXirkabitBt->writeBuffer(data);
    unregisterGCObj(data);

    Buffer dummy = mkBuffer("                  \r\n", 20);
    serialXirkabitBt->writeBuffer(dummy);
  }
}
