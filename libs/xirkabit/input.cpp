#include "pxt.h"
#include "pxtAddon.h"


//% color=#D400D4 weight=111 icon="\uf192"
namespace input {

    /**
     * Do something when a button (A, B or both A+B) is pushed down and released again.
     * @param button the button that needs to be pressed
     * @param body code to run when event is raised
     */
    //% help=input/on-button-pressed weight=85 blockGap=16
    //% blockId=device_button_event block="on button|%NAME|pressed"
    //% parts="buttonpair"
    void onButtonPressed(Button_ button, Action body) {
        //registerWithDal((int)button, MICROBIT_BUTTON_EVT_CLICK, body);
        registerWithDal(button->id, DEVICE_BUTTON_EVT_CLICK, body);
    }

}
