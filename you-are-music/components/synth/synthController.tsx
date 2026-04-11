import { RefObject, useEffect, useState, useRef, useMemo } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { mapValues } from "@/utils/Math";
import { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { OmniOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";
import OptionPick from "../UI Control/Control/optionPick";
import Increment from "../UI Control/Control/increment";

interface ControllerProps {
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>,
    nodes?: RefObject<Tone.ToneAudioNode | null>[],
    adsrEnvelopes: RefObject<Tone.Envelope[]>
}

const OscTypes = ["sine", "square", "triangle", "sawtooth"] as OmniOscillatorType[];

const SynthController = ({ synthRef, nodes, adsrEnvelopes }: ControllerProps) => {

    const [gain, setGain] = useState<number>(50);
    const [pitch, setPitch] = useState<number>(20);
    const [detune, setDetune] = useState<number>(0);
    const [oscType, setOscType] = useState<OmniOscillatorType>("sawtooth");
    const [semitone, setSemitone] = useState<number>(0);
    const [octave, setOctave] = useState<number>(0);
    const maxDetune = 100;

    const [unison, setUnison] = useState<number>(0);
    const unisonVoices = useRef<Tone.Synth[]>([]);

    const [ctx, setCtx] = useState<Tone.BaseContext | null>(null);

    // Basic Waveform Visualization
    const [waveform, setWaveform] = useState<Float32Array>(new Float32Array(0));

    useEffect(() => {
        const getBuffer = async () => {
            if (!synthRef.current) return null;
            const oscFreq = 100;

            const buffer = await Tone.Offline(async () => {
                if (!synthRef.current) return;

                const synth = new Tone.Synth();
                synth.oscillator.type = oscType;
                synth.toDestination();
                synth.triggerAttackRelease(oscFreq, 1 / oscFreq);

            }, 1 / oscFreq);

            return buffer;
        };

        getBuffer().then((buffer) => {
            if (!buffer) return;
            const channelData = buffer.getChannelData(0);
            setWaveform(new Float32Array(channelData));
        });
    }, [oscType]);



    const waveformGraphData = useMemo<ChartData<"line", number[], number>>(() => {
        return {
            labels: Array.from({ length: waveform.length }, (_, i) => i),
            datasets: [{
                data: Array.from(waveform)
            }]
        }
    }, [waveform]);


    const options = {
        maintainAspectRatio: false,
        responsive: true,
        elements: {
            point: {
                radius: 0,
            }
        },
        plugins: {

            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
        scales: {
            x: {
                border: {
                    display: false,
                },
                type: 'linear' as const,
                grid: {
                    display: false,
                },
                ticks: {
                    display: false,
                }
            },

            y: {
                border: {
                    display: false,
                },
                grid: {
                    display: false,
                },
                ticks: {
                    display: false,
                }
            }
        }
    } as ChartOptions<"line">;

    // --------------------

    const channelRef = useRef<Tone.Channel | null>(null);

    useEffect(() => {
        if (!synthRef.current) return;
        const midiPitch = Tone.Frequency(pitch).toMidi();
        const midiFrequency = Tone.Frequency(midiPitch, "midi").toFrequency();

        if (!Number.isFinite(midiFrequency) || midiFrequency <= 0) return;

        console.log("Setting frequency to:", midiFrequency);
        synthRef.current.frequency.setValueAtTime(midiFrequency, Tone.now());
    }, [pitch]);

    useEffect(() => {
        if (!synthRef.current) return;
        synthRef.current.detune.rampTo(detune + semitone * 100 + octave * 1200, 0.05);

        console.log("Detune set to:", detune + semitone * 100 + octave * 1200);
    }, [detune, semitone, octave]);


    // Handle detune
    useEffect(() => {
        if (!synthRef.current || !channelRef.current) return;

        const currentUnison = unisonVoices.current.length;

        if (unison === 0) {
            unisonVoices.current.forEach(_ => {
                const synthToRemove = unisonVoices.current.pop();
                synthToRemove?.dispose();
            });

            return;
        }

        if (unison > currentUnison) {
            const synthsNeeded = unison - currentUnison;

            for (let i = 0; i < synthsNeeded; i++) {
                const newSynth = new Tone.Synth({
                    ...(synthRef.current.get() as Tone.SynthOptions),
                    context: channelRef.current.context
                }).connect(channelRef.current);
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
        synthRef.current.triggerAttack(pitch);
        unisonVoices.current.forEach((synth) => {
            synth.triggerAttack(pitch);
        });

        adsrEnvelopes.current.forEach(env => {
            env.triggerAttack();
        });
    }

    const stopNote = () => {
        synthRef.current?.triggerRelease();
        unisonVoices.current.forEach((synth) => {
            synth.triggerRelease();
        });

        adsrEnvelopes.current.forEach(env => {
            env.triggerRelease();
        });
    };

    useEffect(() => {

        if (!channelRef.current) {
            channelRef.current = new Tone.Channel();
        }

        if (!synthRef.current) {

            synthRef.current = new Tone.Synth({ context: channelRef.current.context });
            synthRef.current.oscillator.type = oscType;
        }

        synthRef.current.disconnect();


        synthRef.current.connect(channelRef.current);

        const validNodes = nodes
            ?.map((node) => node.current)
            .filter((node) => node !== null)
            .filter((node) => node.context === channelRef.current?.context) || [];

        if (validNodes.length > 0 && !!nodes) {
            channelRef.current.connect(validNodes[0]);

            for (let i = 0; i < validNodes.length - 1; i++) {
                validNodes[i].disconnect();
                validNodes[i].connect(validNodes[i + 1]);
            }

            validNodes[validNodes.length - 1].disconnect();
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
        channelRef.current.volume.rampTo(mappedVolume, 0.05);

    }, [gain])

    // Handle Oscillator Type Change
    useEffect(() => {
        if (!synthRef.current) return;
        synthRef.current.oscillator.type = oscType;
    }, [oscType]);

    return (

        <div className="select-none border-2 border-gray-300">
            <div className="">
                <OptionPick setOption={setOscType} options={OscTypes} />
                <div className="flex">
                    <Increment setValue={setSemitone} minValue={-11} maxValue={11} label="Semitone" />
                    <Increment setValue={setOctave} minValue={-3} maxValue={3} label="Octave" />
                </div>
                <div className="h-20">
                    <Line data={waveformGraphData} options={options} />
                </div>

            </div>

            <div className="flex justify-between">
                <div className="flex items-center gap-3">
                    < button onMouseDown={playNote} onMouseUp={stopNote}>Play note</button>

                    <Knob
                        label="Gain"
                        setValue={setGain}
                        setEnvelope={(env) => {
                            if(!channelRef.current) return;
                            env.connect(channelRef.current.volume);
                        }}
                    />

                    <Knob
                        label="Pitch"
                        setValue={setPitch}
                        minValue={20}
                        maxValue={1000}
                        setEnvelope={(env) => {
                            if(!synthRef.current) return;
                            env.connect(synthRef.current.frequency)
                        }}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Knob
                        label="Detune"
                        setValue={setDetune}
                        minValue={0}
                        maxValue={100}
                        defaultValue={0}
                        setEnvelope={(env) => {
                            if(!synthRef.current) return;
                            env.connect(synthRef.current.detune);
                        }}
                    />

                    <Knob
                        label="Unison"
                        setValue={setUnison}
                        minValue={0}
                        maxValue={8}
                        step={1}
                        sensitivity={8}
                        defaultValue={0}
                        setEnvelope= { () => {} }
                    />

                </div>
            </div>
        </div>
    )
};

export default SynthController;