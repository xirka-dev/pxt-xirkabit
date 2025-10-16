#ifndef DUMMYSOURCE_H
#define DUMMYSOURCE_H

#include "DataStream.h"

namespace codal {

class DummySource: public DataSource {
public:
  /**
   * Define a downstream component for data stream.
   *
   * @sink The component that data will be delivered to, when it is availiable
   */
  virtual void connect(DataSink &sink) override {
    downStream = &sink;
  }

  /**
   * Provide the next available ManagedBuffer to our downstream caller, if available.
   */
  virtual ManagedBuffer pull() override;

  /**
  * Schedules playout of the sound effect.
  * @return DEVICE_OK on success, or DEVICE_INVALID_PARAMETER
  */
  int play(void);

private:
  DataSink*               downStream;             // Our downstream component.
  uint16_t count;
};

}

#endif
