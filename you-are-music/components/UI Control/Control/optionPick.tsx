import { useState } from "react";

interface OptionPickProps{
    setOption: (option: any) => void,
    options: any[]
}

const OptionPick = ({ setOption, options }: OptionPickProps) => {
    const [currentOptionIndex, setIndex] = useState<number>(0);

    const handleOptionChange = (index: number) => {
        setIndex(index);
        setOption(options[index]);
    }

    const handleNext = () => {
        handleOptionChange((currentOptionIndex + 1) % options.length);
    }

    const handlePrev = () => {
        handleOptionChange((currentOptionIndex - 1 + options.length) % options.length);
    }

    return(
        <div className="w-full flex items-center justify-between ">
            <div onClick={handlePrev} className="cursor-pointer">&lt;</div>
            <select onChange={(e) => handleOptionChange(parseInt(e.target.value))} value={currentOptionIndex}>
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