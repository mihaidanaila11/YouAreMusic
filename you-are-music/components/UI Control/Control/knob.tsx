import { Dispatch, MouseEvent, SetStateAction, SVGProps, useCallback, useEffect, useRef, useState } from "react";
import { mapValues } from "@/utils/Math";
import KnobMenu from "./knobMenu";
import MapControll from "@/components/hand/mapControll";
import { Point } from "@/services/ControlManager";
import Adsr from "@/components/synth/adsr";
import DragManager from "@/services/AdsrDragManager";
import * as Tone from "tone";
import usePresetStore from "@/services/presetStore";
import colors from "@/app/colors";

type KnobMode = "linear" | "exponential";

interface knobProps {
    setValue: Dispatch<SetStateAction<number>> | ((value: number) => void),
    minValue?: number,
    maxValue?: number,
    label?: string,
    defaultValue?: number,
    mode?: KnobMode,
    step?: number,
    sensitivity?: number,
    envelopeDestination?: Tone.Signal<any> | Tone.Param<any>,
    mapMiddleware?: (value: number, min: number, max: number) => number,
    updatePreset?: (value: number) => void,
    value?: number;

}

const Knob = ({ setValue, minValue = 0, maxValue = 100, label, defaultValue = maxValue / 2, mode = "linear", step = maxValue / 100, sensitivity = maxValue / 100, mapMiddleware, envelopeDestination, updatePreset, value }: knobProps) => {

    // useEffect(() => {
    //     if (defaultValue) {
    //         setValue(defaultValue);
    //         setCurrent(defaultValue);
    //     }
    // }, [])

    // ------------

    const [isDragged, setDragged] = useState(false);
    const startYRef = useRef(0);
    const [currentValue, setCurrent] = useState(defaultValue);
    const [currentRotation, setRotation] = useState(0);
    const valueCircleRef = useRef<SVGCircleElement | null>(null);
    const backValueCircleRef = useRef<SVGCircleElement | null>(null);

    const [minEnvelopeValue, setMinEnvelopeValue] = useState(currentValue);
    const [maxEnvelopeValue, setMaxEnvelopeValue] = useState(maxValue);
    const envelopeCircleRef = useRef<SVGCircleElement | null>(null);
    const [isEnvDragged, setIsEnvDragged] = useState(false);
    const startEnvYRef = useRef(0);
    const [hasEnv, setHasEnv] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [showBindMenu, setShowBindMenu] = useState(false);

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) return;

        setDragged(true);
        startYRef.current = event.clientY;
    }

    const lastValueRef = useRef(currentValue);
    useEffect(() => {
        setCurrent(value ?? defaultValue);
    }, [value])


    useEffect(() => {
        if (!isDragged) return;

        const handleMouseMove = (event: globalThis.MouseEvent) => {

            const currentYPos = event.clientY;
            const delta = startYRef.current - currentYPos;
            const steps = Math.round(delta / sensitivity);

            let newValue = currentValue + steps * step;
            console.log("Delta:", delta, "currentValue:", currentValue, "Steps:", steps, "New Value before clamp:", newValue);


            // Clamped values between min and max
            newValue = Math.max(minValue, Math.min(maxValue, newValue));
            lastValueRef.current = newValue;

            let valuePercent = (newValue - minValue) / (maxValue - minValue);

            if (mode === "exponential") {
                const expValue = minValue * Math.pow(maxValue / minValue, valuePercent);
                newValue = expValue;

                valuePercent = (newValue - minValue) / (maxValue - minValue);
            }

            const newRotation = Math.round(mapValues(valuePercent, 0, 1, -135, 135));

            setRotation(newRotation);
            setCurrent(newValue);
            setMinEnvelopeValue(newValue);
        }

        const handleMouseUp = () => {
            setDragged(false);
            if (updatePreset) {
                console.log("Updating preset with value", lastValueRef.current);
                updatePreset(lastValueRef.current);
            }
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

        const valuePercent = (currentValue - minValue) / (maxValue - minValue);

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

    // Handle Envelope circle

    useEffect(() => {
        if (!envelopeCircleRef.current) return;

        const circleRadius = envelopeCircleRef.current.r.animVal.value;
        const circumference = 2 * Math.PI * circleRadius;

        const circleUsableLen = usableLen * circleRadius;

        const valuePercent = (maxEnvelopeValue - minEnvelopeValue) / (maxValue - minValue);

        const valueLineLen = Math.max(0, Math.min(circleUsableLen * Math.abs(valuePercent), circleUsableLen));
        const offset = Math.max(0, Math.min(circleUsableLen * Math.min(maxEnvelopeValue, minEnvelopeValue) / maxValue, circleUsableLen));

        console.log("valuePercent", valuePercent, "valueLineLen", valueLineLen, "offset", offset);

        envelopeCircleRef.current.setAttribute("stroke-dasharray", `0, ${offset}, ${valueLineLen}, ${circumference - valueLineLen - offset}`);
    }, [maxEnvelopeValue, minEnvelopeValue, hasEnv]);

    const handleEnvDrag = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsEnvDragged(true);
        startEnvYRef.current = e.clientY;
    }

    useEffect(() => {
        if (!isEnvDragged) return;

        const handleMouseMove = (e: globalThis.MouseEvent) => {
            const currentYPos = e.clientY;
            const delta = startEnvYRef.current - currentYPos;
            const steps = Math.round(delta / sensitivity);

            let newValue = maxEnvelopeValue + steps * step;

            newValue = Math.max(minValue, Math.min(maxValue, newValue));

            setMaxEnvelopeValue(newValue);
            console.log("Dragging env, new max value:", newValue);
        };

        const handleMouseUp = () => {
            setIsEnvDragged(false);
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isEnvDragged]);

    // Handle outside effect
    useEffect(() => {
        setValue(currentValue);

    }, [currentValue]);

    const rightClickHandler = (e: MouseEvent) => {
        e.preventDefault();
        setShowMenu(prev => !prev);
        return false;
    }

    const knobMenuOptions = [
        { label: "Reset", action: () => setCurrent(defaultValue) },
        { label: "Bind to...", action: () => setShowBindMenu(prev => !prev) }
    ]

    const mapKnobValue = useCallback((value: number) => {
        const mappedValue = mapValues(value, 0, 1, minValue, maxValue);
        const finalValue = mapMiddleware ? mapMiddleware(mappedValue, minValue, maxValue) : mappedValue;
        setCurrent(finalValue);
    }, [minValue, maxValue, mapMiddleware]);

    // Handle envelope drag and drop
    const scaleRef = useRef(new Tone.Scale(minEnvelopeValue, maxEnvelopeValue));

    const connectEnvelope = (env: Tone.Scale) => {
        if (!envelopeDestination) return;
        env.connect(envelopeDestination);
    }

    const lastEnvRef = useRef<Tone.Envelope | null>(null);
    const disconnectEnvelope = (scale: Tone.Scale) => {
        if (!envelopeDestination) return;
        scale.disconnect(envelopeDestination);

        if(lastEnvRef.current){
            lastEnvRef.current.disconnect(scale);
        }
    }

    const handleEnvDrop = (envelope: Tone.Envelope| null) => {
        if (!envelope) return;

        disconnectEnvelope(scaleRef.current);

        envelope.connect(scaleRef.current.set({ context: envelope.context }));
        lastEnvRef.current = envelope;
        console.log("dropped", envelope);
        connectEnvelope(scaleRef.current);
    }

    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if(!envelopeDestination ) return;
        const draggedEnv = DragManager.getCurrentEnv();
        
        if (draggedEnv) {
            handleEnvDrop(draggedEnv);
            setHasEnv(true);
            return;
        }

        const draggedLfo = DragManager.getCurrentLfo();
        if(draggedLfo){
            draggedLfo.connect(scaleRef.current.set({ context: draggedLfo.context }));
            scaleRef.current.connect(envelopeDestination);
            console.log("Connected LFO to knob destination", draggedLfo, envelopeDestination);
            setHasEnv(true);
            return;
        }
    }

    useEffect(() => {
        if(!hasEnv) return;
        scaleRef.current.min = currentValue;
        scaleRef.current.max = maxEnvelopeValue;
        console.log("Updated scale min to", scaleRef.current.min);
        console.log("Updated scale max to", scaleRef.current.max);
    }, [currentValue, maxEnvelopeValue])


    // ------------

    return (
        <div className="relative w-fit" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
            <div onContextMenu={rightClickHandler} className="w-fit flex flex-col items-center select-none">
                <span className="text-sm">{label}</span>

                <div className="w-15 aspect-square">
                    <div className="w-full aspect-square relative">
                        {hasEnv && (
                            <div onMouseDown={handleEnvDrag} className="w-full aspect-square relative cursor-ew-resize p-2">
                                <svg width={"100%"} height={"100%"} className="absolute z-10 rotate-135 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                                    <circle r={"45%"} stroke="blue" strokeWidth={3}
                                        fill="none"
                                        cx={"50%"} cy={"50%"}
                                        ref={envelopeCircleRef} />
                                </svg>
                            </div>)}


                        <div onMouseDown={handleMouseDown} className="w-80/100 bottom-1/2 right-1/2 translate-1/2 aspect-square select-none absolute overflow-hidden cursor-ns-resize z-20">
                            <div className="aspect-square w-full relative">

                                <svg width={"100%"} height={"100%"} className="absolute z-10 rotate-135">
                                    <circle r={"45%"} stroke={colors.darkCyan} strokeWidth={3}
                                        fill="none"
                                        cx={"50%"} cy={"50%"}
                                        ref={backValueCircleRef} />
                                </svg>

                                <svg width={"100%"} height={"100%"} className="absolute z-20 rotate-135">
                                    <circle r={"45%"} stroke={colors.lightPurple} strokeWidth={2}
                                        fill="none"
                                        cx={"50%"} cy={"50%"}
                                        ref={valueCircleRef} />
                                </svg>
                            </div>



                            <div className="w-70/100 aspect-square bg-white border border-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    transform: `rotate(${currentRotation}deg)`
                                }} >
                                <div className="bg-theme-cyan w-1/7 aspect-square rounded-full absolute top-1 left-1/2 -translate-x-1/2" />
                            </div>
                        </div>
                    </div>
                </div>



                <span className="text-xs">{currentValue.toFixed(2)}</span>



                <div className="absolute right-0 z-100 w-full">
                    {showMenu && <div className="">

                        <KnobMenu options={knobMenuOptions} />

                    </div>}

                    {showMenu && showBindMenu && (
                        <div>
                            <MapControll mapKnobValue={mapKnobValue} />
                        </div>
                    )}
                </div>
            </div>




        </div>
    )
}

export default Knob;