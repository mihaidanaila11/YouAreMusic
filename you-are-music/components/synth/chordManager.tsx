import { useEffect, useState } from "react";
import Toggle from "../UI Control/Control/toggle";
import OptionPick from "../UI Control/Control/optionPick";

const chords = {
    "Major": [0, 4, 7],
    "Minor": [0, 3, 7]
};

interface ChordManagerProps {
    setIntervals: (intervals: number[]) => void;
}

const ChordManager = ({ setIntervals }: ChordManagerProps) => {
    const [useChords, setUseChords] = useState(false);


    return(
        <div>
            <Toggle label="Use Chords" onToggle={(value) => {
                setUseChords(value);
                if (!value) {
                    setIntervals([0]);
                }
            }} />

            {useChords && (
                <div>
                    <OptionPick options={Object.keys(chords)} setOption={(value) => {
                        console.log("Selected chord type:", value);
                        setIntervals(chords[value as keyof typeof chords]);
                    }} />
                </div>
            )}
        </div>
    )
};

export default ChordManager;