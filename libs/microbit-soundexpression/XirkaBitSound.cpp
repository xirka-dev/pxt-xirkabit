#include "XirkaBitSound.h"
#include "pxt.h"

namespace codal {

XirkaBitSound* XirkaBitSound::instance = nullptr;

XirkaBitSound::XirkaBitSound(void) :
  soundExpressions(synth),                   
  synth(DEVICE_ID_SOUND_EMOJI_SYNTHESIZER_0),
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

  pwmDac = new PwmDac(*LOOKUP_PIN(SPEAKER_AMP), synth);
  return DEVICE_OK;
}

XirkaBitSound::~XirkaBitSound(void){

}

}
