import usePresetStore from "@/services/presetStore";
import { useEffect, useMemo, useRef, useState } from "react";
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
    
    const [newPresetName, setNewPresetName] = useState("");

    const handleSavePreset = async () => {
        savePreset("My Preset");
        const savedPreset = getPresetByName("My Preset");
        const newPreset: Omit<Preset, "id"> = {
            name: newPresetName,
            data: savedPreset ? JSON.parse(JSON.stringify(savedPreset.synthStates)) : {},
            public: false,
            userId: null,
        }

        await savePresetAction(newPreset);
        setNewPresetName("");
        setIsModalOpen(false);
        console.log("Preset saved to DB:", newPreset);
    }

    const loadPreset = usePresetStore((state) => state.loadPreset);

    const handlePresetSelect = (presetName: string) => {
        loadPreset(presetName);
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    

    const openModal = () => {
        setIsModalOpen(true);
    }
    return (
        <div>
            {/* Modal for saving preset */}

            {isModalOpen && (
                <div className="bg-gray-800 text-white p-4 pt-0 rounded shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-200">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full flex justify-end">
                            <button onClick={() => setIsModalOpen(false)}>x</button>
                        </div>
                        <div>
                            <input 
                                type="text" 
                                placeholder="Preset Name" 
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                            />
                            <button onClick={handleSavePreset}>Save</button>
                        </div>
                    </div>
                </div>
            )}


            <div>
                <button onClick={openModal}>Save preset</button>

                <OptionPick options={presetNames} setOption={handlePresetSelect} />
            </div>

        </div>
    )
};

export default Presets;