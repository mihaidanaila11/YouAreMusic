import { indexFingerBus, middleFingerBus, pinkyFingerBus, ringFingerBus } from '@/services/ControlManager';
import { minMaxNormalize, pointsDistance } from '@/utils/Math';
import { FilesetResolver, HandLandmarker, Landmark } from '@mediapipe/tasks-vision';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

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
    features: Landmark[],
    hand: "Left" | "Right",
}

interface DistanceLimit{
    min: number,
    max: number,
}

export default function HandTracker({ videoStream, setPrediction } : HandTrackerProps){

    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<String | null>(null);

    const calibrationMode = useRef(true);
    const [calibrationModeState, setCalibrationMode] = useState(true);
    const calibrationSamplesCount = useMemo(() => 20, []);
    const calibrationData = useRef<number[]>(Array(calibrationSamplesCount).fill(0));

    const calibrationCount = useRef(0);
    const [calibrationMessage, setCalibrationMessage] = useState("Pinch your index and thumb and hold for calibration.");

    type CalibrationStage = "indexMin" | "indexMax" | "middleMin" | "middleMax" | "ringMin" | "ringMax" | "pinkyMin" | "pinkyMax" | "done";
    const calibrationStage = useRef<CalibrationStage>("indexMin");

    const indexFingerLimits = useRef<DistanceLimit>({min: 100, max: 0});
    const middleFingerLimits = useRef<DistanceLimit>({min: 100, max: 0});
    const ringFingerLimits = useRef<DistanceLimit>({min: 100, max: 0});
    const pinkyFingerLimits = useRef<DistanceLimit>({min: 100, max: 0});


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

            return{features: landmarks, hand: "Left"}
        });

        preductions.forEach(prediction => {
            const middleBasePointX = prediction.features[9].x;
            if(middleBasePointX < videoSize.width / 2){
                prediction.hand = "Right";
            };
        });

        // controlBus.publish(preductions[0].features[0].x, preductions[0].features[0].y);
        const wristPoint = { x: preductions[0].features[0].x, y: preductions[0].features[0].y };
        const middleBasePoint = { x: preductions[0].features[9].x, y: preductions[0].features[9].y };
        const wristToMiddleBaseDistance = pointsDistance(wristPoint, middleBasePoint);

        const thumbPoint = { x: preductions[0].features[4].x, y: preductions[0].features[4].y };

        const indexPoint = { x: preductions[0].features[8].x, y: preductions[0].features[8].y };
        const middlePoint = { x: preductions[0].features[12].x, y: preductions[0].features[12].y };
        const ringPoint = { x: preductions[0].features[16].x, y: preductions[0].features[16].y };
        const pinkyPoint = { x: preductions[0].features[20].x, y: preductions[0].features[20].y };

        const indexFingerDistance = pointsDistance(indexPoint, thumbPoint) / wristToMiddleBaseDistance;
        const middleFingerDistance = pointsDistance(middlePoint, thumbPoint) / wristToMiddleBaseDistance;
        const ringFingerDistance = pointsDistance(ringPoint, thumbPoint) / wristToMiddleBaseDistance;
        const pinkyFingerDistance = pointsDistance(pinkyPoint, thumbPoint) / wristToMiddleBaseDistance;

        // console.log("Index finger distance: ", indexFingerDistance);

        // const newPrediction: ModelPrediction = {
        //     features: landmarks
        // }

        setPrediction(preductions);
        requestAnimationFrame(predict);

        const minCalibrationValidation = (distance: number) => distance < 0.2;
        const maxCalibrationValidation = (distance: number) => distance > 0.8;

        const calibrateKeypoint = (keypointDistance: number, keypointValidation: (distance: number) => boolean, nextStage: CalibrationStage, nextStageMessage: string) => {
            if (!keypointValidation(keypointDistance)) return null;
            calibrationData.current[calibrationCount.current] = keypointDistance;
            calibrationCount.current += 1;

            if (calibrationCount.current >= calibrationSamplesCount) {
                const dataSum = calibrationData.current.reduce((sum, value) => sum + value, 0);
                const average = dataSum / calibrationSamplesCount;

                calibrationCount.current = 0;

                calibrationStage.current = nextStage;
                setCalibrationMessage(nextStageMessage);

                return average;
            }
            return null;
        }

        if(calibrationMode.current){
            switch(calibrationStage.current){
                case "indexMin":
                    // index calibration
                    const calibrationResult = calibrateKeypoint(indexFingerDistance, minCalibrationValidation, "indexMax", "Open palm and hold ");
                    if(calibrationResult === null) return;

                    indexFingerLimits.current.min = calibrationResult;

                    console.log("Index finger min distance: ", indexFingerLimits.current.min);

                    break;
                case "indexMax":
                    const indexMaxCalibrationResult = calibrateKeypoint(indexFingerDistance, maxCalibrationValidation, "middleMin", "Pinch your middle finger and thumb and hold for calibration.");
                    if(indexMaxCalibrationResult === null) return;

                    indexFingerLimits.current.max = indexMaxCalibrationResult;

                    console.log("Index finger max distance: ", indexFingerLimits.current.max);

                    break;

                case "middleMin":
                    const middleMinCalibrationResult = calibrateKeypoint(middleFingerDistance, minCalibrationValidation, "middleMax", "Open palm and hold for calibration.");
                    if(middleMinCalibrationResult === null) return;

                    middleFingerLimits.current.min = middleMinCalibrationResult;

                    console.log("Middle finger min distance: ", middleFingerLimits.current.min);

                    break;

                case "middleMax":
                    const middleMaxCalibrationResult = calibrateKeypoint(middleFingerDistance, maxCalibrationValidation, "ringMin", "Pinch your ring finger and thumb and hold for calibration.");
                    if(middleMaxCalibrationResult === null) return;

                    middleFingerLimits.current.max = middleMaxCalibrationResult;

                    console.log("Middle finger max distance: ", middleFingerLimits.current.max);

                    break;

                case "ringMin":
                    const ringMinCalibrationResult = calibrateKeypoint(ringFingerDistance, minCalibrationValidation, "ringMax", "Open palm and hold for calibration.");
                    if(ringMinCalibrationResult === null) return;

                    ringFingerLimits.current.min = ringMinCalibrationResult;

                    console.log("Ring finger min distance: ", ringFingerLimits.current.min);

                    break;

                case "ringMax":
                    const ringMaxCalibrationResult = calibrateKeypoint(ringFingerDistance, maxCalibrationValidation, "pinkyMin", "Pinch your pinky finger and thumb and hold for calibration.");
                    if(ringMaxCalibrationResult === null) return;

                    ringFingerLimits.current.max = ringMaxCalibrationResult;

                    console.log("Ring finger max distance: ", ringFingerLimits.current.max);

                    break;

                case "pinkyMin":
                    const pinkyMinCalibrationResult = calibrateKeypoint(pinkyFingerDistance, minCalibrationValidation, "pinkyMax", "Open palm and hold for calibration.");
                    if(pinkyMinCalibrationResult === null) return;

                    pinkyFingerLimits.current.min = pinkyMinCalibrationResult;

                    console.log("Pinky finger min distance: ", pinkyFingerLimits.current.min);

                    break;

                case "pinkyMax":
                    const pinkyMaxCalibrationResult = calibrateKeypoint(pinkyFingerDistance, maxCalibrationValidation, "done", "Calibration done.");
                    if(pinkyMaxCalibrationResult === null) return;

                    pinkyFingerLimits.current.max = pinkyMaxCalibrationResult;

                    console.log("Pinky finger max distance: ", pinkyFingerLimits.current.max);
                    break;

                case "done":
                    calibrationMode.current = false;
                    setCalibrationMode(false);
                    setCalibrationMessage("Calibration done.");
                    break;

                default:
                    break;
            }

            return;
        }

        const normalizedDistances = [
            minMaxNormalize(indexFingerDistance, indexFingerLimits.current.min, indexFingerLimits.current.max),
            minMaxNormalize(middleFingerDistance, middleFingerLimits.current.min, middleFingerLimits.current.max),
            minMaxNormalize(ringFingerDistance, ringFingerLimits.current.min, ringFingerLimits.current.max),
            minMaxNormalize(pinkyFingerDistance, pinkyFingerLimits.current.min, pinkyFingerLimits.current.max),
        ].map(value => Math.max(0, Math.min(value, 1)));

        indexFingerBus.publish(normalizedDistances[0]);
        middleFingerBus.publish(normalizedDistances[1]);
        ringFingerBus.publish(normalizedDistances[2]);
        pinkyFingerBus.publish(normalizedDistances[3]);

    }

    return(
        <div>
            <p>
                {loading ? "Model is loading" : (
                    error ? error : ("Model loaded.")
                )}
            </p>

            <p>
                {calibrationModeState && calibrationMessage}
            </p>
            {!error && <button onClick={predict}>Click</button>}
        </div>
    )
} 