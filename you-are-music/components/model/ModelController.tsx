import { useEffect, useRef, useState } from "react";
import HandTracker, { ModelPrediction, PredictionBox } from "./mediapipeModel";
import Webcam from "../webcam/webcam";
import { Landmark } from "@mediapipe/tasks-vision";

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

const ModelController = () => {

    const videoStream = useRef<HTMLVideoElement | null>(null);
    const overlayCanvas = useRef<HTMLCanvasElement | null>(null);

    const [predictions, setPredictions] = useState<ModelPrediction[] | null>(null);

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
        predictions.forEach((prediction) => {
            if (!overlayCanvas.current) {
                return;
            }

            drawPrediction(prediction, overlayCanvas.current, prediction.hand === "Left" ? "green" : "yellow");
        })

    }, [predictions])


    return (
        <>
            <HandTracker
                videoStream={videoStream}
                setPrediction={setPredictions}
            />
            {/* <ModelRunner webcamCanvasRef={webcamCanvas} setPrediction={setPrediction}/> */}


            <div className='relative w-60'>
                <canvas 
                    ref={overlayCanvas} className='absolute top-0 left-0 w-full h-full'></canvas>
                <Webcam videoRef={videoStream} />
            </div>
        </>
    )
}

export default ModelController;