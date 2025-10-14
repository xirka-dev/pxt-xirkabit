#include "XirkaBitSound.h"
#include "pxt.h"

#define SAMPLE_RATE 44100

namespace codal {

XirkaBitSound* XirkaBitSound::instance = nullptr;

XirkaBitSound::XirkaBitSound(void) :
  soundExpressions(synth),                   
  synth(DEVICE_ID_SOUND_EMOJI_SYNTHESIZER_0, SAMPLE_RATE),
  pwmDac(nullptr)
{
  // If we are the first instance created, schedule it for on demand activation
  if (XirkaBitSound::instance == nullptr)
    XirkaBitSound::instance = this;

  synth.allowEmptyBuffers(true);
}

void XirkaBitSound::requestActivation(void){
  if (XirkaBitSound::instance)
    XirkaBitSound::instance->enable();
}

int XirkaBitSound::enable(void){
  if(pwmDac != nullptr) return DEVICE_OK;

  // pwmDac = new PwmDac(*LOOKUP_PIN(SPEAKER_AMP), mixer, SAMPLE_RATE);
  pwmDac = new PwmDac(*LOOKUP_PIN(SPEAKER_AMP), dummySource, SAMPLE_RATE);
  
  mixer.setSampleRange(pwmDac->getSampleRange());
  mixer.setSampleRate(SAMPLE_RATE);
  // if(soundExpressionChannel == nullptr)
  //   // soundExpressionChannel = mixer.addChannel(synth);
  //   soundExpressionChannel = mixer.addChannel(dummySource);

  {
    static const char msg[] = "Sound enabled.\r\n";
    sendSerial(msg, sizeof(msg)-1);
  }
  return DEVICE_OK;
}

XirkaBitSound::~XirkaBitSound(void){

}

}
