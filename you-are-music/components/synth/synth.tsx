'use client';

import { useRef } from "react";
import Adsr from "./adsr";
import SynthController from "./synthController";
import * as Tone from "tone";

const Synth = () => {
    const synthRef = useRef<Tone.Synth<Tone.SynthOptions> | null>(null);

    return(
        <div>
            <SynthController synthRef={synthRef}/>
            <Adsr synthRef={synthRef}/>
        </div>
    )
};

export default Synth;