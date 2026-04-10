'use client';

import HandTracker from '@/components/model/mediapipeModel';
import { ModelPrediction, PredictionBox } from '@/components/model/mediapipeModel';
import Synth from '@/components/synth/synth';
import Webcam from '@/components/webcam/webcam';
import { Landmark } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import * as Tone from "tone";


/**
  * 
  * @param {PredictionBox} predictionBox
  * @param {HTMLCanvasElement} canvas 
  * @returns - None
  */

function drawPredictionBox(predictionBox: PredictionBox, canvas: HTMLCanvasElement) {
    const canvasContext = canvas.getContext("2d");

    if (!canvasContext) {
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

function drawPredictionKeypoints(features: Landmark[], canvas: HTMLCanvasElement, color: string) {
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    canvasContext.fillStyle = color;
    let [meanX, meanY] = [0, 0];

    features.forEach((landmark, index) => {
        meanX += landmark.x;
        meanY += landmark.y;
        if (![4, 8, 12, 16, 20, 0, 9].includes(index)) return;
        canvasContext.beginPath();
        canvasContext.arc(landmark.x * canvas.width, landmark.y * canvas.height, canvas.width * 0.01, 0, 2 * Math.PI);
        canvasContext.fill();
    });

    meanX /= features.length;
    meanY /= features.length;

    canvasContext.fillStyle = "red";

    canvasContext.beginPath();
    canvasContext.arc(meanX * canvas.width, meanY * canvas.height, canvas.width * 0.02, 0, 2 * Math.PI);
    canvasContext.fill();
}

function drawPrediction(prediction: ModelPrediction, canvas: HTMLCanvasElement, color: string) {
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) return;

    if (prediction.predictionBox)
        drawPredictionBox(prediction.predictionBox, canvas);

    drawPredictionKeypoints(prediction.features, canvas, color);

}

export default function Test() {
    const webcamCanvas = useRef<HTMLCanvasElement | null>(null);
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null);
    const videoStream = useRef<HTMLVideoElement | null>(null);

    const [predictions, setPredictions] = useState<ModelPrediction[] | null>(null);

    const [toneContext, setToneContext] = useState<Tone.BaseContext | null>(null);


    useEffect(() => {
        if (!overlayCanvas.current) {
            return;
        }

        const canvasContext = overlayCanvas.current.getContext("2d");

        if (!predictions) {

            canvasContext?.clearRect(0, 0, overlayCanvas.current.width,
                overlayCanvas.current.height);
            return;
        }
        canvasContext?.clearRect(0, 0, overlayCanvas.current.width, overlayCanvas.current.height);
        predictions.forEach((prediction, index) => {
            if (!overlayCanvas.current) {
                return;
            }

            drawPrediction(prediction, overlayCanvas.current, index === 0 ? "green" : "yellow");
        })

    }, [predictions])

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
                    <HandTracker
                        videoStream={videoStream}
                        setPrediction={setPredictions}
                    />
                    {/* <ModelRunner webcamCanvasRef={webcamCanvas} setPrediction={setPrediction}/> */}


                    <div className='relative w-30'>
                        <canvas width={640} height={480}
                            ref={overlayCanvas} className='absolute top-0 left-0 w-full'></canvas>
                        <Webcam videoRef={videoStream} />
                    </div>


                    <div className="grid grid-cols-2 gap-10 m-6">
                        <Synth />
                        <Synth />

                    </div>

                </div>

            )}
        </>
    )
}