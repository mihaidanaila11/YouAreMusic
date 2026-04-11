import { RefObject, useEffect, useMemo, useState } from "react";
import Knob from "../UI Control/Control/knob";
import { Line } from "react-chartjs-2";
import { ChartData, Chart, CategoryScale, LinearScale, PointElement, LineElement, ChartOptions } from "chart.js";
import * as Tone from "tone"

interface AdsrProps {
    setParams?: (attack: number, decay: number, sustain: number, release: number) => void,
    label?: string
}

const Adsr = ({ setParams, label }: AdsrProps) => {
    const [attackTime, setAttack] = useState<number>(0);
    const [decayTime, setDecay] = useState<number>(0);
    const [sustainValue, setSustain] = useState<number>(0);
    const [releaseTime, setRelease] = useState<number>(0);

    const attackValue = 1;
    const decayValue = 0.7;
    const sustainTime = 1;
    const releaseValue = 0;

    const graphPoints = useMemo(() => {
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

    useEffect(() => {
        setParams?.(attackTime, decayTime, sustainValue, releaseTime);
    }, [graphPoints])

    Chart.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
    );

    const chartData: ChartData<"line", number[], number> = {
        labels: graphPoints.map((point) => point.x),
        datasets: [{
            data: graphPoints.map((point) => point.y)
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
        scales: {
            x: {
                type: 'linear' as const,
                grid: {
                    display: false,
                }
            },

            y: {
                grid: {
                    display: false,
                },
            }
        }
    } as ChartOptions<"line">;


    return (
        <div className="border-2 border-gray-300 h-full">
            <h2>ADSR {label}</h2>

            <div className="flex flex-col">

                <div className="w-full">
                    <Line options={options} data={chartData} />
                </div>

                <div className="flex gap-1">
                    <Knob
                        minValue={0}
                        maxValue={10}
                        setValue={setAttack}
                        label="Attack" 
                        sensitivity={2}/>

                    <Knob
                        minValue={0}
                        maxValue={10}
                        setValue={setDecay}
                        label="Decay" 
                        sensitivity={2}/>

                    <Knob
                        minValue={0}
                        maxValue={1}
                        setValue={setSustain}
                        label="Sustain" 
                        sensitivity={2}/>

                    <Knob
                        minValue={0}
                        maxValue={10}
                        setValue={setRelease}
                        label="Release"
                        sensitivity={2} />
                </div>
            </div>
        </div>
    )
}

export default Adsr;