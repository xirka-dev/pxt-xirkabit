#include <cstdio>
#include "pxt.h"
#include "PwmDac.h"

#include "samd/timers.h"

namespace codal {
extern const uint16_t sin2k7Hz[256];
const uint16_t sin2k7Hz[] = {
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544,
  751, 928, 1046, 1087, 1046, 928, 751, 544, 336, 159, 41, 0, 41, 159, 336, 544
};

  PwmDac::PwmDac(ZPin &pin, DataSource &source, long sampleRate) :
    upstream(source),
    dmaInstance(nullptr),
    pinPwm(pin),
    sampleRate(sampleRate),
    dataReady(0),
    active(false)
  {
    {
      int samplePeriodUs = 1000000/sampleRate;
      char msg[128];
      snprintf(msg, sizeof(msg), "Setting period to %d us.\r\n", samplePeriodUs);
      sendSerial(msg, strlen(msg));
      pinPwm.setAnalogPeriodUs(samplePeriodUs);
    }

    const pin_timer_t *pwmTimer = pinPwm.getPwmCfg()->timer;

    static const char msg[] = "Timer for PWM is TC";
    sendSerial(msg, sizeof(msg)-1);
    {
      char msg1[8];
      if(pwmTimer->is_tc){
        snprintf(msg1, sizeof(msg1), "%d", pwmTimer->index + 3);
      }
      else {
        snprintf(msg1, sizeof(msg1), "C%d", pwmTimer->index);
      }
      sendSerial(msg1, strlen(msg1));
      sendSerial("\r\n", 2);
    }
    static const uint8_t tcDmacTrigOvfs[] = {
#ifdef _SAMD21_TC3_INSTANCE_
      TC3_DMAC_ID_OVF
#ifdef _SAMD21_TC4_INSTANCE_
      , TC4_DMAC_ID_OVF
#ifdef _SAMD21_TC5_INSTANCE_
      , TC5_DMAC_ID_OVF
#ifdef _SAMD21_TC6_INSTANCE_
      , TC6_DMAC_ID_OVF
#ifdef _SAMD21_TC7_INSTANCE_
      , TC7_DMAC_ID_OVF
#endif
#endif
#endif
#endif
#endif
    };
    static const uint8_t tccDmacTrigOvfs[] = {
      TCC0_DMAC_ID_OVF,
      TCC1_DMAC_ID_OVF,
      TCC2_DMAC_ID_OVF
    };
    triggerSource = (pwmTimer->is_tc) ?
      tcDmacTrigOvfs[pwmTimer->index] :
      tccDmacTrigOvfs[pwmTimer->index]
    ;
    {
      char msg1[128];
      snprintf(msg1, sizeof(msg1), "DMA trigger source is 0x%02X\r\n", triggerSource);
      sendSerial(msg1, strlen(msg1));
    }

    if(pwmTimer->is_tc){
      pwmRegister = &(tc_insts[pwmTimer->index]->COUNT16.CC[pwmTimer->wave_output].reg);
      periodRegister = (volatile uint32_t*)&(tc_insts[pwmTimer->index]->COUNT16.CC[0].reg);
    }
    else {
      uint8_t channel = pwmTimer->wave_output % tcc_cc_num[pwmTimer->index];
      pwmRegister = &(tcc_insts[pwmTimer->index]->CCB[channel].reg);
      periodRegister = &(tcc_insts[pwmTimer->index]->PER.reg);
    }

    *periodRegister = ((CODAL_CPU_MHZ*1000000UL*2)/sampleRate - 1)/2;
    {
      char msg1[128];
      snprintf(msg1, sizeof(msg1), "PWM reg is at %p\r\n", pwmRegister);
      sendSerial(msg1, strlen(msg1));
      snprintf(msg1, sizeof(msg1), "TCC.CTRLA is 0x%08X\r\n", tcc_insts[pwmTimer->index]->CTRLA.reg);
      sendSerial(msg1, strlen(msg1));
      snprintf(msg1, sizeof(msg1), "Period count is %u\r\n", *periodRegister);
      sendSerial(msg1, strlen(msg1));
    }

    DmaFactory factory;
    dmaInstance = factory.allocate();
    CODAL_ASSERT(dmaInstance != NULL, DEVICE_HARDWARE_CONFIGURATION_ERROR);

    dmaInstance->onTransferComplete(this);
    dmaInstance->configure(triggerSource, BeatHalfWord, NULL, pwmRegister);

    upstream.connect(*this);
  }

  int PwmDac::pullRequest(void){
    dataReady++;
    // {
    //   char msg[128];
    //   int len = snprintf(msg, sizeof(msg), "Pull requested (%d) from upstream!\r\n", dataReady);
    //   sendSerial(msg, len);
    // }
    

    if(active){
      // static const char msg[] = "Already pulling data! Aborting...\r\n";
      // sendSerial(msg, sizeof(msg)-1);
      return DEVICE_OK;
    }

    // Not active
    return pull();
  }

  void PwmDac::prefill(void){
    if(!dataReady) return;

    dataReady--;

    bool alreadyActive = active;
    active = true;
    nextBuffer = upstream.pull();
    // {
    //   char msg1[128];
    //   snprintf(msg1, sizeof(msg1), "Retrieved %d bytes, due %d more.\r\n", nextBuffer.length(), dataReady);
    //   sendSerial(msg1, strlen(msg1));
    // }
    
    if(!alreadyActive) active = false;
  }

  ErrorCode PwmDac::pull(void){
    if (!nextBuffer.length())
      prefill();

    buffer = nextBuffer;
    // buffer = ManagedBuffer(nextBuffer.length());
    // static int countDown = 4;
    // if(countDown){
    //   countDown--;
    //   for(int i=0; i < buffer.length(); i=i+2){
    //     if((i & 15) == 0) sendSerial("\r\n", 2);
    //     uint16_t value = *(uint16_t*)&buffer[i];
    //   //   value = ((uint32_t)value * periodRegister) >> OUTPUT_BITS;
    //   //   *(uint16_t*)&buffer[i] = value;
    //     char msg[8];
    //     snprintf(msg, sizeof(msg), "%u ", value);
    //     sendSerial(msg, strlen(msg));
    //   }
    //   sendSerial("\r\n\r\n", 4);
    // }

    nextBuffer = ManagedBuffer();

    if (buffer.length()) {
      // char msg1[64];
      // snprintf(msg1, 64, "Processing %d bytes of data.\r\n", buffer.length());
      // sendSerial(msg1, strlen(msg1));

      dmaInstance->transfer(&buffer[0], nullptr, buffer.length());
      // dmaInstance->transfer(sin2k7Hz, nullptr, sizeof(sin2k7Hz));
    }
    else {
      dataReady = 0;
      active = false;
      return DEVICE_OK;
    }

    active = true;

    prefill();
    return DEVICE_OK;
  }

  void PwmDac::dmaTransferComplete(DmaCode c){
    // const char msg[] = "DMA transfer completed.\r\n";
    // sendSerial(msg, sizeof(msg)-1);
    if (!dataReady){
        active = false;
        return;
    }

    pull();
  }
}
