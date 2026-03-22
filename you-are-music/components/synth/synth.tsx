'use client';

import { useRef } from "react";
import Adsr from "./adsr";
import SynthController from "./synthController";
import * as Tone from "tone";
import FilterController from "./filter";

const Synth = () => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(null);
    const filterRef = useRef<Tone.Filter | null>(null)

    return(
        <div>
            <FilterController filterRef={filterRef}/>
            <SynthController synthRef={synthRef} nodes={[filterRef]}/>
            <Adsr synthRef={synthRef}/>
        </div>
    )
};

export default Synth;