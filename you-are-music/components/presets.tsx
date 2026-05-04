import usePresetStore from "@/services/presetStore";
import { useEffect, useMemo, useState } from "react";
import OptionPick from "./UI Control/Control/optionPick";
import { fetchPresetsAction, savePresetAction } from "@/services/db/presets";
import { Preset } from "@/generated/prisma/client";



const Presets = () => {
    // 1. Select the raw data (assuming your store has a 'presets' object or array)
    const presets = usePresetStore((state) => state.presets);

    useEffect(() => {
        const load = async () => {
            const dbPresets = await fetchPresetsAction();
            const statePresets = dbPresets.map((preset) => {
                return {
                    name: preset.name,
                    synthStates: preset.data as Record<string, any>, // Adjust this based on your actual data structure
                }
            }) // Asta rulează pe server
            console.log("Fetched presets:", presets);
            usePresetStore.getState().setPresets(statePresets);
        }
        load();
    }, []);
    const presetNames = useMemo(() => {
        // Adjust this logic based on how your presets are structured
        return presets.map((preset) => preset.name);
    }, [presets]);

    const savePreset = usePresetStore((state) => state.savePreset);
    const getPresetByName = usePresetStore((state) => state.getPresetByName);
    const handleSavePreset = async () => {
        savePreset("My Preset");
        const savedPreset = getPresetByName("My Preset");
        const newPreset: Omit<Preset, "id"> = {
            name: "My Preset",
            data: savedPreset ? JSON.parse(JSON.stringify(savedPreset.synthStates)) : {},
            public: false,
            userId: null,
        }

        await savePresetAction(newPreset);
        console.log("Preset saved to DB:", newPreset);
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