import { useState, useCallback } from "react";
import * as Tone from "tone";
import Knob from "../knob";
import ScaleController from "@/components/synth/scale";
import Increment from "../increment";
import Toggle from "../toggle";
import { Instrument } from "tone/build/esm/instrument/Instrument";

interface PitchKnobProps {
    callback: (gain: number) => void,
    audioNodeRef: React.RefObject<Instrument<any> | null>
}

const PitchKnob = ({ callback, audioNodeRef }: PitchKnobProps) => {
    const [scaleNotes, setScaleNotes] = useState<number[]>([]);

    const [snapToScale, setSnapToScale] = useState<boolean>(false);
    const [noteRegions, setNoteRegions] = useState(7);
    const [snapOctave, setSnapOctave] = useState<number>(4);

    const pitchMiddleware = useCallback((value: number, min: number, max: number) => {
        const valuePercent = (value - min) / (max - min);
        if (snapToScale && scaleNotes.length > 0) {
            // Implementation for pitch mapping within the scale
            const snapedRegion = Math.floor(valuePercent * (noteRegions));
            const octave = (snapOctave + 4) * 12 + Math.floor(snapedRegion / scaleNotes.length) * 12;
            const note = scaleNotes[snapedRegion % scaleNotes.length] + octave;
            console.log("Snapped Note:", note, snapOctave);
            const freq = Tone.Frequency(note, "midi").toFrequency();
            return freq;
        }
        return value;
    }, [snapToScale, scaleNotes, snapOctave, noteRegions]);

    return (
        <div>
            <Knob
                label="Pitch"
                setValue={callback}
                minValue={20}
                maxValue={1000}
                setEnvelope={(env) => {
                    if (!audioNodeRef.current) return;
                    env.connect(audioNodeRef.current.frequency)
                }}
                mapMiddleware={pitchMiddleware}
            />
            {snapToScale && (
                <div>
                    <ScaleController setNotes={setScaleNotes} />
                    <Increment label="Snap Octave" setValue={setSnapOctave} minValue={-3} maxValue={3} defaultValue={0} />
                    <Increment label="Note Regions" setValue={setNoteRegions} minValue={1} maxValue={24} defaultValue={7} />
                </div>
            )}
            <Toggle label="Snap to Scale" onToggle={(value) => {
                console.log("Snap to Scale:", value);
                setSnapToScale(value)
            }} />
        </div>

    )
}