import { useEffect, useRef, useState } from "react";
import Synth from "./synth";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";

interface GlobalSynthControllerProps {
    ctx: Tone.BaseContext;
}

const GlobalSynthController = ({ ctx }: GlobalSynthControllerProps) => {
    const synthRefs = useRef<Set<Tone.Synth>>(new Set());
    const [playNote, setPlayNote] = useState(false);
    const pitchRef = useRef(60); // MIDI note number for middle C
    const pitchSignal = useRef(new Tone.Signal(Tone.Frequency("C4").toFrequency(), "frequency"));

    const [envelope, setEnvelope] = useState<Tone.ToneAudioNode | null>(null);

    useEffect(() => {
        synthRefs.current.forEach((synth) => {
            envelope?.connect(synth);
        });
    }, [envelope, synthRefs.current]);


    const handlePlayNote = () => {
        setPlayNote(true);
    };

    const handleStopNote = () => {
        setPlayNote(false);
    };


    return (
        <div >
            <div className="grid grid-cols-2 gap-10 m-6">
  
                    <Synth playNote={playNote}
                    ctx={ctx}
                    pitchSignal={pitchSignal.current}/>
                    <Synth playNote={playNote} 
                    ctx={ctx}
                    pitchSignal={pitchSignal.current} />

            </div>

            <Knob
                        label="Pitch"
                        setValue={(value: number) => {
                            pitchSignal.current.rampTo(Tone.Frequency(value, "midi").toFrequency(), 0.05);
                        }}
                        minValue={21}
                        maxValue={127}
                        setEnvelope={(env) => {
                            setEnvelope(env);
                        }}
                        step={1}
                        // mapMiddleware={pitchMiddleware}
                    />

                    {/* {snapToScale && (
                        <div>
                            <ScaleController setNotes={setScaleNotes} />
                            <Increment label="Snap Octave" setValue={setSnapOctave} minValue={-3} maxValue={3} defaultValue={0}/>
                            <Increment label="Note Regions" setValue={setNoteRegions} minValue={1} maxValue={24} defaultValue={7}/>
                        </div>
                    )} */}
            < button onMouseDown={handlePlayNote} onMouseUp={handleStopNote}>Play note</button>

        </div>
    )
};

export default GlobalSynthController;