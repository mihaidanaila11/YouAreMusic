'use client';

import * as ort from 'onnxruntime-web';
import { RefObject, useEffect, useState } from 'react';

interface ModelProps{
    webcamCanvasRef: RefObject<HTMLCanvasElement | null>,
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

    const handleButton = () => {
        const canvas = webcamCanvasRef.current;
        if(!canvas){
            return;
        }
        const context = canvas.getContext("2d");
        const rawImageData = context?.getImageData(0, 0, canvas.width, canvas.height).data;

        console.log(rawImageData ? rawImageData[0] : 0);

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