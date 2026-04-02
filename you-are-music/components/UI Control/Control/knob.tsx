import { Dispatch, MouseEvent, SetStateAction, SVGProps, useEffect, useRef, useState } from "react";
import { mapValues } from "@/utils/Math";
import KnobMenu from "./knobMenu";
import MapControll from "@/components/hand/mapControll";
import { Point } from "@/services/ControlManager";

type KnobMode = "linear" | "exponential";

interface knobProps {
    setValue: Dispatch<SetStateAction<number>>
    minValue?: number,
    maxValue?: number,
    label?: string,
    defaultValue?: number,
    mode?: KnobMode,
}

const Knob = ({ setValue, minValue = 0, maxValue = 100, label, defaultValue = maxValue / 2, mode = "linear" }: knobProps) => {

    useEffect(() => {
        if (defaultValue) {
            setValue(defaultValue);
            setCurrent(defaultValue);
        }
    }, [])

    // ------------

    const [isDragged, setDragged] = useState(false);
    const startYRef = useRef(0);
    const [currentValue, setCurrent] = useState(defaultValue);
    const [currentRotation, setRotation] = useState(0);
    const valueCircleRef = useRef<SVGCircleElement | null>(null);
    const backValueCircleRef = useRef<SVGCircleElement | null>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [showBindMenu, setShowBindMenu] = useState(false);

    const handleMouseDown = (event: MouseEvent) => {
        if(event.button !== 0) return; 

        setDragged(true);
        startYRef.current = event.clientY;
    }

    useEffect(() => {
        if (!isDragged) return;

        const handleMouseMove = (event: globalThis.MouseEvent) => {
            const sensitivity = maxValue / 100;

            const currentYPos = event.clientY;
            const delta = startYRef.current - currentYPos;

            let newValue = currentValue + delta * sensitivity;



            // Clamped values between min and max
            newValue = Math.max(minValue, Math.min(maxValue, newValue));

            let valuePercent = (newValue - minValue) / (maxValue - minValue);

            if (mode === "exponential") {
                const expValue = minValue * Math.pow(maxValue / minValue, valuePercent);
                newValue = expValue;

                valuePercent = (newValue - minValue) / (maxValue - minValue);
            }

            const newRotation = Math.round(mapValues(valuePercent, 0, 1, -135, 135));

            setRotation(newRotation);
            setCurrent(newValue);
        }

        const handleMouseUp = () => {
            setDragged(false);
        }


        if (isDragged) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }


        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragged]);

    // Knob Handler
    useEffect(() => {
        const valuePercent = currentValue / maxValue;
        const newRotation = Math.round(mapValues(valuePercent, 0, 1, -135, 135));

        setRotation(newRotation);
    }, [currentValue])

    // Value Circle Handler
    const usableLen = 3 * Math.PI / 2;
    useEffect(() => {
        if (!valueCircleRef.current) return;

        const circleRadius = valueCircleRef.current.r.animVal.value;
        const circumference = 2 * Math.PI * circleRadius;

        const circleUsableLen = usableLen * circleRadius;

        const valuePercent = currentValue / maxValue

        const valueLineLen = Math.max(0, Math.min(circleUsableLen * valuePercent, circleUsableLen));

        valueCircleRef.current.setAttribute("stroke-dasharray", `${valueLineLen}, ${circumference - valueLineLen}`);
    }, [currentValue]);

    // Setup back value line
    useEffect(() => {
        if (!backValueCircleRef.current || !valueCircleRef.current) return;

        const circleRadius = valueCircleRef.current.r.animVal.value;
        const circumference = 2 * Math.PI * circleRadius;
        const circleUsableLen = usableLen * circleRadius;

        backValueCircleRef.current.setAttribute("stroke-dasharray", `${circleUsableLen}, ${circumference - circleUsableLen}`);
    }, [backValueCircleRef.current])

    // Handle outside effect
    useEffect(() => {
        setValue(currentValue);

    }, [currentValue]);

    const rightClickHandler = (e: MouseEvent) => {
        e.preventDefault();
        console.log("right click");
        setShowMenu(prev => !prev);
        return false;
    }

    const knobMenuOptions = [
        { label: "Reset", action: () => setCurrent(defaultValue) },
        { label: "Bind to...", action: () => setShowBindMenu(prev => !prev) }
    ]

    const mapKnobValue = (value: number) => {
        const mappedValue = mapValues(value, 0, 1, minValue, maxValue);
        setCurrent(mappedValue);
    }

    // ------------

    return (
        <div className="relative w-fit">
            <div onContextMenu={rightClickHandler} className="w-fit">
                <span>{label}</span>

                <div onMouseDown={handleMouseDown} className="w-15 aspect-square select-none relative overflow-show">
                    <svg width={"100%"} height={"100%"} className="absolute z-10 rotate-135">
                        <circle r={"45%"} stroke="orange" strokeWidth={3}
                            fill="none"
                            cx={"50%"} cy={"50%"}
                            ref={backValueCircleRef} />
                    </svg>

                    <svg width={"100%"} height={"100%"} className="absolute z-20 rotate-135">
                        <circle r={"45%"} stroke="red" strokeWidth={3}
                            fill="none"
                            cx={"50%"} cy={"50%"}
                            ref={valueCircleRef} />


                    </svg>

                    <div className="w-70/100 aspect-square bg-amber-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            transform: `rotate(${currentRotation}deg)`
                        }} >
                        <div className="bg-red-500 w-1/12 h-1/3 rounded-full absolute top-0 left-1/2 -translate-x-1/2" />
                    </div>
                </div>
                {currentValue.toFixed(2)}

            </div>

            <div className="absolute right-0 z-100 w-full">
                <div className="">
                    {
                        showMenu &&
                        <KnobMenu options={knobMenuOptions} />
                    }
                </div>

                <div>
                    <MapControll mapKnobValue={mapKnobValue} showMenu={showBindMenu} />
                </div>
            </div>



        </div>
    )
}

export default Knob;