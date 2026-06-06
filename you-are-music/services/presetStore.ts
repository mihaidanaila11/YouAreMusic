import { FilterState } from '@/components/synth/filter';
import { GlobalSynthControllerState } from '@/components/synth/globalSynthController';
import { SynthState } from '@/components/synth/synth';
import { SynthControllerState } from '@/components/synth/synthController';
import { get } from 'http';
import { create } from 'zustand'
import { savePresetAction } from './db/presets';
import { LfoState } from '@/components/synth/Lfo/lfo';

export interface GlobalStates {
    lfos: Record<string, LfoState>;
    bpm: number;
    pitch: number;
}

export type Preset = {
    id?: string;
    name: string;
    synthStates: Record<string, SynthState>;
    globalStates: GlobalStates;
    isFromUser: boolean;
    userId?: string | null;
}



const defaultPreset = {
    name: "Default Preset",
    synthStates: {
        "osc_1": { } as SynthState,
        "osc_2": { } as SynthState,
    } as Record<string, SynthState>,
    globalStates: {
      "lfos": {
        "lfos_1": { } as LfoState,
        "lfos_2": { } as LfoState,
        "lfos_3": { } as LfoState,
      } as Record<string, LfoState>,
      "bpm": 120,
      "pitch": 67,     
    } as GlobalStates,
    isFromUser: false,
} as Preset;




export interface PresetState {
  synthStates: Record<string, SynthState>;
  presets: Preset[];
  globalStates: GlobalStates;
  updateSynthState: (synthId: string, newState: Partial<SynthState>) => void;
  updateGlobalState: (newState: Partial<GlobalStates>) => void;
  updateLfoState: (lfoId: string, newState: Partial<LfoState>) => void;

  savePreset: (presetName: string, userId: string) => Promise<Preset | null>;
  loadPreset: (presetName: string) => void;

  getPresetNames: () => string[];
  getPresetByName: (presetName: string) => Preset | undefined;

  setPresets: (presets: Preset[]) => void;
}

const usePresetStore = create<PresetState>((set, get) => ({

  synthStates: defaultPreset.synthStates,
  globalStates: defaultPreset.globalStates,
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

  updateGlobalState: (newState) => set((state) => ({
    globalStates: {
      ...state.globalStates,
      ...newState
    }
  })),

  updateLfoState: (lfoId, newState) => set((state) => ({
    globalStates: {
      ...state.globalStates,
      lfos: {
        ...state.globalStates.lfos,
        [lfoId]: { ...state.globalStates.lfos[lfoId], ...newState }
      }
    }
  })),

  savePreset: async (presetName, userId): Promise<Preset | null>  => {
    const { synthStates, globalStates } = get();
    const presetData = {
      name: presetName,
      synthStates: synthStates,
      globalStates: globalStates,
      isFromUser: true,
      userId: userId,
      public: false
    } as Preset;

    const presetDbData = {
      name: presetName,
      data: JSON.parse(JSON.stringify({
        synthStates: synthStates,
        globalStates: globalStates,
      })),
      userId: userId,
      public: false,
      isDefault:false,
    }

    try{
      const response = await savePresetAction(presetDbData);

      if(!response) {
        console.error("Failed to save preset to database");
        return null;
      }

      presetData.id = response.id;
    }
    catch(error){
      console.error("Error saving preset:", error);
    }
    

    set((state) => ({
      presets: [...state.presets, presetData]
    }));


    const jsonData = JSON.stringify(presetData, null, 2);

    console.log("Saving preset:", jsonData);

    return presetData;
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
      globalStates: preset.globalStates,
    });
  },

  getPresetNames: () => get().presets.map((preset) => preset.name),
  getPresetByName: (presetName: string) => get().presets.find((p) => p.name === presetName),
  setPresets: (presets: Preset[]) => set({ presets: [defaultPreset, ...presets] }),
}));

export default usePresetStore;