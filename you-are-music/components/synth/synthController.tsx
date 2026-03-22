import { RefObject, useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { mapValues } from "@/utils/Math";

interface ControllerProps{
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>,
    nodes?: RefObject<Tone.ToneAudioNode | null>[]
}

const SynthController = ( {synthRef, nodes}: ControllerProps) => {

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

            synthRef.current = new Tone.Synth();
        }

        synthRef.current.disconnect();


        const validNodes = nodes
                            ?.map( (node) => node.current)
                            .filter( (node) => !!node) || [];
            
        if(validNodes.length > 0 && !!nodes){
            const validNodes = nodes
                            .map( (node) => node.current)
                            .filter( (node) => !!node) || [];
            synthRef.current.connect(validNodes[0]);

            for(let i = 0; i < validNodes.length - 1; i++){
                validNodes[i].connect(validNodes[i+1]);
            }

            validNodes[validNodes.length - 1].connect(channelRef.current);
        }    
        else{
            synthRef.current.connect(channelRef.current);
        }
        
        channelRef.current.volume.value = -12
    },[nodes, synthRef]);

    useEffect(() => {
        if(!channelRef.current) return;
        const minVolDb = -60;
        const maxVolDb = 0;

        const mappedVolume = mapValues(Math.log10(gain/10), 0, 1, minVolDb, maxVolDb);

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