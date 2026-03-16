import { RefObject, useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { mapValues } from "@/utils/Math";

interface ControllerProps{
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>
}

const SynthController = ( {synthRef}: ControllerProps) => {

    const [gain, setGain] = useState<number>(50);
    const channelRef = useRef<Tone.Channel | null>(null);

    const playNote = async () => {
        if(!synthRef.current) return;

        await Tone.start();
        synthRef.current.triggerAttack("C4");
    }

    const stopNote = () => {
        synthRef.current?.triggerRelease();
    };

    useEffect(() => {

        if(!channelRef.current){
            channelRef.current = new Tone.Channel().toDestination();
        }

        if(!synthRef.current){
            synthRef.current = new Tone.Synth().connect(channelRef.current);
        }

        

        synthRef.current.connect(channelRef.current);
        channelRef.current.volume.value = -12
    },[]);

    useEffect(() => {
        if(!channelRef.current) return;
        const minVolDb = -60;
        const maxVolDb = 0;

        console.log(Math.log10(gain/10));

        const mappedVolume = mapValues(Math.log10(gain/10), 0, 1, minVolDb, maxVolDb);

        console.log(Math.log10(gain/10), mappedVolume);

        channelRef.current.volume.rampTo(mappedVolume);

    }, [gain])

    return(
        <div>
            <button onMouseDown={playNote} onMouseUp={stopNote}>Play note</button>

            <Knob
                label="Gain"
                setValue={setGain}
            />
        </div>
    )
};

export default SynthController;