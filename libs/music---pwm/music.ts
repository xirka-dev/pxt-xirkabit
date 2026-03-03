enum Note {
    //% blockIdentity=music.noteFrequency enumval=262
    C = 262,
    //% block=C#
    //% blockIdentity=music.noteFrequency enumval=277
    CSharp = 277,
    //% blockIdentity=music.noteFrequency enumval=294
    D = 294,
    //% blockIdentity=music.noteFrequency enumval=311
    Eb = 311,
    //% blockIdentity=music.noteFrequency enumval=330
    E = 330,
    //% blockIdentity=music.noteFrequency enumval=349
    F = 349,
    //% block=F#
    //% blockIdentity=music.noteFrequency enumval=370
    FSharp = 370,
    //% blockIdentity=music.noteFrequency enumval=392
    G = 392,
    //% block=G#
    //% blockIdentity=music.noteFrequency enumval=415
    GSharp = 415,
    //% blockIdentity=music.noteFrequency enumval=440
    A = 440,
    //% blockIdentity=music.noteFrequency enumval=466
    Bb = 466,
    //% blockIdentity=music.noteFrequency enumval=494
    B = 494,
    //% blockIdentity=music.noteFrequency enumval=131
    C3 = 131,
    //% block=C#3
    //% blockIdentity=music.noteFrequency enumval=139
    CSharp3 = 139,
    //% blockIdentity=music.noteFrequency enumval=147
    D3 = 147,
    //% blockIdentity=music.noteFrequency enumval=156
    Eb3 = 156,
    //% blockIdentity=music.noteFrequency enumval=165
    E3 = 165,
    //% blockIdentity=music.noteFrequency enumval=175
    F3 = 175,
    //% block=F#3
    //% blockIdentity=music.noteFrequency enumval=185
    FSharp3 = 185,
    //% blockIdentity=music.noteFrequency enumval=196
    G3 = 196,
    //% block=G#3
    //% blockIdentity=music.noteFrequency enumval=208
    GSharp3 = 208,
    //% blockIdentity=music.noteFrequency enumval=220
    A3 = 220,
    //% blockIdentity=music.noteFrequency enumval=233
    Bb3 = 233,
    //% blockIdentity=music.noteFrequency enumval=247
    B3 = 247,
    //% blockIdentity=music.noteFrequency enumval=262
    C4 = 262,
    //% block=C#4
    //% blockIdentity=music.noteFrequency enumval=277
    CSharp4 = 277,
    //% blockIdentity=music.noteFrequency enumval=294
    D4 = 294,
    //% blockIdentity=music.noteFrequency enumval=311
    Eb4 = 311,
    //% blockIdentity=music.noteFrequency enumval=330
    E4 = 330,
    //% blockIdentity=music.noteFrequency enumval=349
    F4 = 349,
    //% block=F#4
    //% blockIdentity=music.noteFrequency enumval=370
    FSharp4 = 370,
    //% blockIdentity=music.noteFrequency enumval=392
    G4 = 392,
    //% block=G#4
    //% blockIdentity=music.noteFrequency enumval=415
    GSharp4 = 415,
    //% blockIdentity=music.noteFrequency enumval=440
    A4 = 440,
    //% blockIdentity=music.noteFrequency enumval=466
    Bb4 = 466,
    //% blockIdentity=music.noteFrequency enumval=494
    B4 = 494,
    //% blockIdentity=music.noteFrequency enumval=523
    C5 = 523,
    //% block=C#5
    //% blockIdentity=music.noteFrequency enumval=555
    CSharp5 = 555,
    //% blockIdentity=music.noteFrequency enumval=587
    D5 = 587,
    //% blockIdentity=music.noteFrequency enumval=622
    Eb5 = 622,
    //% blockIdentity=music.noteFrequency enumval=659
    E5 = 659,
    //% blockIdentity=music.noteFrequency enumval=698
    F5 = 698,
    //% block=F#5
    //% blockIdentity=music.noteFrequency enumval=740
    FSharp5 = 740,
    //% blockIdentity=music.noteFrequency enumval=784
    G5 = 784,
    //% block=G#5
    //% blockIdentity=music.noteFrequency enumval=831
    GSharp5 = 831,
    //% blockIdentity=music.noteFrequency enumval=880
    A5 = 880,
    //% blockIdentity=music.noteFrequency enumval=932
    Bb5 = 932,
    //% blockIdentity=music.noteFrequency enumval=988
    B5 = 988,
}

enum BeatFraction {
    //% block=1
    Whole = 1,
    //% block="1/2"
    Half = 2,
    //% block="1/4"
    Quarter = 4,
    //% block="1/8"
    Eighth = 8,
    //% block="1/16"
    Sixteenth = 16,
    //% block="2"
    Double = 32,
    //% block="4",
    Breve = 64,
    //% block="1/3",
    Triplet = 128
}

enum MusicEvent {
    //% block="melody note played"
    MelodyNotePlayed = 1,
    //% block="melody started"
    MelodyStarted = 2,
    //% block="melody ended"
    MelodyEnded = 3,
    //% block="melody repeated"
    MelodyRepeated = 4,
    //% block="background melody note played"
    BackgroundMelodyNotePlayed = MelodyNotePlayed | 0xf0,
    //% block="background melody started"
    BackgroundMelodyStarted = MelodyStarted | 0xf0,
    //% block="background melody ended"
    BackgroundMelodyEnded = MelodyEnded | 0xf0,
    //% block="background melody repeated"
    BackgroundMelodyRepeated = MelodyRepeated | 0xf0,
    //% block="background melody paused"
    BackgroundMelodyPaused = 5 | 0xf0,
    //% block="background melody resumed"
    BackgroundMelodyResumed = 6 | 0xf0
}

namespace music {

    let beatsPerMinute: number;

    /**
    * Play a tone.
    * @param frequency pitch of the tone to play in Hertz (Hz), eg: Note.C
    */
    //% help=music/ring-tone
    //% blockId=music_ring block="ring tone|at %note=device_note"
    //% parts="headphone" trackArgs=0
    //% blockNamespace=music inBasicCategory=true
    //% weight=75 blockGap=8
    //% group="Tone"
    export function ringTone(frequency: number) {
        playTone(frequency, 0);
    }

    /**
    * Rest, or play silence, for some time (in milliseconds).
    * @param ms rest duration in milliseconds (ms), eg: BeatFraction.Half
    */
    //% help=music/rest
    //% blockId=music_rest block="rest|for %duration=device_beat"
    //% parts="headphone" trackArgs=0
    //% blockNamespace=music
    //% weight=74
    //% group="Tone"
    export function rest(ms: number) {
        playTone(0, Math.max(ms, 20));
    }

    function init() {
        if (!beatsPerMinute) beatsPerMinute = 120;
    }

    /**
     * Return the duration of a beat in milliseconds (the beat fraction).
     * @param fraction the fraction of the current whole note, eg: BeatFraction.Half
     */
    //% help=music/beat
    //% blockId=device_beat block="%fraction|beat"
    //% weight=9 blockGap=8
    //% group="Tempo"
    export function beat(fraction?: BeatFraction): number {
        init();
        if (fraction == null) fraction = BeatFraction.Whole;
        let beat = 60000 / beatsPerMinute;
        switch (fraction) {
            case BeatFraction.Half: beat /= 2; break;
            case BeatFraction.Quarter: beat /= 4; break;
            case BeatFraction.Eighth: beat /= 8; break;
            case BeatFraction.Sixteenth: beat /= 16; break;
            case BeatFraction.Double: beat *= 2; break;
            case BeatFraction.Breve: beat *= 4; break;
            case BeatFraction.Triplet: beat /= 3; break;
        }
        return beat >> 0;
    }

    /**
     * Return the tempo in beats per minute (bpm).
     * Tempo is the speed (bpm = beats per minute) at which notes play. The larger the tempo value, the faster the notes will play.
     */
    //% help=music/tempo
    //% blockId=device_tempo block="tempo (bpm)"
    //% weight=64
    //% group="Tempo"
    export function tempo(): number {
        init();
        return beatsPerMinute;
    }

    /**
     * Change the tempo up or down by some amount of beats per minute (bpm).
     * @param bpm The change in beats per minute to the tempo, eg: 20
     */
    //% help=music/change-tempo-by weight=37
    //% blockId=device_change_tempo block="change tempo by %value|(bpm)"
    //% weight=66 blockGap=8
    //% group="Tempo"
    export function changeTempoBy(bpm: number): void {
        init();
        setTempo(beatsPerMinute + bpm);
    }

    /**
     * Set the tempo a number of beats per minute (bpm).
     * @param bpm The new tempo in beats per minute, eg: 120
     */
    //% help=music/set-tempo
    //% blockId=device_set_tempo block="set tempo to %value|(bpm)"
    //% bpm.min=4 bpm.max=400
    //% weight=65 blockGap=8
    //% group="Tempo"
    export function setTempo(bpm: number): void {
        init();
        if (bpm > 0) {
            beatsPerMinute = Math.max(1, bpm >> 0);
        }
    }

    class Melody {
        public melodyArray: string[];
        public currentDuration: number;
        public currentOctave: number;
        public currentPos: number;
        public repeating: boolean;

        // This is bitwise or'd with the events. 0 is not in background, 0xf0 if in background
        public background: number;

        constructor(melodyArray: string[], options: MelodyOptions) {
            this.melodyArray = melodyArray;
            this.repeating = !!(options & (MelodyOptions.Forever | MelodyOptions.ForeverInBackground));
            this.background = (options & (MelodyOptions.OnceInBackground | MelodyOptions.ForeverInBackground)) ? 0xf0 : 0;
            this.currentDuration = 4; //Default duration (Crotchet)
            this.currentOctave = 4; //Middle octave
            this.currentPos = 0;
        }

        hasNextNote() {
            return this.repeating || this.currentPos < this.melodyArray.length;
        }

        nextNote(): string {
            const currentNote = this.melodyArray[this.currentPos];
            return currentNote;
        }
    }

    const MICROBIT_MELODY_ID = 2020;
    const INTERNAL_MELODY_ENDED = 5;
    //% whenUsed
    const freqs = hex`
        1f00210023002500270029002c002e003100340037003a003e004100450049004e00520057005c00620068006e00
        75007b0083008b0093009c00a500af00b900c400d000dc00e900f70006011501260137014a015d01720188019f01
        b801d201ee010b022a024b026e029302ba02e40210033f037003a403dc03170455049704dd0427057505c8052006
        7d06e0064907b8072d08a9082d09b9094d0aea0a900b400cfa0cc00d910e6f0f5a1053115b1272139a14d4152017
        8018f519801b231dde1e`;

    let currentMelody: Melody;
    let currentBackgroundMelody: Melody;

    // Shared code between begin, start, and play Melody blocks (all deprecated), plus StringPlayable.play (NOT deprecated).
    export function startMelodyInternal(melodyArray: string[], options: MelodyOptions) {
        init();
        const isBackground = options & (MelodyOptions.OnceInBackground | MelodyOptions.ForeverInBackground);
        if (currentMelody != undefined) {
            if (!isBackground && currentMelody.background) {
                currentBackgroundMelody = currentMelody;
                currentMelody = null;
                control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyPaused);
            }
            if (currentMelody)
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background | MusicEvent.MelodyEnded);
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background | MusicEvent.MelodyStarted);
        } else {
            currentMelody = new Melody(melodyArray, options);
            control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background | MusicEvent.MelodyStarted);
            // Only start the fiber once
            control.runInParallel(() => {
                while (currentMelody.hasNextNote()) {
                    playNextNote(currentMelody);
                    if (!currentMelody.hasNextNote() && currentBackgroundMelody) {
                        // Swap the background melody back
                        currentMelody = currentBackgroundMelody;
                        currentBackgroundMelody = null;
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.MelodyEnded);
                        control.raiseEvent(MICROBIT_MELODY_ID, MusicEvent.BackgroundMelodyResumed);
                        control.raiseEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
                    }
                }
                control.raiseEvent(MICROBIT_MELODY_ID, currentMelody.background | MusicEvent.MelodyEnded);
                if (!currentMelody.background)
                    control.raiseEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
                currentMelody = null;
            })
        }
    }

    export function waitForMelodyEnd() {
        control.waitForEvent(MICROBIT_MELODY_ID, INTERNAL_MELODY_ENDED);
    }

    export function getMelodyNotes(melody: string) {
        let notes: string[] = melody.split(" ").filter(n => !!n);
        let newOctave = false;

        // build melody string, replace '-' with 'R' and add tempo
        // creates format like "C5-174 B4 A G F E D C "
        for (let i = 0; i < notes.length; i++) {
            if (notes[i] === "-") {
                notes[i] = "R";
            } else if (notes[i] === "C5") {
                newOctave = true;
            } else if (newOctave) { // change the octave if necesary
                notes[i] += "4";
                newOctave = false;
            }
        }

        // Switch back to octave 4 on first note if repeating and final note is octave 5.
        // Otherwise the higher octave will persist.
        if (notes[notes.length - 1] === "C5" && notes[0] != "C5") {
            notes[0] += "4";
        }

        return notes;
    }

    /**
     * Converts an octave and note offset into an integer frequency.
     * Returns 0 if the note is out of range.
     *
     * @param octave    The octave of the note (1 - 8)
     * @param note      The offset of the note within the octave
     * @returns         A frequency in HZ or 0 if out of range
     */
    export function getFrequencyForNote(octave: number, note: number) {
        return freqs.getNumber(NumberFormat.UInt16LE, (note + (12 * (octave - 1))) * 2) || 0;
    }

    /*
     * Converts a simple positive string to an integer.
     * Pxt-common's parseInt is more robust, but it has a fairly large code size footprint.
     * When we know the provided string will be a simple number, we can use this instead,
     * which takes some shortcuts but does not use nearly as much space.
     */
    function parseIntSimple(text: string) {
        let result = 0;
        for (let i = 0; i < text.length; ++i) {
            const c = text.charCodeAt(i) - 48;
            if (c < 0 || c > 9) return NaN;
            result = result * 10 + c;
        }
        return result;
    }

    function playNextNote(melody: Melody): void {
        // cache elements
        let currNote = melody.nextNote();
        let currentPos = melody.currentPos;
        let currentDuration = melody.currentDuration;
        let currentOctave = melody.currentOctave;

        let note: number;
        let isrest: boolean = false;
        let beatPos: number;
        let parsingOctave: boolean = true;
        let prevNote: boolean = false;

        for (let pos = 0; pos < currNote.length; pos++) {
            let noteChar = currNote.charAt(pos);
            switch (noteChar) {
                case 'c': case 'C': note = 1; prevNote = true; break;
                case 'd': case 'D': note = 3; prevNote = true; break;
                case 'e': case 'E': note = 5; prevNote = true; break;
                case 'f': case 'F': note = 6; prevNote = true; break;
                case 'g': case 'G': note = 8; prevNote = true; break;
                case 'a': case 'A': note = 10; prevNote = true; break;
                case 'B': note = 12; prevNote = true; break;
                case 'r': case 'R': isrest = true; prevNote = false; break;
                case '#': note++; prevNote = false; break;
                case 'b': if (prevNote) note--; else { note = 12; prevNote = true; } break;
                case ':': parsingOctave = false; beatPos = pos; prevNote = false; break;
                default: prevNote = false; if (parsingOctave) currentOctave = parseIntSimple(noteChar);
            }
        }
        if (!parsingOctave) {
            currentDuration = parseIntSimple(currNote.substr(beatPos + 1, currNote.length - beatPos));
        }
        let beat = Math.idiv(60000, beatsPerMinute) >> 2;
        if (isrest) {
            music.rest(currentDuration * beat)
        } else {
            music.playTone(getFrequencyForNote(currentOctave, note), currentDuration * beat);
        }
        melody.currentDuration = currentDuration;
        melody.currentOctave = currentOctave;
        const repeating = melody.repeating && currentPos == melody.melodyArray.length - 1;
        melody.currentPos = repeating ? 0 : currentPos + 1;

        control.raiseEvent(MICROBIT_MELODY_ID, melody.background | MusicEvent.MelodyNotePlayed);
        if (repeating)
            control.raiseEvent(MICROBIT_MELODY_ID, melody.background | MusicEvent.MelodyRepeated);
    }

}
