import { useEffect, useRef, useState } from "react";
import Synth from "./synth";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import ScaleController from "./scale";
import Increment from "../UI Control/Control/increment";
import PitchControll from "./pitchControll";
import ChordManager from "./chordManager";
import lfoController, { LfoState } from "./Lfo/lfoController";
import LfoController from "./Lfo/lfoController";
import { SynthControllerState } from "./synthController";
import usePresetStore from "@/services/presetStore";
import { SynthWrapper } from "@/app/context/synthIdContext";
import Presets from "../presets";
import Button from "../UI Control/Control/button";

interface GlobalSynthControllerProps {
    ctx: Tone.BaseContext;
}

export interface GlobalSynthControllerState {
    synth1State: SynthControllerState;
    synth2State: SynthControllerState;
    lfoState: LfoState;
}

const GlobalSynthController = ({ ctx }: GlobalSynthControllerProps) => {
    const synthRefs = useRef<Set<Tone.Synth>>(new Set());
    const [playNote, setPlayNote] = useState(false);
    const pitchSignal = useRef(new Tone.Signal(Tone.Frequency("C4").toFrequency(), "frequency"));
    const [chordIntervals, setChordIntervals] = useState<number[]>([0]);

    const [envelope, setEnvelope] = useState<Tone.ToneAudioNode | null>(null);

    useEffect(() => {
        synthRefs.current.forEach((synth) => {
            envelope?.connect(synth);
        });
    }, [envelope, synthRefs.current]);


    const handlePlayNote = () => {
        setPlayNote(true);
    };

    const handleStopNote = () => {
        setPlayNote(false);
    };


    return (
        <div>
            <Presets />
            <div className="grid grid-cols-2 gap-10 m-6">
                <SynthWrapper synthId={"synth_1"}>
                    <Synth playNote={playNote}
                        ctx={ctx}
                        pitchSignal={pitchSignal.current}
                        chordIntervals={chordIntervals} />
                </SynthWrapper>

                <SynthWrapper synthId={"synth_2"}>
                    <Synth playNote={playNote}
                        ctx={ctx}
                        pitchSignal={pitchSignal.current}
                        chordIntervals={chordIntervals}/>
                </SynthWrapper>

            </div>

            <div className="flex items-center gap-3 justify-center">
                <PitchControll pitchSignal={pitchSignal} setEnvelope={setEnvelope} />
                <ChordManager setIntervals={setChordIntervals} />
                <div className="w-1/6">
                    <LfoController ctx={ctx} />
                    <Button>click me</Button>
                </div>
            </div>
            
            
            <Button onMouseDown={handlePlayNote} onMouseUp={handleStopNote}>Play note</Button>

        </div>
    )
};

export default GlobalSynthController;