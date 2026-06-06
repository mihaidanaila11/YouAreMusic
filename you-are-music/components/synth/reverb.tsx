import { RefObject, useEffect, useState } from "react";
import Knob from "../UI Control/Control/knob";
import * as Tone from "tone";
import usePresetStore from "@/services/presetStore";
import { useCurrentOsc } from "@/app/hooks/presetSync";

interface ReverbControllerProps {
    reverbRef: RefObject<Tone.Reverb | null>,
    onLoaded?: () => void;
    ctx: Tone.BaseContext;
};

export type ReverbState = {
    wet: number;
    decay: number;
    preDelay: number;
};

const ReverbController = ({ reverbRef, onLoaded, ctx }: ReverbControllerProps) => {

    const [wet, setWet] = useState(1);
    const [decay, setDecay] = useState(1.5);
    const [preDelay, setPreDelay] = useState(0);

    const { state, setSynthState } = useCurrentOsc();
    const handleSavePreset = (value: any, path: keyof ReverbState) => setSynthState({ [path]: value });

    useEffect(() => {
        
        const initReverb = async () => {
            if (!reverbRef.current) {
                reverbRef.current = new Tone.Reverb({
                    decay: decay,
                    preDelay: preDelay,
                    wet: wet,
                    context: ctx
                });
            }

            await reverbRef.current.generate();
            onLoaded?.();
        };

        initReverb();
    }, []);

    useEffect(() => {
        if (!reverbRef.current) return;

        reverbRef.current.wet.rampTo(wet, 0.1);
    }, [wet]);

    useEffect(() => {
        if(!reverbRef.current) return;

        reverbRef.current.decay = decay;
        reverbRef.current.preDelay = preDelay;

        reverbRef.current.generate();
    }, [decay, preDelay])

    return (
        <div className="flex border-2 border-gray-300">
            <Knob
                minValue={0}
                maxValue={1}
                setValue={setWet}
                label="Wet"
                sensitivity={2} 
                value={state.wet}
                updatePreset={(value) => handleSavePreset(value, "wet")}
                />
            <Knob
                minValue={0}
                maxValue={10}
                setValue={setDecay}
                label="Decay"
                sensitivity={1} 
                value={state.decay}
                updatePreset={(value) => handleSavePreset(value, "decay")}
                />
            <Knob
                minValue={0}
                maxValue={1}
                setValue={setPreDelay}
                label="Pre Delay"
                sensitivity={2} 
                value={state.preDelay}
                updatePreset={(value) => handleSavePreset(value, "preDelay")}/>

        </div>
    )
};

export default ReverbController;