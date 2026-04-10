'use client';

import { useRef } from "react";
import Adsr from "./adsr";
import SynthController from "./synthController";
import * as Tone from "tone";
import FilterController from "./filter";
import ReverbController from "./reverb";

const Synth = () => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(null);
    const filterRef = useRef<Tone.Filter | null>(null);
    const reverbRef = useRef<Tone.Reverb | null>(null);

    return(
        <div className="m-w-full">
            <SynthController synthRef={synthRef} nodes={[filterRef, reverbRef]}/>
            
            
            <div className="grid grid-rows-1 grid-cols-2">
                <Adsr synthRef={synthRef}/>
                <FilterController filterRef={filterRef}/>
            </div>
            <ReverbController reverbRef={reverbRef}/>            

        </div>
    )
};

export default Synth;