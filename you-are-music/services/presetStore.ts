import { FilterState } from '@/components/synth/filter';
import { GlobalSynthControllerState } from '@/components/synth/globalSynthController';
import { SynthControllerState } from '@/components/synth/synthController';
import { get } from 'http';
import { create } from 'zustand'

const defaultPreset = {
    name: "Default Preset",
    synthStates: {
        "synth_1": { } as SynthControllerState,
        "synth_2": { } as SynthControllerState,
    } as Record<string, SynthControllerState>,
}

const presets = [defaultPreset];


interface PresetState {
  synthStates: Record<string, SynthControllerState>;
  updateSynthState: (synthId: string, newState: Partial<SynthControllerState>) => void;

  savePreset: (presetName: string) => void;
  loadPreset: (presetName: string) => void;
}

const usePresetStore = create<PresetState>((set, get) => ({

  synthStates: defaultPreset.synthStates,

  updateSynthState: (synthId, newState) => set((state) => {
    console.log(`Updating synth ${synthId} with`, newState);

    return {
      synthStates: {
        ...state.synthStates,
        [synthId]: { ...state.synthStates[synthId], ...newState }
      }
    }
  }),

  savePreset: (presetName) => {
    const { synthStates } = get();
    const presetData = {
      name: presetName,
      synthStates: synthStates,
    };

    presets.push(presetData);

    const jsonData = JSON.stringify(presetData, null, 2);

    console.log("Saving preset:", jsonData);
  },

  loadPreset: (presetName) => {
    const preset = presets.find((p) => p.name === presetName);

    if (!preset) {
      console.error(`Preset "${presetName}" not found`);
      return;
    }

    console.log("Loading preset:", preset);

    set({
      synthStates: preset.synthStates,
    });
  },
}));

export default usePresetStore;