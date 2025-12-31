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
  // -----------------------------
  // READ RAW RESPONSE
  // -----------------------------
  int readResponse() {
    if (!initSerial())
        return -1;

    Buffer buf = serialXirkabit->readBuffer();
    if (!buf || buf->length == 0){
      static const char msg[]="buffer is empty\r\n";
      sendSerial(msg, sizeof(msg)-1);
        return -1;
    }

    //sendSerial((char*)(buf->data),buf->length);

    char *raw = (char*)buf->data;
    int len = buf->length;

    // cari '{'
    char *start = nullptr;
    for (int i = 0; i < len; i++) {
        if (raw[i] == '{') {
            start = raw + i;
            break;
        }
    }
    if (!start) return -1;
    
    // cari "RSP":
    char *p = strstr(start, "\"RSP\":");
    if (!p) return -1;
    p += 6; // panjang "\"RSP\":"
    int value = 0;
    bool found = false;
    while (*p >= '0' && *p <= '9') {
        value = value * 10 + (*p - '0');
        p++;
        found = true;
    }

    if (!found) return -1;

    return value;
    //return 0;
  }

}
