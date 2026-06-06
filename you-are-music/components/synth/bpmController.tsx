import { useEffect, useState } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import usePresetStore from "@/services/presetStore";

const BpmController = () => {
    const updateGlobalState = usePresetStore((state) => state.updateGlobalState);
    const state = usePresetStore((state) => state.globalStates);
    const [bpm, setBpm] = useState<number>(120);
    
    // Handle BPM change
        useEffect(() => {
            Tone.Transport.bpm.rampTo(bpm, 0.1);
        }, [bpm]);

    return (
        <div>
            <Knob
                        label="BPM"
                        setValue={setBpm}
                        minValue={20}
                        maxValue={500}
                        sensitivity={4}
                        value={state.bpm}
                        updatePreset={(value) => updateGlobalState({ bpm: value })}
                    />
        </div>
    );
}

export default BpmController;