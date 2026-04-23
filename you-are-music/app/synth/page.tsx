'use client';

import ModelController from '@/components/model/ModelController';
import GlobalSynthController from '@/components/synth/globalSynthController';
import Sampler from '@/components/synth/Sampler/sampler';
import Synth from '@/components/synth/synth';
import usePresetStore from '@/services/presetStore';
import { useState } from 'react';
import * as Tone from "tone";


export default function Test() {
    const [toneContext, setToneContext] = useState<Tone.BaseContext | null>(null);

    const handleStartAudio = async () => {
        ("Starting audio");
        Tone.start().then(() => {
            console.log("Audio started");
            setToneContext(Tone.getContext());
        });
    }

    return (
        <>
            {
                (!toneContext || toneContext.state === "suspended") && (
                    <div>
                        <p className='text-center'>Click to start the music</p>
                        <button onClick={handleStartAudio} className='cursor-pointer'>Start Audio</button>
                    </div>
                )
            }

            {toneContext && toneContext.state === "running" && (


                <div className='mx-2 elms-sans'>
                    
                    <ModelController />

                    <div >
                        <GlobalSynthController ctx={toneContext}/>
                        <Sampler ctx={toneContext}/>
                    </div>

                </div>

            )}
        </>
    )
}