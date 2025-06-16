#ifndef PLATFORM_MICROBIT_H
#define PLATFORM_MICROBIT_H

#include "codal-core/inc/core/CodalComponent.h"

#define MICROBIT_ID_ACCELEROMETER                               DEVICE_ID_ACCELEROMETER
#define MICROBIT_ID_BUTTON_A                                    DEVICE_ID_BUTTON_A
#define MICROBIT_ID_BUTTON_B                                    DEVICE_ID_BUTTON_B
#define MICROBIT_ID_BUTTON_AB                                   DEVICE_ID_BUTTON_AB
#define MICROBIT_ID_RADIO                                       DEVICE_ID_RADIO
#define MICROBIT_ID_GESTURE                                     DEVICE_ID_GESTURE
#define MICROBIT_ID_SERIAL                                      DEVICE_ID_SERIAL

#define MICROBIT_ACCELEROMETER_EVT_3G                           ACCELEROMETER_EVT_3G
#define MICROBIT_ACCELEROMETER_EVT_6G                           ACCELEROMETER_EVT_6G
#define MICROBIT_ACCELEROMETER_EVT_8G                           ACCELEROMETER_EVT_8G
#define MICROBIT_ACCELEROMETER_EVT_DATA_UPDATE                  ACCELEROMETER_EVT_DATA_UPDATE
#define MICROBIT_ACCELEROMETER_EVT_FACE_DOWN                    ACCELEROMETER_EVT_FACE_DOWN
#define MICROBIT_ACCELEROMETER_EVT_FACE_UP                      ACCELEROMETER_EVT_FACE_UP
#define MICROBIT_ACCELEROMETER_EVT_FREEFALL                     ACCELEROMETER_EVT_FREEFALL
#define MICROBIT_ACCELEROMETER_EVT_SHAKE                        ACCELEROMETER_EVT_SHAKE
#define MICROBIT_ACCELEROMETER_EVT_TILT_DOWN                    ACCELEROMETER_EVT_TILT_DOWN
#define MICROBIT_ACCELEROMETER_EVT_TILT_LEFT                    ACCELEROMETER_EVT_TILT_LEFT
#define MICROBIT_ACCELEROMETER_EVT_TILT_RIGHT                   ACCELEROMETER_EVT_TILT_RIGHT
#define MICROBIT_ACCELEROMETER_EVT_TILT_UP                      ACCELEROMETER_EVT_TILT_UP

#define MICROBIT_ACCELEROMETER_3G_TOLERANCE                     ACCELEROMETER_3G_TOLERANCE
#define MICROBIT_ACCELEROMETER_6G_TOLERANCE                     ACCELEROMETER_6G_TOLERANCE
#define MICROBIT_ACCELEROMETER_8G_TOLERANCE                     ACCELEROMETER_8G_TOLERANCE
#define MICROBIT_ACCELEROMETER_FREEFALL_TOLERANCE               ACCELEROMETER_FREEFALL_TOLERANCE
#define MICROBIT_ACCELEROMETER_GESTURE_DAMPING                  ACCELEROMETER_GESTURE_DAMPING
#define MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD            ACCELEROMETER_SHAKE_COUNT_THRESHOLD
#define MICROBIT_ACCELEROMETER_SHAKE_DAMPING                    ACCELEROMETER_SHAKE_DAMPING
#define MICROBIT_ACCELEROMETER_SHAKE_TOLERANCE                  ACCELEROMETER_SHAKE_TOLERANCE
#define MICROBIT_ACCELEROMETER_TILT_TOLERANCE                   ACCELEROMETER_TILT_TOLERANCE

#include "codal-core/inc/driver-models/AbstractButton.h"

#define MICROBIT_BUTTON_EVT_CLICK                               DEVICE_BUTTON_EVT_CLICK
#define MICROBIT_BUTTON_EVT_DOWN                                DEVICE_BUTTON_EVT_DOWN
#define MICROBIT_BUTTON_EVT_LONG_CLICK                          DEVICE_BUTTON_EVT_LONG_CLICK
#define MICROBIT_BUTTON_EVT_UP                                  DEVICE_BUTTON_EVT_UP

#include "codal-core/inc/types/BitmapFont.h"

#define MICROBIT_FONT_ASCII_END                                 BITMAP_FONT_ASCII_END
#define MICROBIT_FONT_ASCII_START                               BITMAP_FONT_ASCII_START

#include "codal-core/inc/driver-models/Serial.h"

#define MICROBIT_SERIAL_EVT_DELIM_MATCH                         CODAL_SERIAL_EVT_DELIM_MATCH

// #include "platform.h"
#ifndef __PXT_PLATFORM_H
#define __PXT_PLATFORM_H

#include "Image.h"
#include "MultiButton.h"
#include "ZPin.h"
#include "Timer.h"
#include "SAMDDAC.h"
#include "ZSPI.h"
#include "ZI2C.h"
#include "ZSingleWireSerial.h"
#include "SAMDNVM.h"
#include "SAMDPDM.h"
#include "SAMDSerial.h"

// cap touch not available on 51 yet
#ifdef SAMD21
#include "CapTouchButton.h"
#endif

#define MIC_DEVICE SAMD21PDM

#ifdef SAMD21
#define OUTPUT_BITS 10
#else
#define OUTPUT_BITS 12
#endif

#include "pinmap.h"

#undef min
#undef max

typedef int PinName;

#define PAGE_SIZE 512

#define BOOTLOADER_START 0x0

#ifdef SAMD21
#define BOOTLOADER_END 0x2000
#endif

#ifdef SAMD51
#define BOOTLOADER_END 0x4000
#endif

#define USB_HANDOVER 0

// if we ever want to support 100+ pin packages, need to add PC,PD ports and increase this to 128
#ifdef SAMD51
#define DEV_NUM_PINS 128
#else
#define DEV_NUM_PINS 64
#endif

#define IS_ANALOG_PIN(id) 1

#define CODAL_PIN ZPin
#define CODAL_TIMER Timer
#define CODAL_SPI ZSPI
#define CODAL_I2C ZI2C
#define CODAL_JACDAC_WIRE_SERIAL codal::ZSingleWireSerial
#define CODAL_SERIAL codal::SAMDSerial
#define CODAL_DAC SAMDDAC

#ifdef SAMD21
#define CODAL_NVMCONTROLLER codal::SAMDNVM
#endif

#define PXT_74HC165 1

#define IMAGE_BITS 4

// The parameters below needs tuning!

#define PA00 0
#define PA01 1
#define PA02 2
#define PA03 3
#define PA04 4
#define PA05 5
#define PA06 6
#define PA07 7
#define PA08 8
#define PA09 9
#define PA10 10
#define PA11 11
#define PA12 12
#define PA13 13
#define PA14 14
#define PA15 15
#define PA16 16
#define PA17 17
#define PA18 18
#define PA19 19
#define PA20 20
#define PA21 21
#define PA22 22
#define PA23 23
#define PA24 24
#define PA25 25
#define PA26 26
#define PA27 27
#define PA28 28
#define PA29 29
#define PA30 30
#define PA31 31
#define PB00 32
#define PB01 33
#define PB02 34
#define PB03 35
#define PB04 36
#define PB05 37
#define PB06 38
#define PB07 39
#define PB08 40
#define PB09 41
#define PB10 42
#define PB11 43
#define PB12 44
#define PB13 45
#define PB14 46
#define PB15 47
#define PB16 48
#define PB17 49
#define PB18 50
#define PB19 51
#define PB20 52
#define PB21 53
#define PB22 54
#define PB23 55
#define PB24 56
#define PB25 57
#define PB26 58
#define PB27 59
#define PB28 60
#define PB29 61
#define PB30 62
#define PB31 63
#define PC00  64
#define PC01  65
#define PC02  66
#define PC03  67
#define PC04  68
#define PC05  69
#define PC06  70
#define PC07  71
#define PC08  72
#define PC09  73
#define PC10  74
#define PC11  75
#define PC12  76
#define PC13  77
#define PC14  78
#define PC15  79
#define PC16  80
#define PC17  81
#define PC18  82
#define PC19  83
#define PC20  84
#define PC21  85
#define PC22  86
#define PC23  87
#define PC24  88
#define PC25  89
#define PC26  90
#define PC27  91
#define PC28  92
#define PC29  93
#define PC30  94
#define PC31  95
#define PD00  96
#define PD01  97
#define PD02  98
#define PD03  99
#define PD04  100
#define PD05  101
#define PD06  102
#define PD07  103
#define PD08  104
#define PD09  105
#define PD10  106
#define PD11  107
#define PD12  108
#define PD13  109
#define PD14  110
#define PD15  111
#define PD16  112
#define PD17  113
#define PD18  114
#define PD19  115
#define PD20  116
#define PD21  117
#define PD22  118
#define PD23  119
#define PD24  120
#define PD25  121
#define PD26  122
#define PD27  123
#define PD28  124
#define PD29  125
#define PD30  126
#define PD31  127
#endif

// Dummies

#define MICROBIT_ID_IO_P0                                       PA00
#define MICROBIT_ID_IO_P1                                       PA01
#define MICROBIT_ID_IO_P2                                       PA02
#define MICROBIT_ID_IO_P3                                       PA03
#define MICROBIT_ID_IO_P4                                       PA04
#define MICROBIT_ID_IO_P5                                       PA05
#define MICROBIT_ID_IO_P6                                       PA06
#define MICROBIT_ID_IO_P7                                       PA07
#define MICROBIT_ID_IO_P8                                       PA08
#define MICROBIT_ID_IO_P9                                       PA09
#define MICROBIT_ID_IO_P10                                      PA10
#define MICROBIT_ID_IO_P11                                      PA11
#define MICROBIT_ID_IO_P12                                      PA12
#define MICROBIT_ID_IO_P13                                      PA13
#define MICROBIT_ID_IO_P14                                      PA14
#define MICROBIT_ID_IO_P15                                      PA15
#define MICROBIT_ID_IO_P16                                      PA16
#define MICROBIT_ID_IO_P19                                      PA17
#define MICROBIT_ID_IO_P20                                      PA18
#define MICROBIT_ID_LOGO                                        PB31

#define MICROBIT_RADIO_EVT_DATAGRAM             1       // Event to signal that a new datagram has been received.

// state/flashlog.ts
#define MICROBIT_ID_LOG 127
#define MICROBIT_LOG_EVT_LOG_FULL           1

// state/misc.ts
#define MICROBIT_ID_BLE             1000
#define MICROBIT_ID_BLE_UART        1200
#define MICROBIT_UART_S_EVT_DELIM_MATCH     1

// visuals/microbit.ts
#define MES_BROADCAST_GENERAL_ID            2000

#endif
