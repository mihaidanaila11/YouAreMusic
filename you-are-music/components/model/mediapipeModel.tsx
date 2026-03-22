import { FilesetResolver, HandLandmarker, Landmark } from '@mediapipe/tasks-vision';
import { RefObject, useEffect, useState } from 'react';

interface HandTrackerProps{
    videoStream: RefObject<HTMLVideoElement | null>,
    setPrediction: (prediction: ModelPrediction[] | null) => void,
}

export interface PredictionBox{
    x: number,
    y: number,
    width: number,
    height: number,
}

export interface ModelPrediction{
    predictionBox?: PredictionBox,
    features: Landmark[]
}

export default function HandTracker({ videoStream, setPrediction } : HandTrackerProps){

    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<String | null>(null);

    // Setup mediapipe model
    useEffect(() => {
        const setupModel = async () => {
            try{
               setLoading(true);
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                );
                
                const createdLandmarker = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate: "GPU" 
                    },
                    runningMode: "VIDEO",
                    numHands: 2
                });


                setHandLandmarker(createdLandmarker);
                setLoading(false); 

            }
            catch(error){
                setError("There was an error loading the model.")
                setLoading(false);
            }
        }

        setupModel();
        
    }, []);

    useEffect( () => {
        if(!handLandmarker)
            return;
        requestAnimationFrame(predict);
    }, [handLandmarker]);

    const predict = () => {
        if(!videoStream.current || !handLandmarker){
            console.log(videoStream.current, handLandmarker);
            requestAnimationFrame(predict);
            return;
        }

        if(videoStream.current.videoWidth === 0 || videoStream.current.videoHeight <= 0){
            requestAnimationFrame(predict);
            return;
        }
            

        const timeStamp = performance.now();
        const prediction = handLandmarker.detectForVideo(videoStream.current, timeStamp);

        if(!prediction || !prediction.landmarks || prediction.landmarks.length <= 0){
            requestAnimationFrame(predict);
            return;
        }

        const videoSize = {
            width: videoStream.current.width,
            height: videoStream.current.height,
        }

        const preductions: ModelPrediction[] = prediction.landmarks.map( landmarkList => {
            const landmarks: Landmark[] = landmarkList.map(landmark => {
                return{
                    x: landmark.x * videoSize.width,
                    y: landmark.y * videoSize.height,
                    z: landmark.z,
                    visibility: landmark.visibility,
                }
            });

            return{features: landmarks}
        });
            

        // const newPrediction: ModelPrediction = {
        //     features: landmarks
        // }

        setPrediction(preductions);
        requestAnimationFrame(predict);
    }

    return(
        <div>
            <p>
                {loading ? "Model is loading" : (
                    error ? error : ("Model loaded.")
                )}
            </p>
            {!error && <button onClick={predict}>Click</button>}
        </div>
    )
} 