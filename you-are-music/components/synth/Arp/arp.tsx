import Knob from "@/components/UI Control/Control/knob";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface ArpProps {
    synthRef: React.RefObject<Tone.Synth<Tone.SynthOptions> | null>
}



const Arp = ({ synthRef }: ArpProps) => {
    const [noteDuration, setNoteDuration] = useState(0.25);
    const patternRef = useRef(new Tone.Pattern(function (time, note) {
        synthRef.current?.triggerAttackRelease(note, "4n", time);
    }, ["C4", "D4", "E4", "G4", "A4"]));

    Tone.Transport.start();

    useEffect(() => {
        patternRef.current.interval = noteDuration;
    }, [noteDuration]);

    return(
        <div>
            <button onClick={() => {patternRef.current.start(0);}}>Start Arp</button>
            <button onClick={() => patternRef.current.stop()}>Stop Arp</button>
        </div>
    )
};

export default Arp;