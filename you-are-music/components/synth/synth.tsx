'use client';

import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import Adsr, { AdsrState } from "./adsr";
import OscController, { SynthControllerState } from "./synthController";
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
    synthRefs?: RefObject<Set<Tone.Synth<Tone.SynthOptions>>>;
}

export type SynthState = SynthControllerState & AdsrState & FilterState & ReverbState;
// {
//     synthState: SynthControllerState;
//     adsrState: AdsrState;
//     filterState: FilterState;
//     reverbState: ReverbState;
// }

const Synth = ({ playNote, pitchSignal, ctx, chordIntervals, synthRefs }: SynthProps) => {
    const oscRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(new Tone.Synth({context: ctx}));
    const filterRef = useRef<Tone.Filter | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const [filterLoaded, setFilterLoaded] = useState(false);
    const [reverbLoaded, setReverbLoaded] = useState(false);

    const adsrEnvelopes = useRef<Tone.Envelope[]>(Array.from({ length: 4 }, () => new Tone.Envelope()));

    useEffect(() => {
        if (!oscRef.current) return;
        pitchSignal.connect(oscRef.current.frequency);
    }, [pitchSignal, oscRef.current]);

    useEffect(() => {
        if (!oscRef.current || !synthRefs) return;

        synthRefs.current?.add(oscRef.current);

        return () => {
            if(!oscRef.current) return;
            synthRefs.current?.delete(oscRef.current);
        };
    }, [synthRefs]);

    return(
        <div className="m-w-full">
            <OscController oscRef={oscRef} 
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
                    <AdsrController oscRef={oscRef} envelopes={adsrEnvelopes} />
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

        </div>
    )
};

export default Synth;