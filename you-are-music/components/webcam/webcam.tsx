import { RefObject, useEffect, useRef, useState } from "react";

interface WebcamProps{
    videoRef: RefObject<HTMLVideoElement | null>,
}

export default function Webcam({videoRef}: WebcamProps){

    useEffect(() => {
        const initWebcamStream = async () => {
            if(!videoRef.current) return;

            const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
        });

        videoRef.current.srcObject = mediaStream;
        }

        initWebcamStream();
    }, []);


    return (
    <>
      {/* <canvas ref={webcamCanvasRef} width={224} height={224} /> */}
      <video 
        ref={videoRef}
        width={640}
        height={480}
        autoPlay
        playsInline
      />
    </>
  );
}