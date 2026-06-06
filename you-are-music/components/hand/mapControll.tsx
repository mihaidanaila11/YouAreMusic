'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { leftHandXBus, leftHandYBus, leftIndexFingerBus, leftMiddleFingerBus, leftPinkyFingerBus, leftRingFingerBus, Point, rightHandXBus, rightHandYBus, rightIndexFingerBus, rightMiddleFingerBus, rightPinkyFingerBus, rightRingFingerBus } from "@/services/ControlManager";

interface MapControllProps {
    mapKnobValue: (value: number | null) => void;
}
const MapControll = ({ mapKnobValue }: MapControllProps) => {

    const [availableKeypoints, setAvailableKeypoints] = useState({
        leftIndexFinger: { name: "Left Index Finger", controlManager: leftIndexFingerBus },
        leftMiddleFinger: { name: "Left Middle Finger", controlManager: leftMiddleFingerBus },
        leftPinkyFinger: { name: "Left Pinky Finger", controlManager: leftPinkyFingerBus },
        leftRingFinger: { name: "Left Ring Finger", controlManager: leftRingFingerBus },
        leftHandX: { name: "Left Hand X", controlManager: leftHandXBus },
        leftHandY: { name: "Left Hand Y", controlManager: leftHandYBus },
        rightIndexFinger: { name: "Right Index Finger", controlManager: rightIndexFingerBus },
        rightMiddleFinger: { name: "Right Middle Finger", controlManager: rightMiddleFingerBus },
        rightPinkyFinger: { name: "Right Pinky Finger", controlManager: rightPinkyFingerBus },
        rightRingFinger: { name: "Right Ring Finger", controlManager: rightRingFingerBus },
        rightHandX: { name: "Right Hand X", controlManager: rightHandXBus },
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