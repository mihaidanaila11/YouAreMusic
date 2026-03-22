import { RefObject, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { Line } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";
import { controlBus, Listener } from "@/services/ControlManager";
import { mapValues } from "@/utils/Math";

interface FilterProps{
    filterRef: RefObject<Tone.Filter | null>,
};

const [minFreq, maxFreq] = [20, 20000];


const FilterController = ( {filterRef}: FilterProps) => {

    const [frequency, setFreq] = useState<number>(1500);

    const chartDataRef = useRef<ChartData<"line", number[], number> | null>(null);

    useEffect(() => {
        if(!filterRef.current){
            filterRef.current = new Tone.Filter(1500, "lowpass");
        }
    }, [filterRef]);

    useEffect(() => {
        if(!filterRef.current) return;

        filterRef.current.frequency.rampTo(frequency, 0.05);

        const chartLabels = getChartLabels(30);

        chartDataRef.current = {
            labels: chartLabels,
            datasets: [{
                data: getChartValues(chartLabels)
            }]
        };

    }, [frequency]);

    const listenValue = useRef<{x: number, y:number}>({x: 0, y: 0});

    useEffect(() => {
        const listener = (x: number, y: number) => {
            if(!listenValue.current) return;
            listenValue.current = {x, y};

            const clampedValue = Math.max(0, Math.min(listenValue.current.x, 640));
            
            const mapedValue = mapValues(clampedValue, 0, 640, minFreq, maxFreq);
            
            setFreq(mapedValue);
        }

        const unsubscribe = controlBus.subscribe(listener);

        return () => unsubscribe();
    }, [listenValue])

    const getChartLabels = (resolution: number) => {
        const labels = Array.from({length: resolution}, (_, index) => {
            const freq = minFreq * Math.pow(maxFreq / minFreq, index / (resolution - 1));

            return Math.round(freq);
        })
        return labels;
    }

    const getChartValues = (labels: number[]): number[] => {
        if(!filterRef.current) return [];
        const magValues = filterRef.current.getFrequencyResponse(labels.length);

        const dbValues = Array.from(magValues.map((value) => Math
        .max(20 * Math.log10(value), -60)));

        return dbValues;
    }

    
    const options = {
        responsive: true,
        elements:{
            point:{
                radius: 0,
            }
        },
        plugins: {
            legend: { display: false },
        },
        scales:{
            x:{
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10,
                    display: false,
                }
            },

            y: {
                min: -60,
                max: 5,
                grid:{
                    display: false,
                },
            }
        },
        animation: false
    } as ChartOptions<"line">;

    return(
    <div>
        {chartDataRef.current && 
        <div className="w-sm">
            <Line data={chartDataRef.current} options={options} />
        </div>
        }

        <Knob 
        setValue={setFreq}
        label="Frequency"
        minValue={20}
        maxValue={20000}
        mode="exponential"
        />
    </div>
    )
}

export default FilterController; 