declare namespace pins {
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P0)
    const P0: PwmPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P1)
    const P1: PwmPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P2)
    const P2: PwmPin;
    
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P5)
    const P5: PwmOnlyPin;

    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P8)
    const P8: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P9)
    const P9: PwmOnlyPin;
    
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P11)
    const P11: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P12)
    const P12: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P13)
    const P13: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P14)
    const P14: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P15)
    const P15: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P16)
    const P16: PwmOnlyPin;

    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P19)
    const P19: PwmOnlyPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_P20)
    const P20: PwmOnlyPin;

    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_BTN_A)
    const BTN_A: DigitalInOutPin;
    //% fixedInstance shim=pxt::getPinCfg(CFG_PIN_BTN_B)
    const BTN_B: DigitalInOutPin;
}

declare namespace Button {
    /**
     * Left button.
     */
    //% indexedInstanceNS=input indexedInstanceShim=pxt::getButton
    //% block="A" weight=95 fixedInstance
    //% shim=pxt::getButton(0)
    const A: Button;

    /**
     * Right button.
     */
    //% block="B" weight=94 fixedInstance
    //% shim=pxt::getButton(1)
    const B: Button;

    /**
     * Left and Right button.
     */
    //% block="A+B" weight=93 fixedInstance
    //% shim=pxt::getButton(2)
    const AB: Button;
}
