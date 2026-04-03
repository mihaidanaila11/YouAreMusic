import { RefObject, useEffect, useState } from "react";
import Knob from "../UI Control/Control/knob";
import * as Tone from "tone";

interface ReverbControllerProps {
    reverbRef: RefObject<Tone.Reverb | null>
}

const ReverbController = ({ reverbRef }: ReverbControllerProps) => {

    const [wet, setWet] = useState(1);
    const [decay, setDecay] = useState(1.5);
    const [preDelay, setPreDelay] = useState(0);

    useEffect(() => {
        const initReverb = async () => {
            if (!reverbRef.current) {
                reverbRef.current = new Tone.Reverb({
                    decay: decay,
                    preDelay: preDelay,
                    wet: wet
                });
            }

            await reverbRef.current.generate();
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
        <div className="flex">
            <Knob
                minValue={0}
                maxValue={1}
                setValue={setWet}
                label="Wet"
                sensitivity={2} />
            <Knob
                minValue={0}
                maxValue={10}
                setValue={setDecay}
                label="Decay"
                sensitivity={1} />
            <Knob
                minValue={0}
                maxValue={1}
                setValue={setPreDelay}
                label="Pre Delay"
                sensitivity={2} />

        </div>
    )
};

export default ReverbController;