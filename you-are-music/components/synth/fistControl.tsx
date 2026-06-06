import { leftIndexFingerBus, leftMiddleFingerBus, leftPinkyFingerBus, leftRingFingerBus, rightIndexFingerBus, rightMiddleFingerBus, rightPinkyFingerBus, rightRingFingerBus, Subscriber } from "@/services/ControlManager";
import { useEffect, useRef, useState } from "react";

interface FistControlProps{
    setPlayNote: React.Dispatch<React.SetStateAction<boolean>>;
}

const threshold = 0.5;

const FistControl = ({ setPlayNote }: FistControlProps) => {
    const fingerValues = useRef({
        index:0 as number | null,
        middle:0 as number | null,
        ring:0 as number | null,
        pinky:0 as number | null,
    });

    const isFistRef = useRef(false);
    const [switchedHand, setSwitchedHand] = useState(false);

    useEffect(() => {
        const checkFist = () => {
            const fingers = Object.values(fingerValues.current);

            const currentIsFist = fingers.every((v) => v === null || v < threshold);
            if (currentIsFist !== isFistRef.current) {
                isFistRef.current = currentIsFist;
                setPlayNote(!currentIsFist);
            }
        };

        const buses = switchedHand ? [rightIndexFingerBus, rightMiddleFingerBus, rightRingFingerBus, rightPinkyFingerBus] 
        : [leftIndexFingerBus, leftMiddleFingerBus, leftRingFingerBus, leftPinkyFingerBus];

        const subs = [
            buses[0].subscribe((distance) => {
                fingerValues.current.index = distance;
                checkFist();
            }),
            buses[1].subscribe((distance) => {
                fingerValues.current.middle = distance;
                checkFist();
            }),
            buses[2].subscribe((distance) => {
                fingerValues.current.ring = distance;
                checkFist();
            }),
            buses[3].subscribe((distance) => {
                fingerValues.current.pinky = distance;
                checkFist();
            }),
        ];

        return () => {
            subs.forEach((unsubscribe) => unsubscribe());
        };
    }, [switchedHand, setPlayNote]);

    return (
        <div>
            <label>Switch Trigger Hand</label>
            <input type="checkbox" defaultChecked={false} onChange={(e) => setSwitchedHand(e.target.checked)} />
        </div>
    );
}

export default FistControl;