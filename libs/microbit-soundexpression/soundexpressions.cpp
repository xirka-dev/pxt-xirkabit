#include "pxt.h"
#include "XirkaBitSound.h"

#undef MSTR
#define MSTR(s) ManagedString((s)->getUTF8Data(), (s)->getUTF8Size())

namespace pxt {
    extern codal::XirkaBitSound sound;
}

namespace music {
    /**
     * Internal use only
     **/
    //% async
    void __playSoundExpression(String nodes, bool waitTillDone) {
        if (waitTillDone)
            // sound.soundExpressions.play(MSTR(nodes));
            sound.dummySource.play();
        else
            sound.soundExpressions.playAsync(MSTR(nodes));
    }

    /**
    * Internal use only
    */
    //% 
    void __stopSoundExpressions() {
        sound.soundExpressions.stop();
    }
}

namespace pxt {
    codal::XirkaBitSound sound;
}
