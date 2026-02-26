'use client';

import { ModelPrediction, PredictionBox } from '@/components/model/model';
import Webcam from '@/components/webcam/webcam';
import dynamic from 'next/dynamic';
import { constrainedMemory } from 'process';
import { useEffect, useRef, useState } from 'react';

const ModelRunner = dynamic(() => import('@/components/model/model'), {
    ssr: false,
});

/**
  * 
  * @param {PredictionBox} predictionBox
  * @param {HTMLCanvasElement} canvas 
  * @returns - None
  */

 export function drawPredictionBox(predictionBox: PredictionBox, canvas: HTMLCanvasElement){
    const canvasContext = canvas.getContext("2d");

    if(!canvasContext){
        return;
    }

    canvasContext.clearRect(0,0,canvas.width, canvas.height);

    canvasContext.strokeStyle = "red";
    canvasContext.beginPath()
    canvasContext.rect(
        predictionBox.x - predictionBox.width / 2,
        predictionBox.y - predictionBox.height / 2,
        predictionBox.width,
        predictionBox.height,
    )

    canvasContext.stroke();
 }


export default function Test() {
    const webcamCanvas = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null);

    const [prediction, setPrediction] = useState<ModelPrediction | null>(null);

    useEffect(() => {
        if(!overlayCanvas.current){
            return;
        }

        if(!prediction){
            const canvasContext = overlayCanvas.current.getContext("2d");
            canvasContext?.clearRect(0,0,overlayCanvas.current.width, 
                overlayCanvas.current.height);
            return;
        }
        console.log(prediction);
        drawPredictionBox(prediction.predictionBox, overlayCanvas.current);
    }, [prediction])
    
    return(
        <>
        <ModelRunner webcamCanvasRef={webcamCanvas} setPrediction={setPrediction}/>

        <div className='relative'>
            <canvas 
            ref = {overlayCanvas}
            width={640} height={640} className='absolute top-0 left-0 '></canvas>
            <Webcam webcamCanvasRef={webcamCanvas} />
        </div>
        </>
    )
}