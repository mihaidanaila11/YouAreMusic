import usePresetStore from "@/services/presetStore";
import { useMemo, useState } from "react";
import OptionPick from "./UI Control/Control/optionPick";



const Presets = () => {
    // 1. Select the raw data (assuming your store has a 'presets' object or array)
    const presets = usePresetStore((state) => state.presets);

    // 2. Derive the names locally so it only recalculates when 'presets' actually changes
    const presetNames = useMemo(() => {
        // Adjust this logic based on how your presets are structured
        return presets.map((preset) => preset.name);
    }, [presets]);

    const savePreset = usePresetStore((state) => state.savePreset);
    const handleSavePreset = () => {
        savePreset("My Preset");
    }

    const loadPreset = usePresetStore((state) => state.loadPreset);

    const handlePresetSelect = (presetName: string) => {
        loadPreset(presetName);
    }
    return (
        <div>
            <button onClick={handleSavePreset}>Save preset</button>

            <OptionPick options={presetNames} setOption={handlePresetSelect} />
        </div>
    )
};

export default Presets;