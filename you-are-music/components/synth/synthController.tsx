import { RefObject, useRef } from "react";
import * as Tone from "tone";

interface ControllerProps{
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>
}

const SynthController = ( {synthRef}: ControllerProps) => {

    const playNote = async () => {
        if(!synthRef.current){
            synthRef.current = new Tone.Synth().toDestination();
        }
        await Tone.start()
        synthRef.current.triggerAttack("C4");
    }

    const stopNote = () => {
        synthRef.current?.triggerRelease();
    }

    console.log("controller")

    return(
        <button onMouseDown={playNote} onMouseUp={stopNote}>Play note</button>
    )
};

export default SynthController;