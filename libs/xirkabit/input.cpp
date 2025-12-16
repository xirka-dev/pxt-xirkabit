#include "pxt.h"
#include "pxtAddon.h"
#include "sam.h"
#include "hal_adc_sync.h"
#include "hpl/gclk/hpl_gclk_base.h"
#include "hpl/pm/hpl_pm_base.h"

extern "C" {
  #include "clocks.h"
}

#define ADC_12BIT_FULL_SCALE_VALUE_FLOAT 4095.0f
#define INT1V_DIVIDER_1000 1000.f

namespace pxt {
  class SamdInternalTemperatureSensor {
  public:
    SamdInternalTemperatureSensor() : _initialized(false) {}
    int getTemperature(void);
  
  private:
    void getFactoryCalibration(void);
    float convertDecToFrac(uint8_t);

    bool _initialized;
    float _roomTemperature;
    uint16_t _roomReading;
    float _hotTemperature;
    uint16_t _hotReading;
    float _roomInt1vRef;
    float _hotInt1vRef;
    float _roomVoltageCompensated;
    float _hotVoltageCompensated;
  };
}

namespace input {

  SamdInternalTemperatureSensor *samdTemperature = nullptr;

  /**
   * Gets the temperature in Celsius degrees (°C).
   */
  //% weight=55
  //% help=input/temperature
  //% blockId=device_temperature block="temperature (°C)" blockGap=8
  //% parts="thermometer"
  int temperature() {
    if(!samdTemperature){
      samdTemperature = new pxt::SamdInternalTemperatureSensor();
    }
    return samdTemperature->getTemperature();
  }

}

int pxt::SamdInternalTemperatureSensor::getTemperature(void){
  if(!_initialized){
    getFactoryCalibration();
    _initialized = true;
  }

  hri_sysctrl_set_VREF_TSEN_bit(SYSCTRL);
  
  const uint8_t channel = ADC_INPUTCTRL_MUXPOS_TEMP_Val;
  
  Adc *adc = ADC;

  // rather than maintain state on many pins, we reconfigure the adc each time it is used.
  static adc_sync_descriptor adc_descriptor;
  memset(&adc_descriptor, 0, sizeof(adc_descriptor));

  // Turn the clocks on.
  _pm_enable_bus_clock(PM_BUS_APBC, ADC);
  _gclk_enable_channel(ADC_GCLK_ID, CLK_GEN_8MHZ);

  adc_sync_init(&adc_descriptor, adc, (void *)NULL);

  // Load the factory calibration
  hri_adc_write_CALIB_BIAS_CAL_bf(ADC, (*((uint32_t*) ADC_FUSES_BIASCAL_ADDR) & ADC_FUSES_BIASCAL_Msk) >> ADC_FUSES_BIASCAL_Pos);
  // Bits 7:5
  uint16_t linearity = ((*((uint32_t*) ADC_FUSES_LINEARITY_1_ADDR) & ADC_FUSES_LINEARITY_1_Msk) >> ADC_FUSES_LINEARITY_1_Pos) << 5;
  // Bits 4:0
  linearity |= (*((uint32_t*) ADC_FUSES_LINEARITY_0_ADDR) & ADC_FUSES_LINEARITY_0_Msk) >> ADC_FUSES_LINEARITY_0_Pos;
  hri_adc_write_CALIB_LINEARITY_CAL_bf(ADC, linearity);

  hri_adc_write_CTRLB_PRESCALER_bf(ADC, ADC_CTRLB_PRESCALER_DIV256_Val);
  hri_adc_write_SAMPCTRL_reg(ADC, 0x3F);

  adc_sync_set_reference(&adc_descriptor, ADC_REFCTRL_REFSEL_INT1V_Val);
  adc_sync_set_channel_gain(&adc_descriptor, channel, ADC_INPUTCTRL_GAIN_1X_Val);
  adc_sync_set_resolution(&adc_descriptor, ADC_CTRLB_RESSEL_12BIT_Val); // 10 bit conversion
  adc_sync_enable_channel(&adc_descriptor, channel);
  adc_sync_set_inputs(&adc_descriptor, channel, ADC_INPUTCTRL_MUXNEG_GND_Val, channel);

  uint16_t adcReading = 0;
  // first result is always garbage, according to the datasheet
  adc_sync_read_channel(&adc_descriptor, channel, (uint8_t*) &adcReading, sizeof(adcReading));

  // returns the number of bytes read.
  int ret = adc_sync_read_channel(&adc_descriptor, channel, (uint8_t*)&adcReading, sizeof(adcReading));

  adc_sync_deinit(&adc_descriptor);

  if (ret <= 0)
      return DEVICE_NOT_SUPPORTED;

  // Get course temperature first, in order to estimate the internal 1V reference voltage level at this temperature
  float meaurementVoltage = ((float)adcReading)/ADC_12BIT_FULL_SCALE_VALUE_FLOAT;
  float coarse_temp = _roomTemperature + (((_hotTemperature - _roomTemperature)/(_hotVoltageCompensated - _roomVoltageCompensated)) * (meaurementVoltage - _roomVoltageCompensated));
  // Estimate the reference voltage using the coarse temperature
  float ref1VAtMeasurement = _roomInt1vRef + (((_hotInt1vRef - _roomInt1vRef) * (coarse_temp - _roomTemperature))/(_hotTemperature - _roomTemperature));
  // Now first compensate the raw adc reading using the estimation of the 1V reference output at current temperature 
  float measureVoltageCompensated = ((float)adcReading * ref1VAtMeasurement)/ADC_12BIT_FULL_SCALE_VALUE_FLOAT;
  // Repeat the temperature interpolation using the compensated measurement voltage
  float refinedTemp = _roomTemperature + (((_hotTemperature - _roomTemperature)/(_hotVoltageCompensated - _roomVoltageCompensated)) * (measureVoltageCompensated - _roomVoltageCompensated));
  int result = ((int)(refinedTemp * 2) + 1) / 2; // round to nearest integer

  return result;
}

void pxt::SamdInternalTemperatureSensor::getFactoryCalibration(void){
   // Factory room temperature readings
  uint8_t roomInteger = (*(uint32_t*)FUSES_ROOM_TEMP_VAL_INT_ADDR & FUSES_ROOM_TEMP_VAL_INT_Msk) >> FUSES_ROOM_TEMP_VAL_INT_Pos;
  uint8_t roomDecimal = (*(uint32_t*)FUSES_ROOM_TEMP_VAL_DEC_ADDR & FUSES_ROOM_TEMP_VAL_DEC_Msk) >> FUSES_ROOM_TEMP_VAL_DEC_Pos;
  _roomTemperature = roomInteger + convertDecToFrac(roomDecimal);
  _roomReading = ((*(uint32_t*)FUSES_ROOM_ADC_VAL_ADDR & FUSES_ROOM_ADC_VAL_Msk) >> FUSES_ROOM_ADC_VAL_Pos);

   // Factory hot temperature readings
  uint8_t hotInteger = (*(uint32_t*)FUSES_HOT_TEMP_VAL_INT_ADDR & FUSES_HOT_TEMP_VAL_INT_Msk) >> FUSES_HOT_TEMP_VAL_INT_Pos;
  uint8_t hotDecimal = (*(uint32_t*)FUSES_HOT_TEMP_VAL_DEC_ADDR & FUSES_HOT_TEMP_VAL_DEC_Msk) >> FUSES_HOT_TEMP_VAL_DEC_Pos;
  _hotTemperature = hotInteger + convertDecToFrac(hotDecimal);
  _hotReading = ((*(uint32_t*)FUSES_HOT_ADC_VAL_ADDR & FUSES_HOT_ADC_VAL_Msk) >> FUSES_HOT_ADC_VAL_Pos);

  // Factory internal 1V voltage reference readings at both room and hot temperatures
  int8_t roomInt1vRefRaw = (int8_t)((*(uint32_t*)FUSES_ROOM_INT1V_VAL_ADDR & FUSES_ROOM_INT1V_VAL_Msk) >> FUSES_ROOM_INT1V_VAL_Pos);
  int8_t hotInt1vRefRaw  = (int8_t)((*(uint32_t*)FUSES_HOT_INT1V_VAL_ADDR & FUSES_HOT_INT1V_VAL_Msk) >> FUSES_HOT_INT1V_VAL_Pos);
  _roomInt1vRef = 1 - ((float)roomInt1vRefRaw/INT1V_DIVIDER_1000);
  _hotInt1vRef  = 1 - ((float)hotInt1vRefRaw/INT1V_DIVIDER_1000);

  // Combining the temperature dependent 1v reference with the ADC readings
  _roomVoltageCompensated = ((float)_roomReading * _roomInt1vRef)/ADC_12BIT_FULL_SCALE_VALUE_FLOAT;
  _hotVoltageCompensated = ((float)_hotReading * _hotInt1vRef)/ADC_12BIT_FULL_SCALE_VALUE_FLOAT;
}

// Extra safe decimal to fractional conversion
float pxt::SamdInternalTemperatureSensor::convertDecToFrac(uint8_t val) {
  if (val < 10) {
    return ((float)val/10.0f);
  } else if (val <100) {
    return ((float)val/100.0f);
  } else {
    return ((float)val/1000.0f);
  }
}
