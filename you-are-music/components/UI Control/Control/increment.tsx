import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface IncrementProps{
    setValue: Dispatch<SetStateAction<number>>,
    minValue?: number,
    maxValue?: number,
    label?: string,
    defaultValue?: number
}

const Increment = ( {setValue, minValue = 0, maxValue = 11, label, defaultValue}: IncrementProps ) => {
    const [currentValue, setCurrent] = useState(0);

    useEffect(() => {
        if(!!defaultValue){
            setCurrent(defaultValue);
        }
    }, [defaultValue]);

    const handleIncrement = () => {
        const newValue = Math.max(minValue, Math.min(maxValue, currentValue + 1));
        setCurrent(newValue);
        setValue(newValue);
    }

    const handleDecrement = () => {
        const newValue = Math.max(minValue, Math.min(maxValue, currentValue - 1));
        setCurrent(newValue);
        setValue(newValue);
    }

    return(
        <div className="flex">
            {label && <label>{label}</label>}
            <span>{currentValue}</span>
            <div className="flex">
                <div onClick={handleIncrement}>+</div>
                <div onClick={handleDecrement}>-</div>
            </div>
        </div>
    )
};

export default Increment;