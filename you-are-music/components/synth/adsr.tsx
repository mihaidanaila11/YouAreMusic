import { RefObject, useEffect, useMemo, useState } from "react";
import Knob from "../UI Control/Control/knob";
import { Line } from "react-chartjs-2";
import { ChartData, Chart, CategoryScale, LinearScale, PointElement, LineElement, ChartOptions } from "chart.js";
import * as Tone from "tone"

interface AdsrProps{
    synthRef: RefObject<Tone.Synth<Tone.SynthOptions> | null>
}

const Adsr = ( {synthRef}: AdsrProps ) => {
    const [attackTime, setAttack] = useState<number>(0);
    const [decayTime, setDecay] = useState<number>(0);
    const [sustainValue, setSustain] = useState<number>(0);
    const [releaseTime, setRelease] = useState<number>(0);

    const attackValue = 1;
    const decayValue = 0.7;
    const sustainTime = 1;
    const releaseValue = 0;

    const graphPoints = useMemo( () => {
        const a = attackTime;
        const d = decayTime;
        const s = sustainTime;
        const r = releaseTime;

        return [
            { x: 0, y: 0 },
            { x: a, y: attackValue },
            { x: a + d, y: decayValue },
            { x: a + d + s, y: sustainValue },
            { x: a + d + s + r, y: 0 },
        ];
    }, [attackTime, decayTime, sustainValue, releaseTime]);

    useEffect( () => {
        if(!synthRef || !synthRef.current) return;
        synthRef.current.envelope.set({
            attack: attackTime,
            decay: decayTime,
            sustain: sustainValue,
            release: releaseTime
        });
    }, [graphPoints])

    Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
    );

    const chartData: ChartData<"line", number[], number> ={
        labels: graphPoints.map( (point) => point.x),
        datasets: [{
            data: graphPoints.map( (point) => point.y)
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
        scales:{
            x:{
                type: 'linear' as const,
                grid: {
                    display: false,
                } 
            },

            y: {
                grid:{
                    display: false,
                },
            }
        }
    } as ChartOptions<"line">;


    return(
        <div>
            
            <h2>Controlls</h2>
            <div className="w-xl h-fit">
                <Line options={options} data={chartData}/>
            </div>
            
            <div className="flex">
                <Knob
                minValue={0}
                maxValue={10}
                step={0.1}
                setValue={setAttack}
                label="Attack" />

                <Knob
                minValue={0}
                maxValue={10}
                step={0.1}
                setValue={setDecay}
                label="Decay" />

                <Knob
                minValue={0}
                maxValue={1}
                step={0.1}
                setValue={setSustain}
                label="Sustain" />

                <Knob
                minValue={0}
                maxValue={10}
                step={0.1}
                setValue={setRelease}
                label="Release" />
            </div>
        </div>
    )
}

export default Adsr;