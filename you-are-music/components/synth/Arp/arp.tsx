"use client";

import Button from "@/components/UI Control/Control/button";
import Knob from "@/components/UI Control/Control/knob";
import { RefObject, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface ArpProps {
    oscRefs: RefObject<Set<Tone.Synth<Tone.SynthOptions>>>;
    pitchSignal: RefObject<Tone.Signal<"frequency">>;
}



const Arp = ({ oscRefs, pitchSignal }: ArpProps) => {
    const [noteDuration, setNoteDuration] = useState(0.25);
    const patternRef = useRef(new Tone.Pattern(function (time, note) {
        if (!oscRefs?.current) return;

        oscRefs.current.forEach((osc) => {
            pitchSignal.current?.setValueAtTime(Tone.Frequency(note).toFrequency(), time);
            osc.triggerAttackRelease(note, "4n", time);
            console.log(note);
        });
    }, ["C4", "D4", "E4", "G4", "A4"]));

    Tone.Transport.start();

    useEffect(() => {
        patternRef.current.interval = noteDuration;
    }, [noteDuration]);

    return(
        <div className="flex gap-3">
            <Button onClick={() => {patternRef.current.start(0);}}>Start Arp</Button>
            <Button onClick={() => patternRef.current.stop()}>Stop Arp</Button>
        </div>
    )
};

export default Arp;