#include "pxt.h"
#include "pxtAddon.h"
#include <cstdio>

namespace pxt {
  extern LogFAT usbmsc;
}

namespace flashlog {
  Action logFileCallbacks[2] = {};
  unsigned int callbackCount = 0;
  codal::GFATEntry *logFile = nullptr;
  bool debug = false;

  void readLogFile(codal::GFATEntry *ent, unsigned blockAddr, char *dst) {
    Action logFileCallback = (Action)(ent->userdata);
    if (debug) {
      char msg[128];
      snprintf(msg, sizeof(msg), "Logfile data requested for block %d into buffer at %010p, callback is at %010p.\r\n", blockAddr, dst, logFileCallback);
      sendSerial(msg, strlen(msg));
    }
    if (!logFileCallback){
      memset(dst, 0, 512);
      return;
    }
    
    Buffer buf = mkBuffer(nullptr, 512);
    runAction2(logFileCallback, fromUInt(blockAddr), (TValue)buf);
    memcpy(dst, buf->data, 512);
  }

  //%
  void addFile(Action action, String fileName, int fileSize) {
    if (callbackCount >= (sizeof(logFileCallbacks)/sizeof(logFileCallbacks[0]))) return;
    logFileCallbacks[callbackCount] = action;
    codal::GFATEntry *file = usbmsc.addFile(readLogFile, logFileCallbacks[callbackCount], fileName->getUTF8Data(), fileSize);
    if (logFile == nullptr) logFile = file;
    if (debug) {
      char msg[128];
      snprintf(msg, sizeof(msg), "Added file %s with size %d bytes, callback at %010p\r\n", fileName->getUTF8Data(), fileSize, logFileCallbacks[callbackCount]);
      sendSerial(msg, strlen(msg));
    }
    callbackCount++;
  }

  //%
  void setFileSize(int fileSize) {
    if (logFile) {
      usbmsc.setFileSize(logFile, fileSize);
    }
  }

  //%
  void setDebug(bool enabled) {
    debug = enabled;
  }
}

namespace codal {
  void LogFAT::setFileSize(GFATEntry *file, int fileSize) {
    file->size = fileSize;
    files->startCluster = 0xffff; // force FAT table to be reconstructed
  }
}
