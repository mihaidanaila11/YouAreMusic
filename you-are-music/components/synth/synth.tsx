'use client';

import { useRef } from "react";
import Adsr from "./adsr";
import SynthController from "./synthController";
import * as Tone from "tone";
import FilterController from "./filter";
import ReverbController from "./reverb";
import AdsrController from "./adsrController";
import Arp from "./Arp/arp";

const Synth = () => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(null);
    const filterRef = useRef<Tone.Filter | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const adsrEnvelopes = useRef<Tone.Envelope[]>(Array.from({ length: 4 }, () => new Tone.Envelope()));

    return(
        <div className="m-w-full">
            <SynthController synthRef={synthRef} 
            nodes={[filterRef, reverbRef]}
            adsrEnvelopes={adsrEnvelopes}
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