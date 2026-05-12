#include <cstdio>
#include "pxtAddon.h"

namespace pxt::serialXirkabit {
  static volatile bool serialBusy = false;
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

    while(serialBusy) fiber_sleep(1);
    serialBusy = true;

    static char msg[192];

    if(value == nullptr){
      snprintf(msg, 191, "{\"CMD\":\"%s\"}", cmd);
    }
    else if(addQuote){
      snprintf(msg, 191, "{\"CMD\":\"%s\",\"DATA\":\"%s\"}", cmd, value);
    }
    else {
      snprintf(msg, 191, "{\"CMD\":\"%s\",\"DATA\":%s}", cmd, value);
    }
#if DEBUG_ATTINY
    sendSerial(msg, strlen(msg));
    sendSerial("\r\n", 2);
#endif

    Buffer data = mkBuffer(msg, strlen(msg));
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
    registerGCObj(data);
    serialXirkabit->writeBuffer(data);
    unregisterGCObj(data);

    Buffer dummy = mkBuffer("                  \r\n", 20);
    registerGCObj(dummy);  
    serialXirkabit->writeBuffer(dummy);
    unregisterGCObj(dummy);

    serialBusy = false;
  }
  // -----------------------------
  // READ RAW RESPONSE
  // -----------------------------
  int readResponse(int timeoutMs) {
    if (!initSerial()) return -1;

    char raw[64] = {0};
    int idx = 0;
    bool started = false;
    uint32_t start = current_time_ms();

    while ((int)(current_time_ms() - start) < timeoutMs) {
      int c = serialXirkabit->read();
      if (c < 0) {
          // tidak ada data, yield supaya scheduler jalan
          fiber_sleep(1);
          continue;
      }

      if ((char)c == '{') {
          started = true;
          idx = 0;  // reset buffer, buang apapun sebelum '{'
      }
      if (!started) continue;

      if (idx < 63)
          raw[idx++] = (char)c;

      if ((char)c == '}') break;
    }

    if (idx == 0) return -1;  // timeout, tidak ada data

    // parse RSP
    char *p = strstr(raw, "\"RSP\":");
    if (!p) return -1;
    p += 6;

    int value = 0;
    bool found = false;
    while (*p >= '0' && *p <= '9') {
        value = value * 10 + (*p - '0');
        p++;
        found = true;
    }

    return found ? value : -1;
  }

}
