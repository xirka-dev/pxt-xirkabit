#include "DummySource.h"
#include "XirkaBitSound.h"

static const uint16_t sin1k4Hz[] = {
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511,
  611, 707, 796, 873, 937, 984, 1013, 1023, 1013, 984, 937, 873, 796, 707, 611, 512, 412, 316, 227, 150, 86, 39, 10, 0, 10, 39, 86, 150, 227, 316, 412, 511
};

namespace codal {

static ManagedBuffer bufferSin1k4((uint8_t*)sin1k4Hz, sizeof(sin1k4Hz));

extern const uint16_t sin2k7Hz[256];
static ManagedBuffer bufferSin2k7((uint8_t*)sin2k7Hz, sizeof(sin2k7Hz));

ManagedBuffer DummySource::pull() {
  if(count == 0){
    Event(DEVICE_ID_SOUND_EMOJI_SYNTHESIZER_0, DEVICE_SOUND_EMOJI_SYNTHESIZER_EVT_DONE);
    // return ManagedBuffer();
    return bufferSin1k4;
  }
  count--;
  // Issue a Pull Request so that we are always receiver driven, and we're done.
  downStream->pullRequest();

  // return bufferSin1k4;
  return bufferSin2k7;
}

int DummySource::play(void){
  fiber_wake_on_event(DEVICE_ID_SOUND_EMOJI_SYNTHESIZER_0, DEVICE_SOUND_EMOJI_SYNTHESIZER_EVT_DONE);
  
  // Enable audio pipeline if needed.
  XirkaBitSound::requestActivation();

  count = (44100*2/512) - 1;

  // Simply issue a pull request to start the process.
  downStream->pullRequest();

  schedule();
  return DEVICE_OK;
}

}
