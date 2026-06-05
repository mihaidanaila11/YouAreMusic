import { SynthControllerState } from "@/components/synth/synthController";
import usePresetStore from "@/services/presetStore";
import { useContext } from "react";
import { SynthIdContext } from "../context/synthIdContext";

export const useCurrentOsc = () => {
    const id = useContext(SynthIdContext);
    if (!id) {
        throw new Error("useCurrentOsc must be used within a SynthWrapper");
    }

    const state = usePresetStore((s) => s.synthStates[id]);
    const update = usePresetStore((s) => s.updateSynthState);

    const setSynthState = (partial: Partial<SynthControllerState>) => update(id, partial);

    return { state, setSynthState };
};