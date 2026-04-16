import { useRef, useState } from "react";
import Synth from "./synth";
import * as Tone from "tone";

const GlobalSynthController = () => {
    const synthRefs = useRef<Set<Tone.Synth>>(new Set());
    const [playNote, setPlayNote] = useState(false);

    const handlePlayNote = () => {
        setPlayNote(true);
    };

    const handleStopNote = () => {
        setPlayNote(false);
    };


    return (
        <div >
            <div className="grid grid-cols-2 gap-10 m-6">
  
                    <Synth playNote={playNote} />
                    <Synth playNote={playNote} />

            </div>
            < button onMouseDown={handlePlayNote} onMouseUp={handleStopNote}>Play note</button>

        </div>
    )
};

export default GlobalSynthController;