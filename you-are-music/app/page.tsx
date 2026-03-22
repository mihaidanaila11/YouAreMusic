'use client';

import HandTracker from '@/components/model/mediapipeModel';
import { ModelPrediction, PredictionBox } from '@/components/model/mediapipeModel';
import Synth from '@/components/synth/synth';
import Webcam from '@/components/webcam/webcam';
import { Landmark } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';


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

 function drawPredictionKeypoints(features: Landmark[], canvas: HTMLCanvasElement, color: string){
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;

    canvasContext.fillStyle = color;

    features.forEach(landmark => {
        canvasContext.beginPath();
        canvasContext.arc(landmark.x, landmark.y, 5, 0, 2*Math.PI);
        canvasContext.fill();
    })
 }

function drawPrediction(prediction: ModelPrediction, canvas: HTMLCanvasElement, color: string){
    const canvasContext = canvas.getContext("2d");
    if(!canvasContext) return;
    
    if (prediction.predictionBox)
        drawPredictionBox(prediction.predictionBox, canvas);
    
    drawPredictionKeypoints(prediction.features,canvas, color);
    
}

export default function Test() {
    const webcamCanvas = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null);
    const videoStream = useRef<HTMLVideoElement | null>(null);

    const [predictions, setPredictions] = useState<ModelPrediction[] | null>(null);

    useEffect(() => {
        if(!overlayCanvas.current){
            return;
        }

        const canvasContext = overlayCanvas.current.getContext("2d");

        if(!predictions){
            
            canvasContext?.clearRect(0,0,overlayCanvas.current.width, 
                overlayCanvas.current.height);
            return;
        }
        canvasContext?.clearRect(0,0,overlayCanvas.current.width, overlayCanvas.current.height);
        predictions.forEach( (prediction, index) => {
            if(!overlayCanvas.current){
            return;
            }
            
            drawPrediction(prediction, overlayCanvas.current, index === 0 ? "green" : "yellow");
        })
    
    }, [predictions])
    
    return(
        <>
        <HandTracker 
        videoStream={videoStream}
        setPrediction={setPredictions}
        />
        {/* <ModelRunner webcamCanvasRef={webcamCanvas} setPrediction={setPrediction}/> */}

        <div className='relative'>
            <canvas 
            ref = {overlayCanvas}
            width={640} height={640} className='absolute top-0 left-0 '></canvas>
            <Webcam videoRef={videoStream}/>
        </div>

        <Synth />
        </>
    )
}