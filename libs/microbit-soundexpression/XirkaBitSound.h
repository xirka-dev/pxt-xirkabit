#ifndef XIRKABITSOUND_H
#define XIRKABITSOUND_H

#include "SoundEmojiSynthesizer.h"
#include "SoundExpressions.h"
#include "DummySource.h"
#include "PwmDac.h"
#include "Mixer2.h"

namespace codal {

class XirkaBitSound {
public:
  SoundExpressions soundExpressions; // SoundExpression intepreter
  DummySource dummySource;

  /**
   * Constructor.
   */
  XirkaBitSound(void);

  /**
   * Destructor.
   */
  ~XirkaBitSound();

  /**
   * Demand request from a component to enable the default instance of this audio pipeline
   */
  static void requestActivation();

  /**
   * post-constructor initialisation method
   */
  int enable();

private:
  SoundEmojiSynthesizer synth;       // Synthesizer used for SoundExpressions
  MixerChannel *soundExpressionChannel;   // Mixer channel associated with sound expression audio
  Mixer2                  mixer;          // Multi channel audio mixer
  static XirkaBitSound *instance;    // Primary instance of XirkaBitSound, on demand activated.
  PwmDac *pwmDac;                    // PWM driver used for sound generation (mixer output)
};

}
#endif
