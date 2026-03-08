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

function drawPredictionBox(predictionBox: PredictionBox, canvas: HTMLCanvasElement){
    const canvasContext = canvas.getContext("2d");

    if(!canvasContext){
        return;
    }

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

 function drawPredictionKeypoints(features: Float32Array, featuresNumber: number, canvas: HTMLCanvasElement){
    const featureDataNumber = features.length / featuresNumber;
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;

    canvasContext.fillStyle = "green";

    console.log(features);

    for(let featureIndex = 0; featureIndex < featuresNumber; featureIndex++){
        const xPos = features[featureIndex * featureDataNumber];
        const yPos = features[featureIndex * featureDataNumber + 1];
        console.log(xPos, yPos);

        canvasContext.beginPath();
        canvasContext.arc(xPos, yPos, 5, 0, 2*Math.PI);
        canvasContext.fill();
    }
 }

function drawPrediction(prediction: ModelPrediction, canvas: HTMLCanvasElement){
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;
    
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    drawPredictionBox(prediction.predictionBox, canvas);
    drawPredictionKeypoints(prediction.featues, prediction.featuresNumber,canvas);
    
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
        drawPrediction(prediction, overlayCanvas.current);
    
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