'use client';

import ModelController from '@/components/model/ModelController';
import GlobalSynthController from '@/components/synth/globalSynthController';
import Sampler from '@/components/synth/Sampler/sampler';
import Synth from '@/components/synth/synth';
import Button from '@/components/UI Control/Control/button';
import Navbar from '@/components/UI/navbar';
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
            <Navbar />
            {
                (!toneContext || toneContext.state === "suspended") && (
                    <div>
                        <p className='text-center'>Click to start the music</p>
                        <Button onClick={handleStartAudio}>Start Audio</Button>
                    </div>
                )
            }

            {toneContext && toneContext.state === "running" && (


                <div className='mx-2 mb-6 elms-sans'>
                    
                    <ModelController />

                    <div className='mt-3 border-2 border-gray-300 flex flex-col gap-6'>
                        <GlobalSynthController ctx={toneContext}/>
                        <div className='border-t-2 border-gray-300'>
                            <Sampler ctx={toneContext}/>
                        </div>
                        
                    </div>

                </div>

            )}
        </>
    )
}