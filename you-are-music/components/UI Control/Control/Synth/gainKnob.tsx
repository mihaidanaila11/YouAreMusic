import { mapValues } from "@/utils/Math";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import Knob from "../knob";
import { Instrument } from "tone/build/esm/instrument/Instrument";

interface GainKnobProps {
    callback: (gain: number) => void,
    audioNodeRef: React.RefObject<Instrument<any> | Tone.Channel | null>
    
}

const GainKnob = ({ callback, audioNodeRef }: GainKnobProps) => {
    const handleGainChange = (value: number) => {
        const minVolDb = -80;
        const maxVolDb = 0;

        const mappedVolume = mapValues(Math.log10(value / 10), 0, 1, minVolDb, maxVolDb);
        callback(mappedVolume);
    }

    return (
        <Knob
            label="Gain"
            setValue={handleGainChange}
            setEnvelope={(env) => {
                if (!audioNodeRef.current) return;
                env.connect(audioNodeRef.current.volume);
            }}
        />
    )
};

export default GainKnob;