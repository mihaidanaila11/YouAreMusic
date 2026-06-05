'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { indexFingerBus, leftHandYBus, middleFingerBus, pinkyFingerBus, Point, rightHandYBus, ringFingerBus } from "@/services/ControlManager";

interface MapControllProps {
    mapKnobValue: (value: number) => void;
}
const MapControll = ({ mapKnobValue }: MapControllProps) => {

    const [availableKeypoints, setAvailableKeypoints] = useState({
        indexFinger: { name: "Index Finger", controlManager: indexFingerBus },
        middleFinger: { name: "Middle Finger", controlManager: middleFingerBus },
        ringFinger: { name: "Ring Finger", controlManager: ringFingerBus },
        pinkyFinger: { name: "Pinky Finger", controlManager: pinkyFingerBus },
        leftHandY: { name: "Left Hand Y", controlManager: leftHandYBus },
        rightHandY: { name: "Right Hand Y", controlManager: rightHandYBus },
    });


    type KeypointKey = keyof typeof availableKeypoints;

    const [selectedKeypoint, setSelectedKeypoint] = useState<KeypointKey | "-">("-");

    useEffect(() => {
        if(selectedKeypoint === "-") return;
        const unsubscribe = 
        availableKeypoints[selectedKeypoint].controlManager.subscribe(mapKnobValue);

        return () => unsubscribe();
    }, [selectedKeypoint, mapKnobValue]);
    return (
        <>
       

            <div className="bg-gray-100 rounded-xl p-2 mt-2 w-fit">
                <select value={selectedKeypoint} onChange={(e) => setSelectedKeypoint(e.target.value as KeypointKey)}>
                    {["-", ...Object.keys(availableKeypoints)].map((keypointKey) => (
                        <option key={keypointKey} value={keypointKey}>
                            {keypointKey === "-" ? "Select a Finger" : availableKeypoints[keypointKey as KeypointKey].name}
                        </option>
                    ))}
                </select>

            </div>

   
        </>

    )
};

export default MapControll;