/*
Sampler
    - 2 hands
        - 4 samples for each finger
            - distance to trigger
            - sample to play
            - volume
            - pitch 

    - table shape
    - visual feedback of the samples being played?

*/

import { useState } from "react";
import SampleController from "./sampleController";
import * as Tone from "tone";

interface SamplerProps {
    ctx: Tone.BaseContext,
}

const Sampler = ({ ctx }: SamplerProps) => {
    const [samples, setSamples] = useState<(React.ReactNode)[]>([]);

    const handleDeleteSample = (index: number) => {
        setSamples(prev => prev.filter((_, i) => i !== index));
    }

    const handleAddSample = () => {
        setSamples(prev => [...prev, <div className="flex items-center" key={prev.length}>
            <SampleController ctx={ctx} />
            <button  onClick={() => handleDeleteSample(prev.length)}>Delete Sample</button>
        </div>]);
    }
    return(
        <div className="">
            <h1>Sampler</h1>
            <button onClick={handleAddSample}>Add Sample</button>
            {samples}
        </div>
    )
};

export default Sampler;