'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Adsr, { AdsrState } from "./adsr";
import SynthController, { SynthControllerState } from "./synthController";
import * as Tone from "tone";
import FilterController, { FilterState } from "./filter";
import ReverbController, { ReverbState } from "./reverb";
import AdsrController from "./adsrController";
import Arp from "./Arp/arp";
import ScaleController from "./scale";
import usePresetStore from "@/services/presetStore";

interface SynthProps {
    playNote?: boolean;
    pitchSignal: Tone.Signal<"frequency">;
    ctx: Tone.BaseContext;
    chordIntervals: number[];
}

export type SynthState = SynthControllerState & AdsrState;
// {
//     synthState: SynthControllerState;
//     adsrState: AdsrState;
//     filterState: FilterState;
//     reverbState: ReverbState;
// }

const Synth = ({ playNote, pitchSignal, ctx, chordIntervals }: SynthProps) => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(new Tone.Synth({context: ctx}));
    const filterRef = useRef<Tone.Filter | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const [filterLoaded, setFilterLoaded] = useState(false);
    const [reverbLoaded, setReverbLoaded] = useState(false);

    const adsrEnvelopes = useRef<Tone.Envelope[]>(Array.from({ length: 4 }, () => new Tone.Envelope()));

    useEffect(() => {
        if (!synthRef.current) return;
        pitchSignal.connect(synthRef.current.frequency);
    }, [pitchSignal, synthRef.current]);

    return(
        <div className="m-w-full">
            <SynthController synthRef={synthRef} 
            pitchSignal={pitchSignal}
            nodes={[filterRef, reverbRef]}
            adsrEnvelopes={adsrEnvelopes}
            playNoteState={playNote}
            ctx={ctx}
            filtersLoaded={filterLoaded && reverbLoaded}
            chordIntervals={chordIntervals}
            />
            
            
            <div className="grid grid-rows-1 grid-cols-4">
                <div className="col-span-3">
                    <AdsrController synthRef={synthRef} envelopes={adsrEnvelopes} />
                </div>
                
                <FilterController filterRef={filterRef}
                onLoaded = { () => {
                    console.log("Filter loaded", filterRef.current);
                    setFilterLoaded(true)} }
                ctx={ctx}/>
            </div>
            <ReverbController reverbRef={reverbRef}
            onLoaded = { () => {
                console.log("Reverb loaded", reverbRef.current);
                setReverbLoaded(true)} }
                ctx={ctx}/> 
            <Arp synthRef={synthRef} />           

        </div>
    )
};

export default Synth;