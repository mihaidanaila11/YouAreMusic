import { RefObject, useEffect, useState, useRef, useMemo, useCallback } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { mapValues } from "@/utils/Math";
import { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { OmniOscillatorType } from "tone/build/esm/source/oscillator/OscillatorInterface";
import OptionPick from "../UI Control/Control/optionPick";
import Increment from "../UI Control/Control/increment";
import ScaleController from "./scale";
import Toggle from "../UI Control/Control/toggle";
import GainKnob from "../UI Control/Control/Synth/gainKnob";

interface ControllerProps {
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>,
    pitchSignal: Tone.Signal<"frequency">,
    nodes?: RefObject<Tone.ToneAudioNode | null>[],
    adsrEnvelopes: RefObject<Tone.Envelope[]>,
    playNoteState?: boolean,
    pitch?: number,
    ctx: Tone.BaseContext,
    filtersLoaded: boolean,
    chordIntervals: number[]
}

const OscTypes = ["sine", "square", "triangle", "sawtooth"] as OmniOscillatorType[];

interface ChordVoice{
    synth: Tone.Synth<Tone.SynthOptions>,
    multiplier: Tone.Multiply
}

const SynthController = ({ synthRef, pitchSignal, nodes, adsrEnvelopes, playNoteState, ctx, filtersLoaded, chordIntervals }: ControllerProps) => {

    // const [gain, setGain] = useState<number>(50);
    const [detune, setDetune] = useState<number>(0);
    const [oscType, setOscType] = useState<OmniOscillatorType>("sawtooth");
    const [semitone, setSemitone] = useState<number>(0);
    const [octave, setOctave] = useState<number>(0);
    const [bpm, setBpm] = useState<number>(120);
    const maxDetune = 100;
    const [unison, setUnison] = useState<number>(0);
    const unisonVoices = useRef<Tone.Synth[]>([]);
    const chordVoices = useRef<ChordVoice[]>([]);

    // Basic Waveform Visualization
    const [waveform, setWaveform] = useState<Float32Array>(new Float32Array(0));

    useEffect(() => {
        const getBuffer = async () => {
            if (!synthRef.current) return null;
            const oscFreq = 100;
            const analyseTime = 1 / oscFreq;

            const buffer = await Tone.Offline(async () => {
                if (!synthRef.current) return;

                const synth = new Tone.Synth();
                synth.oscillator.type = oscType;
                synth.envelope.set({ attack: 0, decay: 0, sustain: 1, release: 0 });
                synth.toDestination();
                synth.triggerAttackRelease(oscFreq, analyseTime);

            }, analyseTime);

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

    const channelRef = useRef<Tone.Channel | null>(new Tone.Channel({ context: ctx }));

    useEffect(() => {
        if (!synthRef.current) return;
        synthRef.current.detune.rampTo(detune + semitone * 100 + octave * 1200, 0.05);
    }, [detune, semitone, octave]);


    // Handle detune
    useEffect(() => {
        if (!synthRef.current || !channelRef.current) return;

        const currentUnison = unisonVoices.current.length;

        if (unison === 0) {
            while (unisonVoices.current.length > 0) {
                const synthToRemove = unisonVoices.current.pop();
                synthToRemove?.dispose();
            }

            return;
        }

        if (unison > currentUnison) {
            const synthsNeeded = unison - currentUnison;

            for (let i = 0; i < synthsNeeded; i++) {
                const newSynth = new Tone.Synth({
                    ...(synthRef.current.get() as Tone.SynthOptions),
                    volume: 0,
                    context: ctx
                }).connect(channelRef.current);

                pitchSignal.connect(newSynth.frequency);

                unisonVoices.current.push(newSynth);
            }
        }
        else if (unison < currentUnison) {
            while (unisonVoices.current.length > unison) {
                const synthToRemove = unisonVoices.current.pop();
                pitchSignal.disconnect(synthToRemove!.frequency);
                synthToRemove?.dispose();
            }
        }

        const detuneStep = currentUnison > 1 ? (detune * 2) / (currentUnison - 1) : 0;

        unisonVoices.current.forEach((synth, index) => {
            const detuneValue = -detune + index * detuneStep;
            synth.detune.rampTo(detuneValue + semitone * 100 + octave * 1200, 0.05);
        
        });


    }, [unison, detune])


    useEffect(() => {
        if(!synthRef.current) return;

        chordVoices.current.forEach(chord => {
            chord.synth.dispose();
            chord.multiplier.dispose();
        });

        chordVoices.current = [];

        chordIntervals.forEach((interval) => {
            if(interval === 0 || !synthRef.current) return;

            const newSynth = new Tone.Synth({
                ...(synthRef.current.get() as Tone.SynthOptions),
                context: ctx
            }).connect(channelRef.current!);

            const multiplier = new Tone.Multiply({
                value: Math.pow(2, interval / 12),
                context: ctx
            });

            pitchSignal.chain(multiplier, newSynth.frequency);

            chordVoices.current.push({ synth: newSynth, multiplier });
        });
    }, [chordIntervals])

    const playNote = async () => {
        if (!synthRef.current) return;
        const note = Tone.Frequency(pitchSignal.value);

        synthRef.current.triggerAttack(note);

        unisonVoices.current.forEach((synth) => {
            synth.triggerAttack(note);
        });

        chordVoices.current.forEach((voice, index) => {
            const interval = chordIntervals[index + 1];
            const chordNote = note.transpose(interval);
            voice.synth.triggerAttack(chordNote);
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

        chordVoices.current.forEach((voice) => {
            voice.synth.triggerRelease();
        });

        adsrEnvelopes.current.forEach(env => {
            env.triggerRelease();
        });
    };

    useEffect(() => {
        if (playNoteState) {
            playNote();
        } else {
            stopNote();
        }
    }, [playNoteState])

    useEffect(() => {

        if (!channelRef.current) {
            channelRef.current = new Tone.Channel({ context: ctx });
        }

        if (!synthRef.current) {

            synthRef.current = new Tone.Synth({ context: ctx });
            synthRef.current.oscillator.type = oscType;
        }

        synthRef.current.disconnect();


        synthRef.current.connect(channelRef.current);

        const validNodes = nodes
            ?.map((node) => node.current)
            .filter((node) => node !== null)
            .filter((node) => node.context === channelRef.current?.context) || [];

        if (validNodes.length > 0 && !!nodes) {
            channelRef.current.disconnect();
            channelRef.current.connect(validNodes[0]);

            for (let i = 0; i < validNodes.length - 1; i++) {
                validNodes[i].disconnect();
                validNodes[i].connect(validNodes[i + 1]);
            }

            validNodes[validNodes.length - 1].disconnect();
            validNodes[validNodes.length - 1].toDestination();
        }
        else {
            console.log("No valid nodes to connect to, connecting directly to destination");
            channelRef.current.disconnect();
            channelRef.current.toDestination();
        }
        // channelRef.current.volume.value = -12;
    }, [filtersLoaded, ctx]);

    // useEffect(() => {
    //     if (!channelRef.current) return;
    //     const minVolDb = -80;
    //     const maxVolDb = 0;

    //     const mappedVolume = mapValues(Math.log10(gain / 10), 0, 1, minVolDb, maxVolDb);
    //     channelRef.current.volume.rampTo(mappedVolume, 0.05);

    // }, [gain])

    // Handle Oscillator Type Change
    useEffect(() => {
        if (!synthRef.current) return;
        synthRef.current.oscillator.type = oscType;

        chordVoices.current.forEach(voice => {
            voice.synth.oscillator.type = oscType;
        });

        unisonVoices.current.forEach(synth => {
            synth.oscillator.type = oscType;
        });
    }, [oscType]);

    // Handle BPM change
    useEffect(() => {
        Tone.Transport.bpm.rampTo(bpm, 0.1);
    }, [bpm]);

    // Handle keyboard play/stop
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            if(e.key === " "){
                e.preventDefault();
                playNote();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.preventDefault();
                stopNote();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    })

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

                    <GainKnob audioNodeRef={channelRef} callback={(gain) => {
                        channelRef.current?.volume.rampTo(gain, 0.05);
                        unisonVoices.current.forEach(synth => {
                            synth.volume.rampTo(gain, 0.05);
                        })
                    }} />

                    <Knob
                        label="BPM"
                        setValue={setBpm}
                        minValue={20}
                        maxValue={500}
                        sensitivity={4}
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
                            if (!synthRef.current) return;
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
                        setEnvelope={() => { }}
                    />

                </div>
            </div>
        </div>
    )
};

export default SynthController;