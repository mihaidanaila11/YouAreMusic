import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface knobProps{
    inputValue: number | undefined,
    setValue: Dispatch<SetStateAction<number>>
    minValue?: number,
    maxValue?: number,
    label?: string,
    defaultValue?: number,
    step?: number,
}

const Knob = ({inputValue, setValue, minValue, maxValue, label, defaultValue, step }: knobProps) => {

    useEffect(() => {
        if(defaultValue) setValue(defaultValue)
    }, [])
    const onValueChange = (e: any) => {
        setValue(parseFloat(e.target.value));
    }

    return(
        <div>
            <label>{label}</label>
            <input type="range"
            value={inputValue} min={minValue} max={maxValue} onChange={onValueChange} step={step} />
            <span>{inputValue}</span>
        </div>
    )
}

export default Knob;