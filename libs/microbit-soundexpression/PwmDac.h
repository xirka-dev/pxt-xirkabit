#ifndef PWMDAC_H
#define PWMDAC_H

#include "ZPin.h"
#include "SAMDDMAC.h"
#include "DataStream.h"

namespace codal {

class PwmDacPin : public ZPin {
public:
  PwmDacPin(ZPin pin) :
    ZPin(pin.id, pin.name, PIN_CAPABILITY_AD)
  {}

  pwmout_t* getPwmCfg(void){
    return pwmCfg;
  }
};

class PwmDac : public CodalComponent, public DmaComponent, public DataSink {
public:
  PwmDac(ZPin &pin, DataSource &source, long sampleRate = 44100);
  long getSampleRate(void){ return sampleRate; }
  long getSampleRange(void){ return *periodRegister; }
  int pullRequest(void) override;

  /**
   * Interrupt callback when playback of DMA buffer has completed
   */
  void dmaTransferComplete(DmaCode c) override;

private:
  DataSource &upstream;
  uint8_t triggerSource;
  volatile void *pwmRegister;
  DmaInstance* dmaInstance;
  PwmDacPin pinPwm;
  volatile uint32_t *periodRegister;
  long sampleRate;
  ManagedBuffer buffer, nextBuffer;
  int dataReady;
  bool active;

  void prefill(void);
  ErrorCode pull(void);
};

}

#endif
