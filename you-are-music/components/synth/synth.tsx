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
        <div>
            <FilterController filterRef={filterRef}/>
            <ReverbController reverbRef={reverbRef}/>
            <SynthController synthRef={synthRef} nodes={[filterRef, reverbRef]}/>
            <Adsr synthRef={synthRef}/>

        </div>
    )
};

export default Synth;