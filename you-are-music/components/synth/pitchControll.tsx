import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { RefObject, useCallback, useState } from "react";
import Increment from "../UI Control/Control/increment";
import ScaleController from "./scale";
import Toggle from "../UI Control/Control/toggle";

interface PitchControllProps {
    pitchSignal: RefObject<Tone.Signal<"frequency">>,
    setEnvelope: (env: Tone.ToneAudioNode) => void,
}

const PitchControll = ({ pitchSignal, setEnvelope }: PitchControllProps) => {
    const [snapToScale, setSnapToScale] = useState(false);
    const [snapOctave, setSnapOctave] = useState(0);
    const [noteRegions, setNoteRegions] = useState(7);
    const [scaleNotes, setScaleNotes] = useState<number[]>([]);

    const pitchMiddleware = useCallback((value: number, min: number, max: number) => {
        const valuePercent = (value - min) / (max - min);
        if (snapToScale && scaleNotes.length > 0) {
            // Implementation for pitch mapping within the scale
            const snapedRegion = Math.floor(valuePercent * (noteRegions));
            const octave = (snapOctave + 4) * 12 + Math.floor(snapedRegion / scaleNotes.length) * 12;
            const note = scaleNotes[snapedRegion % scaleNotes.length] + octave;

            if (Number.isNaN(note)) {
                console.warn("Calculated note is NaN. Check scale notes and snap settings.");
                return value;
            }

            return note;
        }
        return value;
    }, [snapToScale, scaleNotes, snapOctave, noteRegions]);

    return (
        <>
            <Knob
                label="Pitch"
                setValue={(value: number) => {
                    pitchSignal.current.rampTo(Tone.Frequency(value, "midi").toFrequency(), 0.05);
                }}
                minValue={21}
                maxValue={127}
                setEnvelope={(env) => {
                    setEnvelope(env);
                }}
                mapMiddleware={pitchMiddleware}
                step={1}
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
                        setSnapToScale(value)}} />
        </>
    )
};

export default PitchControll;