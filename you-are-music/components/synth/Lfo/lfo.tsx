import { RefObject, useRef } from "react";
import * as Tone from "tone";
import Knob from "../../UI Control/Control/knob";
import usePresetStore from "@/services/presetStore";

interface LfoControllerProps {
    lfoRef?: Tone.LFO,
    id: number,
}

export type LfoState = {
    frequency: number;
    amplitude: number;
}

const lfoPath = "lfos";

const Lfo = ({ lfoRef, id }: LfoControllerProps) => {
    const setGlobalState = usePresetStore((s) => s.updateLfoState);

    const handleUpdateGlobalState = (path: keyof LfoState, value: number) => {
        setGlobalState(`${lfoPath}_${id}`, { [path]: value });
    }

    const state = usePresetStore((s) => s.globalStates.lfos[`${lfoPath}_${id}`]);
    
    return(
        <div className="flex justify-between">
            <Knob
            label="Frequency"
            setValue={(value: number) => {
                if (!lfoRef) return;
                lfoRef.frequency.rampTo(value, 0.05);
            }}
            minValue={0.1}
            maxValue={10}
            step={0.1}
            sensitivity={2}
            value = {state.frequency}
            updatePreset = {(value) => handleUpdateGlobalState('frequency', value)}
            />

            <Knob
            label="Amplitude"
            setValue={(value: number) => {
                if (!lfoRef) return;
                lfoRef.amplitude.rampTo(value, 0.05);
            }}
            minValue={0}
            maxValue={1}
            step={0.01}
            sensitivity={2}
            value = {state.amplitude}
            updatePreset = {(value) => handleUpdateGlobalState('amplitude', value)}
            />
        </div>
    )
};

export default Lfo;