import MapControll from "@/components/hand/mapControll";
import Increment from "@/components/UI Control/Control/increment";
import Knob from "@/components/UI Control/Control/knob";
import GainKnob from "@/components/UI Control/Control/Synth/gainKnob";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface SampleControllerProps {
    ctx: Tone.BaseContext,
}

const SampleController = ({ ctx }: SampleControllerProps) => {
    const samplerRef = useRef<Tone.Sampler | null>(null);
    const [sampleLoaded, setSampleLoaded] = useState(false);
    const [playTrashold, setPlayThreshold] = useState(0.5); // Exemplu de prag pentru declanșarea sunetului
    const fingerReleased = useRef(true);

    const [octave, setOctave] = useState(0);
    const [semitone, setSemitone] = useState(0);


    useEffect(() => {
        console.log("context effect", Tone.getContext().isOffline);
    }, [Tone.getContext().isOffline]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            console.log("Selected file:", file);
            console.log("Blob URL:", blobUrl);
            console.log("context offline", Tone.getContext().isOffline);

            samplerRef.current = new Tone.Sampler({
                urls: {
                    C4: blobUrl
                },
                context: ctx,
                onload: () => {
                    console.log("Sample loaded successfully");
                    setSampleLoaded(true);
                }
            }).toDestination();
        }
    }

    const handleTrigger = () => {
        if (!samplerRef.current) {
            console.error("Samplerul nu este instanțiat!");
            return;
        }


        if (samplerRef.current.loaded) {
            // Forțăm un volum mai mare și o durată fixă pentru test

            console.log(samplerRef.current.context.isOffline);
            const note = Tone.Frequency("C4").transpose(semitone).transpose(octave * 12).toNote();
            samplerRef.current.triggerAttackRelease(note, "1n");
            console.log("Attack triggered!");
        } else {
            console.warn("Fișierul încă se încarcă în buffer...");
        }
    };

    const handleRelease = () => {
        if (!samplerRef.current) return;

        console.log("Releasing sample");

        samplerRef.current.triggerRelease("C4");
    }

    const mapControll = (distance: number) => {
        if (distance > playTrashold && !fingerReleased.current) {
            fingerReleased.current = true;
        }

        if (distance < playTrashold && fingerReleased.current) {
            handleTrigger();
            fingerReleased.current = false;
            return;
        }
    }

    return (
        <div>
            <h1>Sample Controller</h1>
            <div className="flex items-center">
                <input type="file" accept="audio/*" onChange={handleFileChange} />

                {sampleLoaded && (
                    <div className="flex items-center">
                        <Knob
                            label="Treshold"
                            setValue={setPlayThreshold}
                            minValue={0}
                            maxValue={1}
                            sensitivity={2}
                        />
                        <GainKnob audioNodeRef={samplerRef} callback={(gain) => {
                            samplerRef.current?.volume.rampTo(gain, 0.05);
                            console.log(samplerRef.current?.volume.value);
                        }} />

                        <Increment label="Octave" setValue={setOctave} minValue={-3} maxValue={3} defaultValue={0} />
                        <Increment label="Semitone" setValue={setSemitone} minValue={-11} maxValue={11} defaultValue={0} />
                        <MapControll
                            mapKnobValue={mapControll}
                            showMenu={true}
                        />
                        <button onMouseDown={handleTrigger} onMouseUp={handleRelease}>Play Sample</button>

                    </div>
                )}
            </div>
        </div>
    )
};

export default SampleController;