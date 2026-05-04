import { FilterState } from '@/components/synth/filter';
import { GlobalSynthControllerState } from '@/components/synth/globalSynthController';
import { SynthState } from '@/components/synth/synth';
import { SynthControllerState } from '@/components/synth/synthController';
import { get } from 'http';
import { create } from 'zustand'

const defaultPreset = {
    name: "Default Preset",
    synthStates: {
        "synth_1": { } as SynthState,
        "synth_2": { } as SynthState,
    } as Record<string, SynthState>,
}

type Preset = typeof defaultPreset;


export interface PresetState {
  synthStates: Record<string, SynthState>;
  presets: Preset[];
  updateSynthState: (synthId: string, newState: Partial<SynthState>) => void;

  savePreset: (presetName: string) => void;
  loadPreset: (presetName: string) => void;

  getPresetNames: () => string[];
  getPresetByName: (presetName: string) => Preset | undefined;

  setPresets: (presets: Preset[]) => void;
}

const usePresetStore = create<PresetState>((set, get) => ({

  synthStates: defaultPreset.synthStates,
  presets: [defaultPreset],

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

    set((state) => ({
      presets: [...state.presets, presetData]
    }));

    const jsonData = JSON.stringify(presetData, null, 2);

    console.log("Saving preset:", jsonData);
  },

  loadPreset: (presetName) => {
    const preset = get().presets.find((p) => p.name === presetName);

    if (!preset) {
      console.error(`Preset "${presetName}" not found`);
      return;
    }

    console.log("Loading preset:", preset);

    set({
      synthStates: preset.synthStates,
    });
  },

  getPresetNames: () => get().presets.map((preset) => preset.name),
  getPresetByName: (presetName: string) => get().presets.find((p) => p.name === presetName),
  setPresets: (presets: Preset[]) => set({ presets }),
}));

export default usePresetStore;