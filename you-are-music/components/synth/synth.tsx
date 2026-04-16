'use client';

import { useMemo, useRef } from "react";
import Adsr from "./adsr";
import SynthController from "./synthController";
import * as Tone from "tone";
import FilterController from "./filter";
import ReverbController from "./reverb";
import AdsrController from "./adsrController";
import Arp from "./Arp/arp";
import ScaleController from "./scale";

interface SynthProps {
    playNote?: boolean;
}

const Synth = ({ playNote}: SynthProps) => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(null);
    const filterRef = useRef<Tone.Filter | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const nodes = useMemo(() => {
        return [filterRef, reverbRef]
    }, [filterRef.current, reverbRef.current]);
    const adsrEnvelopes = useRef<Tone.Envelope[]>(Array.from({ length: 4 }, () => new Tone.Envelope()));

    return(
        <div className="m-w-full">
            <SynthController synthRef={synthRef} 
            nodes={nodes}
            adsrEnvelopes={adsrEnvelopes}
            playNoteState={playNote}
            />
            
            
            <div className="grid grid-rows-1 grid-cols-4">
                <div className="col-span-3">
                    <AdsrController synthRef={synthRef} envelopes={adsrEnvelopes} />
                </div>
                
                <FilterController filterRef={filterRef}/>
            </div>
            <ReverbController reverbRef={reverbRef}/> 
            <Arp synthRef={synthRef} />           

        </div>
    )
};

export default Synth;