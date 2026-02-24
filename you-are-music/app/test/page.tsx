'use client';

import Webcam from '@/components/webcam/webcam';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

const ModelRunner = dynamic(() => import('@/components/model/model'), {
    ssr: false,
});

export default function Test() {
    const webcamCanvas = useRef<HTMLCanvasElement | null>(null);
    
    return(
        <>
        <ModelRunner webcamCanvasRef={webcamCanvas}/>
        <Webcam webcamCanvasRef={webcamCanvas}/>
        </>
    )
}