import { RefObject, useRef, useState } from "react";
import Adsr from "./adsr";
import * as Tone from "tone";
import AdsrDragManager from "@/services/AdsrDragManager";

interface AdsrControllerProps {
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>
    envelopes: RefObject<Tone.Envelope[]>
}

const AdsrController = ({ synthRef, envelopes }: AdsrControllerProps) => {
    const [activeEnv, setActiveEnv] = useState<number>(0);

    const synthSetParams = (attack: number, decay: number, sustain: number, release: number) => {
        if (!synthRef || !synthRef.current) return;
        synthRef.current.envelope.set({
            attack: attack,
            decay: decay,
            sustain: sustain,
            release: release
        });
    }

    const envs = [
        <div className={activeEnv === 0 ? "block" : "hidden"} key={0}>
            <Adsr key={0} label={`Env 1`} setParams={synthSetParams} />
        </div>,


        ...Array.from({ length: envelopes.current.length - 1 }, (_, i) => (
            <div className={activeEnv === i + 1 ? "block" : "hidden"} key={i + 1}>
                <Adsr key={i + 1} label={`Env ${i + 2}`}
                    setParams={(attack, decay, sustain, release) => envelopes.current[i + 1].set({
                        attack: attack,
                        decay: decay,
                        sustain: sustain,
                        release: release
                    })} />
            </div>
        ))
    ];

    const handleEnvChange = (index: number) => {
        setActiveEnv(index);
    }

    const handleEnvDrag = (index: number) => {
        console.log("dragging env", index);
        AdsrDragManager.setCurrentDragged(envelopes.current[index]);
    }

    const handleEnvDrop = () => {
        AdsrDragManager.dropCurrentDragged();
    }

    console.log("Active envelope index:", activeEnv);
    return(
        <div className="border-2 border-gray-300">
            <div className="w-1/2 flex justify-between">
                {Array.from({ length: envelopes.current.length }, (_, i) => (
                    <span className="cursor-pointer dragableAdsr" key={i}
                    onClick={() => {handleEnvChange(i)}}
                    draggable={true} 
                    onDragStart={() => {handleEnvDrag(i)}} 
                    onDragEnd={handleEnvDrop}>
                        {i + 1}
                    </span>
                ))}
            </div>
            
            <div className="border-t-3 border-gray-300">
                {envs}
            </div>
        </div>
    )
};

export default AdsrController;