import usePresetStore, { GlobalStates, Preset } from "@/services/presetStore";
import { useEffect, useMemo, useRef, useState } from "react";
import OptionPick from "./UI Control/Control/optionPick";
import { deletePresetAction, fetchPresetsAction, fetchPresetsByUserIdAction, savePresetAction } from "@/services/db/presets";

import { getSession, useSession } from "next-auth/react";
import { CiTrash } from "react-icons/ci";
import Button from "./UI Control/Control/button";



const Presets = () => {
    const session = useSession();

    const presets = usePresetStore((state) => state.presets);
    useEffect(() => {
        const load = async () => {
            if(!session.data) return;

            const dbPresets = await fetchPresetsByUserIdAction(session.data.user.id);
            const statePresets = dbPresets.map((preset) => {
                const data = preset.data as { synthStates: Record<string, any>, globalStates: Record<string, any> };
                return {
                    id: preset.id,
                    name: preset.name,
                    synthStates: data.synthStates as Record<string, any>,
                    globalStates: data.globalStates as GlobalStates,
                    userId: preset.userId,
                    isFromUser: true,
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
        if(!session.data) return;

        const preset = await savePreset(newPresetName, session.data.user.id);

        if(!preset) {
            console.error("Failed to save preset");
            return;
        }

        setSelectedPreset(preset);

        setNewPresetName("");
        setIsModalOpen(false);
    }

    const loadPreset = usePresetStore((state) => state.loadPreset);

    const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

    const handlePresetSelect = (preset: Preset) => {
        loadPreset(preset.name);
        console.log(preset)
        setSelectedPreset(preset);
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    

    const openModal = async () => {
        console.log("Session in openModal:", session);
        if (!session.data) {
            setLoggedIn(false);
        }
        else{
            setLoggedIn(true);
        }
        setIsModalOpen(true);
    }

    const handleDeletePreset = async (presetId: string, userId: string) => {
        console.log("Session in handleDeletePreset:", session);
        if(!session.data) return;
        if (userId === session.data.user.id) {
            // Call the delete action for the preset
            console.log(`Attempting to delete preset with ID: ${presetId} for user ID: ${userId}`);
            const response = await deletePresetAction(presetId);
            if (response.error) {
                console.error("Failed to delete preset:", response.error);
            } else {
                // If deletion was successful, update the local state to remove the preset
                usePresetStore.setState((state) => ({
                    presets: state.presets.filter((preset) => preset.id !== presetId)
                }));
                console.log("Preset deleted successfully");
            }
        }
    }
    return (
        <div>
            {/* Modal for saving preset */}

            {isModalOpen && (
                <div className="bg-gray-800 text-white p-4 pt-0 rounded shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-200">
                    <div className="flex flex-col items-center gap-6 m-4">
                        <div className="w-full flex justify-end">
                                    <button onClick={() => setIsModalOpen(false)}>x</button>
                                </div>
                        {loggedIn ? (
                            <div>
                                
                                <div className="flex">
                                    <input
                                        type="text"
                                        placeholder="Preset Name"
                                        value={newPresetName}
                                        onChange={(e) => setNewPresetName(e.target.value)}
                                    />
                                    <Button onClick={handleSavePreset}>Save</Button>
                                </div>
                            </div>
                        ) : (
                            <p>You must be logged in to save presets.</p>
                        )}
                    </div>
                </div>
            )}


            <div className="border-b-2  mb-6 border-gray-300">
                <div className="flex items-center mx-6 my-2">
                    <Button onClick={openModal}>Save</Button>

                    <OptionPick options={presetNames} values={presets} setOption={handlePresetSelect} />
                    {selectedPreset?.userId === session.data?.user.id &&
                        <div className="text-3xl">
                            <button onClick={() => {
                                if (selectedPreset?.id && selectedPreset.userId) {
                                    handleDeletePreset(selectedPreset.id, selectedPreset.userId);
                                }
                            }}><CiTrash /></button>
                        </div>}
                </div>
            </div>
            

        </div>
    )
};

export default Presets;