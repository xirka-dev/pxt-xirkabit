#include "pxt.h"
#include "XirkaBitSound.h"

namespace music {
    /**
     * Internal use only
     **/
    //% async
    void __playSoundExpression(String nodes, bool waitTillDone) {
        // if (waitTillDone)
        //     uBit.audio.soundExpressions.play(MSTR(nodes));
        // else
        //     uBit.audio.soundExpressions.playAsync(MSTR(nodes));
    }

    /**
    * Internal use only
    */
    //% 
    void __stopSoundExpressions() {
        // uBit.audio.soundExpressions.stop();
    }
}

namespace pxt {
    codal::XirkaBitSound sound;
}
