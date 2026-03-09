'use client';

import HandTracker from '@/components/model/mediapipeModel';
import { ModelPrediction, PredictionBox } from '@/components/model/model';
import Webcam from '@/components/webcam/webcam';
import { Landmark } from '@mediapipe/tasks-vision';
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

 function drawPredictionKeypoints(features: Landmark[], canvas: HTMLCanvasElement){
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;

    canvasContext.fillStyle = "green";

    features.forEach(landmark => {
        canvasContext.beginPath();
        canvasContext.arc(landmark.x, landmark.y, 5, 0, 2*Math.PI);
        canvasContext.fill();
    })
 }

function drawPrediction(prediction: ModelPrediction, canvas: HTMLCanvasElement){
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;
    
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    if (prediction.predictionBox)
        drawPredictionBox(prediction.predictionBox, canvas);
    
    drawPredictionKeypoints(prediction.features,canvas);
    
}

export default function Test() {
    const webcamCanvas = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null);
    const videoStream = useRef<HTMLVideoElement | null>(null);

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
        <HandTracker 
        videoStream={videoStream}
        setPrediction={setPrediction}
        />
        {/* <ModelRunner webcamCanvasRef={webcamCanvas} setPrediction={setPrediction}/> */}

        <div className='relative'>
            <canvas 
            ref = {overlayCanvas}
            width={640} height={640} className='absolute top-0 left-0 '></canvas>
            <Webcam videoRef={videoStream}/>
        </div>
        </>
    )
}