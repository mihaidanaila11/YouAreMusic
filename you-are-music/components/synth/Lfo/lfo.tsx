import { RefObject, useRef } from "react";
import * as Tone from "tone";
import Knob from "../../UI Control/Control/knob";

interface LfoControllerProps {
    lfoRef?: Tone.LFO,
}

const Lfo = ({ lfoRef }: LfoControllerProps) => {


    return(
        <div className="flex gap-3">
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
            />
        </div>
    )
};

export default Lfo;