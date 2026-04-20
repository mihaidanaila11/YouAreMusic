import Adsr from "@/components/synth/adsr";
import * as Tone from "tone";

class DragManager{
    private static currentEnvDragged: Tone.Envelope| null = null;
    private static currentLfoDragged: Tone.LFO | null = null;
    private static dragging: boolean = false;

    public static setCurrentEnv(env: Tone.Envelope | null) {
        if(this.dragging) return;

        this.currentEnvDragged = env;
        this.dragging = env !== null;
    }

    public static setCurrentLfo(lfo: Tone.LFO | null) {
        if (this.dragging) return;

        this.currentLfoDragged = lfo;
        this.dragging = lfo !== null;
    }

    public static getCurrentEnv(): Tone.Envelope | null {
        return this.currentEnvDragged;
    }

    public static getCurrentLfo(): Tone.LFO | null {
        return this.currentLfoDragged;
    }

    public static dropCurrentEnv(): Tone.Envelope | null {
        this.dragging = false;
        return DragManager.currentEnvDragged;
    }

    public static dropCurrentLfo(): Tone.LFO | null {
        this.dragging = false;
        return DragManager.currentLfoDragged;
    }

}

export default DragManager;