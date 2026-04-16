import { useEffect, useRef, useState } from "react";
import Synth from "./synth";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import ScaleController from "./scale";
import Increment from "../UI Control/Control/increment";
import PitchControll from "./pitchControll";

interface GlobalSynthControllerProps {
    ctx: Tone.BaseContext;
}

const GlobalSynthController = ({ ctx }: GlobalSynthControllerProps) => {
    const synthRefs = useRef<Set<Tone.Synth>>(new Set());
    const [playNote, setPlayNote] = useState(false);
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

            <PitchControll pitchSignal={pitchSignal} setEnvelope={setEnvelope} />
            
            < button onMouseDown={handlePlayNote} onMouseUp={handleStopNote}>Play note</button>

        </div>
    )
};

export default GlobalSynthController;