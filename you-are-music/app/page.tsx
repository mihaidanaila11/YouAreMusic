'use client';

import ModelController from '@/components/model/ModelController';
import Synth from '@/components/synth/synth';
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


                <div className='mx-2'>
                    
                    <ModelController />

                    <div className="grid grid-cols-2 gap-10 m-6">
                        <Synth />
                        <Synth />

                    </div>

                </div>

            )}
        </>
    )
}