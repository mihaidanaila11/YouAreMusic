import { useEffect, useRef, useState } from "react";
import Lfo from "./lfo";
import DragManager from "@/services/AdsrDragManager";
import * as Tone from "tone";

interface LfoControllerProps {
    lfosNumber?: number;
    ctx: Tone.BaseContext;
}

export interface LfoState {
    frequency: number;
    min: number;
    max: number;
    type: Tone.ToneOscillatorType;
}

const LfoController = ({ lfosNumber = 3, ctx }: LfoControllerProps) => {
    const [currentLfo, setCurrentLfo] = useState(0);


    const lfos = useRef<Tone.LFO[]>(Array.from({ length: lfosNumber }, () => new Tone.LFO({
            frequency: "4n",
            min: 0,
            max: 1,
            type: "sine",
            context: ctx})));

    useEffect(() => {
        lfos.current.forEach((lfo) => {
            lfo.stop();
            lfo.start();
        });

        console.log("LFOs initialized:", lfos.current);
    }, [ctx])

    const lfosDivs = Array.from({ length: lfosNumber }, (_, i) => (
        <div key={i} className={`${currentLfo === i ? "block" : "hidden"}`}>
            <h3>LFO {i + 1}</h3>
            <Lfo lfoRef={lfos.current[i]} />
        </div>
    ));

    const handleEnvChange = (index: number) => {
        setCurrentLfo(index);
    }
    const handleEnvDrag = (index: number) => {
        if (!lfos.current[index]) return;
        console.log("dragging env", index);
        DragManager.setCurrentLfo(lfos.current[index]);
    }

    const handleEnvDrop = () => {
        DragManager.dropCurrentLfo();
    }

    return (
        <div className="border-2 border-gray-300">
            <div className="m-3">
                <div className=" flex justify-between">
                    {Array.from({ length: lfosNumber }, (_, i) => (
                        <span className="cursor-pointer dragableAdsr" key={i}
                            onClick={() => { handleEnvChange(i) }}
                            draggable={true}
                            onDragStart={() => { handleEnvDrag(i) }}
                            onDragEnd={handleEnvDrop}>
                            {i + 1}
                        </span>
                    ))}
                </div>

                {lfosDivs}
            </div>

        </div>
    )
}

export default LfoController;