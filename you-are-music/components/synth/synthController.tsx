import { RefObject, useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { mapValues } from "@/utils/Math";

interface ControllerProps {
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>,
    nodes?: RefObject<Tone.ToneAudioNode | null>[]
}

const SynthController = ({ synthRef, nodes }: ControllerProps) => {

    const [gain, setGain] = useState<number>(50);
    const [pitch, setPitch] = useState<number>(20);
    const [detune, setDetune] = useState<number>(0);
    const maxDetune = 100;

    const [unison, setUnison] = useState<number>(0);
    const unisonVoices = useRef<Tone.Synth[]>([]);


    const channelRef = useRef<Tone.Channel | null>(null);

    useEffect(() => {
        if (!synthRef.current) return;
        const midiPitch = Tone.Frequency(pitch).toMidi();
        const midiFrequency = Tone.Frequency(midiPitch, "midi").toFrequency();
        synthRef.current.frequency.rampTo(midiFrequency, 0.05);
    }, [pitch]);

    useEffect(() => {
        if (!synthRef.current) return;
        synthRef.current.detune.rampTo(detune, 0.05);
    }, [detune]);


    // Handle detune
    useEffect(() => {
        if (!synthRef.current || !channelRef.current) return;

        const currentUnison = unisonVoices.current.length;

        if(unison === 0){
            unisonVoices.current.forEach( _ => {
                const synthToRemove = unisonVoices.current.pop();
                synthToRemove?.dispose();
            });

            return;
        }

        if (unison > currentUnison) {
            const synthsNeeded = unison - currentUnison;

            for (let i = 0; i < synthsNeeded; i++) {
                const newSynth = new Tone.Synth(synthRef.current.get() as Tone.SynthOptions).connect(channelRef.current);
                unisonVoices.current.push(newSynth);
            }
        }
        else if (unison < currentUnison) {
            const synthsToRemove = currentUnison - unison;

            for (let i = 0; i < synthsToRemove; i++) {
                const synthToRemove = unisonVoices.current.pop();
                synthToRemove?.dispose();
            }
        }

        const detuneStep = currentUnison > 1 ? (detune * 2) / (currentUnison - 1) : 1;
        unisonVoices.current.forEach((synth, index) => {
            const detuneValue = -detune + index * detuneStep;
            synth.detune.rampTo(detuneValue, 0.05);
        });
        

    }, [unison])

    const playNote = async () => {
        if (!synthRef.current) return;

        await Tone.start();
        synthRef.current.triggerAttack(pitch);
        unisonVoices.current.forEach((synth) => {
            synth.triggerAttack(pitch);
        });
    }

    const stopNote = () => {
        synthRef.current?.triggerRelease();
        unisonVoices.current.forEach((synth) => {
            synth.triggerRelease();
        });
    };

    useEffect(() => {

        if (!channelRef.current) {
            channelRef.current = new Tone.Channel();
        }

        if (!synthRef.current) {

            synthRef.current = new Tone.Synth();
            synthRef.current.oscillator.type = "sawtooth";
        }

        synthRef.current.disconnect();


        synthRef.current.connect(channelRef.current);

        const validNodes = nodes
            ?.map((node) => node.current)
            .filter((node) => !!node) || [];

        if (validNodes.length > 0 && !!nodes) {
            const validNodes = nodes
                .map((node) => node.current)
                .filter((node) => !!node) || [];
            channelRef.current.connect(validNodes[0]);

            for (let i = 0; i < validNodes.length - 1; i++) {
                validNodes[i].connect(validNodes[i + 1]);
            }

            validNodes[validNodes.length - 1].toDestination();
        }
        else {
            
        }

        channelRef.current.volume.value = -12;
    }, [nodes]);

    useEffect(() => {
        if (!channelRef.current) return;
        const minVolDb = -80;
        const maxVolDb = 0;

        const mappedVolume = mapValues(Math.log10(gain / 10), 0, 1, minVolDb, maxVolDb);
        console.log(mappedVolume);

        channelRef.current.volume.rampTo(mappedVolume, 0.05);

    }, [gain])

    return (
        <div className="flex gap-1">
            <button onMouseDown={playNote} onMouseUp={stopNote}>Play note</button>

            <Knob
                label="Gain"
                setValue={setGain}
            />

            <Knob
                label="Pitch"
                setValue={setPitch}
                minValue={20}
                maxValue={1000}
            />

            <Knob
                label="Detune"
                setValue={setDetune}
                minValue={0}
                maxValue={100}
                defaultValue={0}
            />

            <Knob
                label="Unison"
                setValue={setUnison}
                minValue={0}
                maxValue={8}
                step={1}
                sensitivity={8}
                defaultValue={0}
            />
        </div>
    )
};

export default SynthController;