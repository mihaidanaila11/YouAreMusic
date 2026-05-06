import { useEffect, useState } from "react";

interface OptionPickProps{
    setOption: (option: any) => void,
    options: any[]
    values?: any[]
}

const OptionPick = ({ setOption, options, values }: OptionPickProps) => {
    const [currentOptionIndex, setIndex] = useState<number>(0);

    useEffect(() => {
        setIndex(options.length - 1);
    }, [options, values])

    useEffect(() => {
        if(values) {
            setOption(values[currentOptionIndex]);
        }
        else{
            setOption(options[currentOptionIndex]);
        }
    }, [currentOptionIndex])

    const handleNext = () => {
        setIndex((currentOptionIndex + 1) % options.length);
    }

    const handlePrev = () => {
        setIndex((currentOptionIndex - 1 + options.length) % options.length);
    }

    return(
        <div className="w-full flex items-center justify-between ">
            <div onClick={handlePrev} className="cursor-pointer">&lt;</div>
            <select onChange={(e) => setIndex(parseInt(e.target.value))} value={currentOptionIndex}>
                {options.map((option, index) => (
                    <option key={index} value={index}>
                        {option}
                    </option>
                ))}
            </select>
            <div onClick={handleNext} className="cursor-pointer">&gt;</div>
        </div>
    )
}

export default OptionPick;