#ifndef XIRKABITSOUND_H
#define XIRKABITSOUND_H

#include "SoundEmojiSynthesizer.h"
#include "SoundExpressions.h"

namespace codal {

class XirkaBitSound {
public:
  SoundExpressions soundExpressions; // SoundExpression intepreter

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
  static XirkaBitSound *instance;
};

}
#endif
