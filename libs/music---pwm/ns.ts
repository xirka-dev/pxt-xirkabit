
enum MelodyOptions {
    //% block="once"
    Once = 1,
    //% block="forever"
    Forever = 2,
    //% block="once in background"
    OnceInBackground = 4,
    //% block="forever in background"
    ForeverInBackground = 8
}


/**
 * Generation of music tones.
 */
//% color=#E63022 weight=106 icon="\uf025"
//% groups='["Melody", "Tone", "Volume", "Tempo", "Melody Advanced"]'
namespace music {

    export enum PlaybackMode {
        //% block="until done"
        UntilDone,
        //% block="in background"
        InBackground,
        //% block="looping in background"
        LoopingInBackground
    }

    let looping: Playable[];

    export class Playable {
        stopped: boolean;
        constructor() {

        }

        _play(playbackMode: PlaybackMode) {
            // subclass
        }

        loop() {
            if (!looping) {
                looping = [];
            }

            looping.push(this);
            this.stopped = false;

            control.runInParallel(() => {
                while (!this.stopped) {
                    this._play(PlaybackMode.UntilDone);
                }
            });
        }
    }

    export class StringArrayPlayable extends Playable {
        constructor(private notes: string[], private tempo: number) {
            super();
        }

        _play(playbackMode: PlaybackMode) {
            if(this.tempo) {
                music.setTempo(this.tempo);
            }
            if (playbackMode == PlaybackMode.InBackground) {
                startMelodyInternal(this.notes, MelodyOptions.OnceInBackground);
            }
            else if (playbackMode == PlaybackMode.LoopingInBackground) {
                startMelodyInternal(this.notes, MelodyOptions.ForeverInBackground);
            }
            else {
                startMelodyInternal(this.notes, MelodyOptions.Once);
                waitForMelodyEnd();
            }
        }
    }

    export class TonePlayable extends Playable {
        constructor(public pitch: number, public duration: number) {
            super();
        }

        _play(playbackMode: PlaybackMode) {
            if (playbackMode === PlaybackMode.InBackground) {
                control.runInParallel(() => music.playTone(this.pitch, this.duration));
            }
            else if (playbackMode === PlaybackMode.UntilDone) {
                music.playTone(this.pitch, this.duration);
            }
            else {
                this.loop();
            }
        }
    }

    /**
     * Play a song, melody, or other sound. The music plays until finished or can play as a
     * background task.
     * @param toPlay the song or melody to play
     * @param playbackMode play the song or melody until it's finished or as background task
     */
    //% blockId="music_playable_play"
    //% block="play $toPlay $playbackMode"
    //% toPlay.shadow=music_string_playable
    //% group="Melody"
    //% help="music/play"
    //% blockHidden
    export function play(toPlay: Playable, playbackMode: PlaybackMode) {
        toPlay._play(playbackMode);
    }

    //% blockId="music_playable_play_default_bkg"
    //% block="play $toPlay $playbackMode"
    //% toPlay.shadow=music_string_playable
    //% playbackMode.defl=music.PlaybackMode.InBackground
    //% group="Melody"
    //% help="music/play"
    //% blockHidden
    export function _playDefaultBackground(toPlay: Playable, playbackMode: PlaybackMode) {
        return play(toPlay, playbackMode);
    }

    /**
     * Play a melody from the melody editor
     * @param melody string of up to eight notes [C D E F G A B C5] or rests [-] separated by spaces, which will be played one at a time, ex: "E D G F B A C5 B "
     * @param bpm number in beats per minute dictating how long each note will play
     */
    //% blockId="music_string_playable"
    //% block="melody $melody at tempo $bpm|(bpm)"
    //% weight=85 blockGap=8
    //% help=music/string-playable
    //% group="Melody"
    //% toolboxParent=music_playable_play
    //% toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% melody.shadow=melody_editor
    //% bpm.min=40 bpm.max=500
    //% bpm.defl=120
    export function stringPlayable(melody: string, bpm: number): Playable {
        return new StringArrayPlayable(music.getMelodyNotes(melody), bpm);
    }

    /**
     * Plays a tone through pin ``P0`` for the given duration.
     * @param note pitch of the tone to play in Hertz (Hz).
     * @param duration tone duration in milliseconds (ms)
     */
    //% blockId="music_tone_playable"
    //% block="tone $note for $duration"
    //% toolboxParent=music_playable_play
    //% toolboxParentArgument=toPlay
    //% group="Tone"
    //% weight=85
    //% duplicateShadowOnDrag
    //% note.shadow=device_note
    //% duration.shadow=device_beat
    //% parts="headphone"
    //% help=music/tone-playable
    export function tonePlayable(note: number, duration: number): Playable {
        return new TonePlayable(note, duration);
    }

    /**
     * Gets the melody array of a built-in melody.
     * @param melody the melody name
     */
    //% weight=60 help=music/built-in-playable-melody
    //% blockId=device_builtin_melody_playable block="melody $melody"
    //% toolboxParent=music_playable_play_default_bkg
    //% toolboxParentArgument=toPlay
    //% duplicateShadowOnDrag
    //% group="Melody Advanced"
    export function builtInPlayableMelody(melody: Melodies): StringArrayPlayable {
        return new StringArrayPlayable(getMelody(melody), undefined);
    }

    export function _stopPlayables() {
        if (!looping) return;

        for (const p of looping) {
            p.stopped = true;
        }
        looping = undefined;
    }

    export function _bufferToMelody(melody: Buffer) {
        if (!melody) return [];

        let currentDuration = 4;
        let currentOctave = -1;
        const out: string[] = [];

        const notes = "c#d#ef#g#a#b"
        let current = "";

        // The buffer format is 2 bytes per note. First note byte is midi
        // note number, second byte is duration in quarter beats. The note
        // number 0 is reserved for rests
        for (let i = 0; i < melody.length; i += 2) {
            let octave = 4;
            const note = melody[i] % 12;
            if (melody[i] === 0) {
                current = "r"
            }
            else {
                current = notes.charAt(note);
                if (current === "#") current = notes.charAt(note - 1) + current

                octave = Math.idiv((melody[i] - 24), 12)
            }

            const duration = melody[i + 1];

            if (octave !== currentOctave) {
                current += octave
                currentOctave = octave;
            }

            if (duration !== currentDuration) {
                current += ":" + duration;
                currentDuration = duration;
            }

            out.push(current);
        }

        return out;
    }

    /**
     * Play a melody from the melody editor.
     * @param melody string of up to eight notes [C D E F G A B C5] or rests [-] separated by spaces, which will be played one at a time, ex: "E D G F B A C5 B "
     * @param tempo number in beats per minute (bpm), dictating how long each note will play for
     */
    //% block="play melody $melody at tempo $tempo|(bpm)" blockId=playMelody
    //% weight=85 blockGap=8 help=music/play-melody
    //% melody.shadow="melody_editor"
    //% tempo.min=40 tempo.max=500
    //% tempo.defl=120
    //% parts=headphone
    //% group="Melody"
    //% deprecated=1
    export function playMelody(melody: string, tempo: number) {
        melody = melody || "";
        setTempo(tempo);
        let notes = getMelodyNotes(melody);

        music.startMelodyInternal(notes, MelodyOptions.Once)
        waitForMelodyEnd();
    }

    /**
     * Create a melody with the melody editor.
     * @param melody
     */
    //% block="$melody" blockId=melody_editor
    //% blockHidden = true
    //% weight=85 blockGap=8
    //% duplicateShadowOnDrag
    //% melody.fieldEditor="melody"
    //% melody.fieldOptions.decompileLiterals=true
    //% melody.fieldOptions.decompileIndirectFixedInstances="true"
    //% melody.fieldOptions.onParentBlock="true"
    //% shim=TD_ID
    //% group="Melody"
    export function melodyEditor(melody: string): string {
        return melody;
    }

}
