#include <cstdio>
#include "pxtAddon.h"

namespace pxt::serialXirkabit {
  static SerialDevice serialXirkabit = nullptr;

  bool initSerial(void){
    if(serialXirkabit) return true;

    serialXirkabit = serial::internalCreateSerialDevice(
      pins::pinByCfg(CFG_PIN_A4),
      pins::pinByCfg(CFG_PIN_A5),
      0
    );

    if(!serialXirkabit){
#if DEBUG_ATTINY
      static const char msg[] = "Failed to init serial to ATtiny!\r\n";
      sendSerial(msg, sizeof(msg));
#endif
      return false;
    }

    return true;
  }
  
  void sendCommand(const char *cmd, const char *value){
    if(!initSerial()) return;

    char msg[128];

    if(value == nullptr){
      snprintf(msg, 127, "{\"CMD\":\"%s\"}", cmd);
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
      static const char msg[] = "serialXirkabit::sendCommand: Failed to allocate buffer!\r\n";
      sendSerial(msg, sizeof(msg));
#endif
      return;
    }
#if DEBUG_ATTINY
    snprintf(msg, 127, "data ptr: %p\r\n", data);
    sendSerial(msg, strlen(msg));
#endif
    serialXirkabit->writeBuffer(data);
    unregisterGCObj(data);

    Buffer dummy = mkBuffer("                  \r\n", 20);
    serialXirkabit->writeBuffer(dummy);
  }
}
