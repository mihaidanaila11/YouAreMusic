'use client';

import * as ort from 'onnxruntime-web';
import { RefObject, useEffect, useState } from 'react';

interface ModelProps{
    webcamCanvasRef: RefObject<HTMLCanvasElement | null>,
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

export default function Model({webcamCanvasRef} : ModelProps) {
    
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

        /*
        Indicii 0-3: Coordonatele cutiei (centru X, centru Y, lățime, înălțime).
        Indexul 4: Scorul de încredere 
        Indicii 5-55: Cele 17 keypoints. Fiecare keypoint are 3 valori: (x, y, vizibilitate/încredere).
        */
        
        let bestPredictBox = -1;
        let bestPredictScore = -1;

        for(let boxNumeber = 0; boxNumeber < dims[2]; boxNumeber++){
            const predictScore = getDataAtIndex(predictionData, dims, 4, boxNumeber);

            if(predictScore > bestPredictScore){
                bestPredictScore = predictScore;
                bestPredictBox = boxNumeber;
            }
        }

        console.log(bestPredictBox, bestPredictScore);

    }
    return(
        <div>
            <p>
                {loading ? "Model is loading" : (
                    error || !ortSession ? error : ("Model loaded.")
                )}
            </p>
            {!error && ortSession && <button onClick={handleButton}>safsaf</button>}
        </div>
    )
}