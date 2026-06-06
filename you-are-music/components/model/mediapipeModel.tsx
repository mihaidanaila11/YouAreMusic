import { leftHandXBus, leftHandYBus, leftIndexFingerBus, leftMiddleFingerBus, leftPinkyFingerBus, leftRingFingerBus, rightHandXBus, rightHandYBus, rightIndexFingerBus, rightMiddleFingerBus, rightPinkyFingerBus, rightRingFingerBus } from '@/services/ControlManager';
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
    hand: string,
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

    const waitTime = 1/30 * 1000; // 30 fps
    const lastPredictionTime = useRef(0);

    // Setup mediapipe model
    useEffect(() => {
        const setupModel = async () => {
            const createLandmarker = async (delegate: "GPU" | "CPU") => {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                );

                return await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                        delegate,
                    },
                    runningMode: "VIDEO",
                    numHands: 2,
                });
            };

            try{
               setLoading(true);
                let createdLandmarker;

                try {
                    createdLandmarker = await createLandmarker("GPU");
                    setError(null);
                } catch (gpuError) {
                    console.warn("GPU delegate unavailable, falling back to CPU.", gpuError);
                    createdLandmarker = await createLandmarker("CPU");
                    setError("GPU unavailable, using CPU fallback.");
                }


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

        if(performance.now() - lastPredictionTime.current < waitTime){
            requestAnimationFrame(predict);
            return;
        }
            

        const timeStamp = performance.now();
        const prediction = handLandmarker.detectForVideo(videoStream.current, timeStamp);

        const leftBuses = [leftIndexFingerBus, leftMiddleFingerBus, leftRingFingerBus, leftPinkyFingerBus] 
        const rightBuses = [rightIndexFingerBus, rightMiddleFingerBus, rightRingFingerBus, rightPinkyFingerBus]


        if(!prediction || !prediction.landmarks || prediction.landmarks.length <= 0){
            setPrediction(null);
            leftBuses.forEach(bus => bus.publish(null));
            rightBuses.forEach(bus => bus.publish(null));
            requestAnimationFrame(predict);
            return;
        }

        const videoSize = {
            width: videoStream.current.width,
            height: videoStream.current.height,
        }


        const predictions: ModelPrediction[] = prediction.landmarks.map( (landmarkList, index) => {
            const landmarks: Landmark[] = landmarkList.map(landmark => {
                return{
                    x: landmark.x,
                    y: landmark.y,
                    z: landmark.z,
                    visibility: landmark.visibility,
                }
            });

            return{features: landmarks, hand: prediction.handedness[index][0].categoryName}
        });


        // controlBus.publish(preductions[0].features[0].x, preductions[0].features[0].y);
        const [indexFingerID, middleFingerID, ringFingerID, pinkyFingerID,
             thumbID, wristID, middleBaseID] = [8, 12, 16, 20, 4, 0, 9];

        const distances = predictions.map(pred => {
            const wristPoint = { x: pred.features[wristID].x, y: pred.features[wristID].y };
            const middleBasePoint = { x: pred.features[middleBaseID].x, y: pred.features[middleBaseID].y };
            const wristToMiddleBaseDistance = pointsDistance(wristPoint, middleBasePoint);

            const thumbPoint = { x: pred.features[thumbID].x, y: pred.features[thumbID].y };

            const indexPoint = { x: pred.features[indexFingerID].x, y: pred.features[indexFingerID].y };
            const middlePoint = { x: pred.features[middleFingerID].x, y: pred.features[middleFingerID].y };
            const ringPoint = { x: pred.features[ringFingerID].x, y: pred.features[ringFingerID].y };
            const pinkyPoint = { x: pred.features[pinkyFingerID].x, y: pred.features[pinkyFingerID].y };

            const indexFingerDistance = pointsDistance(indexPoint, thumbPoint) / wristToMiddleBaseDistance;
            const middleFingerDistance = pointsDistance(middlePoint, thumbPoint) / wristToMiddleBaseDistance;
            const ringFingerDistance = pointsDistance(ringPoint, thumbPoint) / wristToMiddleBaseDistance;
            const pinkyFingerDistance = pointsDistance(pinkyPoint, thumbPoint) / wristToMiddleBaseDistance;

            return {
                indexFingerDistance,
                middleFingerDistance,
                ringFingerDistance,
                pinkyFingerDistance,
                hand: pred.hand,
            }
        })

        

        const wristPoint = { x: predictions[0].features[0].x, y: predictions[0].features[0].y };
        const middleBasePoint = { x: predictions[0].features[9].x, y: predictions[0].features[9].y };
        const wristToMiddleBaseDistance = pointsDistance(wristPoint, middleBasePoint);

        const thumbPoint = { x: predictions[0].features[4].x, y: predictions[0].features[4].y };

        const indexPoint = { x: predictions[0].features[8].x, y: predictions[0].features[8].y };
        const middlePoint = { x: predictions[0].features[12].x, y: predictions[0].features[12].y };
        const ringPoint = { x: predictions[0].features[16].x, y: predictions[0].features[16].y };
        const pinkyPoint = { x: predictions[0].features[20].x, y: predictions[0].features[20].y };

        const indexFingerDistance = pointsDistance(indexPoint, thumbPoint) / wristToMiddleBaseDistance;
        const middleFingerDistance = pointsDistance(middlePoint, thumbPoint) / wristToMiddleBaseDistance;
        const ringFingerDistance = pointsDistance(ringPoint, thumbPoint) / wristToMiddleBaseDistance;
        const pinkyFingerDistance = pointsDistance(pinkyPoint, thumbPoint) / wristToMiddleBaseDistance;

        setPrediction(predictions);
        requestAnimationFrame(predict);

        lastPredictionTime.current = performance.now();

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

                    break;
                case "indexMax":
                    const indexMaxCalibrationResult = calibrateKeypoint(indexFingerDistance, maxCalibrationValidation, "middleMin", "Pinch your middle finger and thumb and hold for calibration.");
                    if(indexMaxCalibrationResult === null) return;

                    indexFingerLimits.current.max = indexMaxCalibrationResult;

                    break;

                case "middleMin":
                    const middleMinCalibrationResult = calibrateKeypoint(middleFingerDistance, minCalibrationValidation, "middleMax", "Open palm and hold for calibration.");
                    if(middleMinCalibrationResult === null) return;

                    middleFingerLimits.current.min = middleMinCalibrationResult;

                    break;

                case "middleMax":
                    const middleMaxCalibrationResult = calibrateKeypoint(middleFingerDistance, maxCalibrationValidation, "ringMin", "Pinch your ring finger and thumb and hold for calibration.");
                    if(middleMaxCalibrationResult === null) return;

                    middleFingerLimits.current.max = middleMaxCalibrationResult;

                    break;

                case "ringMin":
                    const ringMinCalibrationResult = calibrateKeypoint(ringFingerDistance, minCalibrationValidation, "ringMax", "Open palm and hold for calibration.");
                    if(ringMinCalibrationResult === null) return;

                    ringFingerLimits.current.min = ringMinCalibrationResult;

                    break;

                case "ringMax":
                    const ringMaxCalibrationResult = calibrateKeypoint(ringFingerDistance, maxCalibrationValidation, "pinkyMin", "Pinch your pinky finger and thumb and hold for calibration.");
                    if(ringMaxCalibrationResult === null) return;

                    ringFingerLimits.current.max = ringMaxCalibrationResult;

                    break;

                case "pinkyMin":
                    const pinkyMinCalibrationResult = calibrateKeypoint(pinkyFingerDistance, minCalibrationValidation, "pinkyMax", "Open palm and hold for calibration.");
                    if(pinkyMinCalibrationResult === null) return;

                    pinkyFingerLimits.current.min = pinkyMinCalibrationResult;

                    break;

                case "pinkyMax":
                    const pinkyMaxCalibrationResult = calibrateKeypoint(pinkyFingerDistance, maxCalibrationValidation, "done", "Calibration done.");
                    if(pinkyMaxCalibrationResult === null) return;

                    pinkyFingerLimits.current.max = pinkyMaxCalibrationResult;

                    break;

                case "done":
                    calibrationMode.current = false;
                    setCalibrationMode(false);
                    break;

                default:
                    break;
            }

            return;
        }

        const normalizedDistances = distances.map(distance => {
            return [
                minMaxNormalize(distance.indexFingerDistance, indexFingerLimits.current.min, indexFingerLimits.current.max),
                minMaxNormalize(distance.middleFingerDistance, middleFingerLimits.current.min, middleFingerLimits.current.max),
                minMaxNormalize(distance.ringFingerDistance, ringFingerLimits.current.min, ringFingerLimits.current.max),
                minMaxNormalize(distance.pinkyFingerDistance, pinkyFingerLimits.current.min, pinkyFingerLimits.current.max)
            ].map(value => Math.max(0, Math.min(value, 1)));
        });

        
        normalizedDistances.forEach( (fingerDistances, index) => {
            const buses = distances[index].hand === "Left" ? leftBuses : rightBuses;
            buses.forEach((bus, i) => {
                bus.publish(fingerDistances[i]);
            });
        });

        predictions.forEach(pred => {
            const yBus = pred.hand === "Left" ? leftHandYBus : rightHandYBus;
            const xBus = pred.hand === "Left" ? leftHandXBus : rightHandXBus;

            yBus.publish(pred.features[0].y);
            xBus.publish(pred.features[0].x);
        });
    }

    return(
        <div className=''>
            <div>
                {loading ? "Model is loading" : (
                    error ? error : ("Model loaded.")
                )}
            </div>

            <div className='text-center text-lg font-bold mt-2'>
                {calibrationModeState && calibrationMessage}
            </div>
        </div>
    )
} 