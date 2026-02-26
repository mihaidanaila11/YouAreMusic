import { RefObject, useEffect, useState } from "react";

interface WebcamProps{
    webcamCanvasRef: RefObject<HTMLCanvasElement | null>,
}

export default function Webcam({webcamCanvasRef}: WebcamProps){
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const initWebcamStream = async () => {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
        });

        setWebcamStream(mediaStream)
        }

        initWebcamStream();
    }, []);

    useEffect(() => {
        if (!webcamStream) {
            return;
        }

        const canvas = webcamCanvasRef.current;
        
        if(!canvas){
            return;
        }
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if(!context){
            return;
        }
        const video = document.createElement('video');

        video.srcObject = webcamStream;
        video.play();

        const render = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        return () => {
            const tracks = webcamStream.getTracks();
            tracks.forEach(track => track.stop());
        };
    }, [webcamStream])

    return (
    <div>
    <h1>Simple Webcam with React </h1>
      <canvas ref={webcamCanvasRef} width={640} height={640} />
    </div>
  );
}