#include "pxt.h"
#include "pxtAddon.h"
#include <cstdio>

namespace pxt {
  extern LogFAT usbmsc;
}

namespace flashlog {
  Action logFileCallback = nullptr;
  codal::GFATEntry *logFile = nullptr;
  bool debug = false;

  void readLogFile(codal::GFATEntry *ent, unsigned blockAddr, char *dst) {
    if (debug) {
      char msg[128];
      snprintf(msg, sizeof(msg), "Logfile data requested for block %d into buffer at %010p, callback is at %010p.\r\n", blockAddr, (void*)dst, (void*)logFileCallback);
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
    logFileCallback = action;
    logFile = usbmsc.addFile(readLogFile, nullptr, fileName->getUTF8Data(), fileSize);
    if (debug) {
      char msg[128];
      snprintf(msg, sizeof(msg), "Added file %s with size %d bytes, callback at %010p\r\n", fileName->getUTF8Data(), fileSize, (void*)logFileCallback);
      sendSerial(msg, strlen(msg));
    }
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
