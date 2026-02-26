'use client';

import * as ort from 'onnxruntime-web';
import { RefObject, useEffect, useState } from 'react';

interface ModelProps{
    webcamCanvasRef: RefObject<HTMLCanvasElement | null>;
    setPrediction: (prediction: ModelPrediction | null) => void;
}

export interface PredictionBox{
    x: number,
    y: number,
    width: number,
    height: number,
}

export interface ModelPrediction{
    predictionBox: PredictionBox,
    confidence: number,
    featuresNumber: number,
    featues: Float32Array,
}

function imageDataToTensor(imageData: ImageDataArray){
    const [redArray, greenArray, blueArray] = new Array(new Array<number>(), new Array<number>(), new Array<number>());

    for(let channelIndex = 0; channelIndex < imageData.length; channelIndex += 4){
        redArray.push(imageData[channelIndex]);
        greenArray.push(imageData[channelIndex + 1]);
        blueArray.push(imageData[channelIndex + 2]);
    }

    const transposedData = redArray.concat(greenArray).concat(blueArray);
    const normalisedData = new Float32Array(transposedData.map(value => value / 255.0));

    const inputTensor = new ort.Tensor('float32', normalisedData, [1, 3, 640, 640]);

    return inputTensor;
}

async function predict(session: ort.InferenceSession, inputTensor: ort.Tensor){
    const inputFeed: Record<string, ort.Tensor> = {};
    inputFeed[session.inputNames[0]] = inputTensor;

    const results = await session.run(inputFeed);

    return results
 }

 /**
  * Extracts data from a 3D array mapped in a linear array using row-major order given an index.
  * Assumes a tensor shape of [Batch=1, Attributes, Boxes]
  * 
  * @param {Float32Array} dataArray - Flattened array containing data
  * @param {number[]} dims - Dimensions of the data array 
  * @param {number} attributeIndex - Index to be accessed
  * @param {number} boxIndex - Box to be accessed
  * 
  * @returns {number}  Data found in the given batch number at the given index
  */

 function getDataAtIndex(dataArray: Float32Array, dims: readonly number[], attributeIndex: number,
    boxIndex: number){
    return dataArray[attributeIndex * dims[2] + boxIndex]
 }

/**
 * Extracts best prediction from a 3D array mapped in a linear array using row-major.
 * Assumes a tensor shape of [Batch=1, Attributes, Boxes]
 * 
 * @param {Float32Array} dataArray -  Flattened array containing data
 * @param {number[]} dims - Dimensions of the data array
 * @param {number} minConfidence - Lower limit of prediction confidence
 * 
 * @returns {ModelPrediction | null} - Best prediction or null if none is found
 */

 function pickBestPrediction(dataArray: Float32Array, dims: readonly number[], minConfidence: number = 0): ModelPrediction | null{
    const numberOfBoxes = dims[2];
    const predictionIndex = 4;

    let bestPredictBox = -1;
    let bestPredictScore = -1;

    for(let boxNumber = 0; boxNumber < numberOfBoxes; boxNumber++){
        const predictScore = getDataAtIndex(dataArray, dims, predictionIndex, boxNumber);

        if(predictScore < minConfidence){
            continue;
        }

        if(predictScore > bestPredictScore){
            bestPredictBox = boxNumber;
            bestPredictScore = predictScore;
        }
    }

    if(bestPredictBox === -1){
        return null;
    }

    const predictionBox: PredictionBox = {
        x: getDataAtIndex(dataArray, dims, 0, bestPredictBox),
        y: getDataAtIndex(dataArray, dims, 1, bestPredictBox),
        width: getDataAtIndex(dataArray, dims, 2, bestPredictBox),
        height: getDataAtIndex(dataArray, dims, 3, bestPredictBox),
    }

    const confidenceIndex = 4;
    const confidence = getDataAtIndex(dataArray, dims, confidenceIndex, bestPredictBox);

    const featuresNumber = 21;
    const featues = new Float32Array(featuresNumber * 3);
    const featureIndexOffset = 5;

    for(let featureIndex = 0; featureIndex < featuresNumber; featureIndex++){
        const feature = getDataAtIndex(dataArray, dims, featureIndex + featureIndexOffset, bestPredictBox);
        featues[featureIndex] = feature;
    }

    return {
        predictionBox,
        confidence,
        featuresNumber: featuresNumber,
        featues: featues,
    };
 }


 const Model: React.FC<ModelProps> = ({ webcamCanvasRef, setPrediction }) => {
    
    const [ortSession, setOrtSession] = useState<ort.InferenceSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<String | null>(null);

    useEffect(() => {
        async function loadModel(){
            try{
                const session = await ort.InferenceSession.create('/model.onnx');
                setOrtSession(session);
                setLoading(false);
            }
            catch(error){
                setError("There was an error loading the model.")
                setLoading(false);
            }
        }

        loadModel();
    }, [])

    const handleButton = async () => {
        const canvas = webcamCanvasRef.current;
        if(!canvas || !ortSession){
            return;
        }
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const rawImageData = context?.getImageData(0, 0, canvas.width, canvas.height).data;

        if(!rawImageData){
            return;
        }

        const imageTensor = imageDataToTensor(rawImageData);

        const prediction = await predict(ortSession, imageTensor);
        const outputName = ortSession.outputNames[0];
        const predictionData = prediction[outputName].data as Float32Array;
        
        const dims = prediction[outputName].dims;

        const bestPrediction = pickBestPrediction(predictionData, dims, 0.5);

        setPrediction(bestPrediction ? bestPrediction : null);

    }
    return(
        <>
            <div>
                <p>
                    {loading ? "Model is loading" : (
                        error || !ortSession ? error : ("Model loaded.")
                    )}
                </p>
                {!error && ortSession && <button onClick={handleButton}>safsaf</button>}
            </div>
        </>
    )
}

export default Model;