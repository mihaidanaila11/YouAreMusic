import { indexFingerBus, middleFingerBus, pinkyFingerBus, ringFingerBus, Subscriber } from "@/services/ControlManager";
import { useEffect, useRef, useState } from "react";

interface FistControlProps{
    setPlayNote: React.Dispatch<React.SetStateAction<boolean>>;
}

const threshold = 0.5;

const FistControl = ({ setPlayNote }: FistControlProps) => {
    const fingerValues = useRef({
        index:0,
        middle:0,
        ring:0,
        pinky:0,
    });

    const isFistRef = useRef(false);

    useEffect(() => {
        const checkFist = () => {
            const { index, middle, ring, pinky } = fingerValues.current;
            const currentIsFist = index < threshold && middle < threshold && ring < threshold && pinky < threshold;
            console.log("Finger values: ", fingerValues.current, "Is fist: ", currentIsFist);
            if (currentIsFist !== isFistRef.current) {
                isFistRef.current = currentIsFist;
                setPlayNote(!currentIsFist);
            }
        };

        const subs = [
            indexFingerBus.subscribe((distance) => {
                fingerValues.current.index = distance;
                checkFist();
            }),
            middleFingerBus.subscribe((distance) => {
                fingerValues.current.middle = distance;
                checkFist();
            }),
            ringFingerBus.subscribe((distance) => {
                fingerValues.current.ring = distance;
                checkFist();
            }),
            pinkyFingerBus.subscribe((distance) => {
                fingerValues.current.pinky = distance;
                checkFist();
            }),
        ];

        return () => {
            subs.forEach((unsubscribe) => unsubscribe());
        };
    }, []);

    return (<></>);
}

export default FistControl;