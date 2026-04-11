import Adsr from "@/components/synth/adsr";
import * as Tone from "tone";

class AdsrDragManager{
    private static currentDragged: Tone.Envelope | null = null;
    private static dragging: boolean = false;

    public static setCurrentDragged(env: Tone.Envelope | null) {
        if(this.dragging) return;

        this.currentDragged = env;
        this.dragging = env !== null;
    }

    public static getCurrentDragged(): Tone.Envelope | null {
        return this.currentDragged;
    }

    public static dropCurrentDragged(): Tone.Envelope | null {
        this.dragging = false;
        return AdsrDragManager.currentDragged;
    }
}

export default AdsrDragManager;