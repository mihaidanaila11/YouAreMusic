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
import { indexFingerBus } from "@/services/ControlManager";
import FistControl from "./fistControl";

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
            <FistControl setPlayNote={setPlayNote} />
            <Presets />
            <div className="grid grid-cols-2 gap-10 m-6 max-md:grid-cols-1">
                <SynthWrapper synthId={"osc_1"}>
                    <Synth playNote={playNote}
                        ctx={ctx}
                        pitchSignal={pitchSignal.current}
                        chordIntervals={chordIntervals} />
                </SynthWrapper>

                <SynthWrapper synthId={"osc_2"}>
                    <Synth playNote={playNote}
                        ctx={ctx}
                        pitchSignal={pitchSignal.current}
                        chordIntervals={chordIntervals}/>
                </SynthWrapper>

            </div>

            <div className="flex flex-col items-center justify-center gap-6">
                <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-10">
                    <div className="flex items-center border-2 border-gray-300 rounded h-full">
                        <PitchControll pitchSignal={pitchSignal} setEnvelope={setEnvelope} />
                        <ChordManager setIntervals={setChordIntervals} />
                    </div>

                    <div className="">
                        <LfoController ctx={ctx} />
                    </div>
                </div>
                <Button onMouseDown={handlePlayNote} onMouseUp={handleStopNote}>Play note</Button>
            </div>
            
            
            

        </div>
    )
};

export default GlobalSynthController;