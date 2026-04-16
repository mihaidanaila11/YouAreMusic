import { RefObject, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import Knob from "../UI Control/Control/knob";
import { Line } from "react-chartjs-2";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { mapValues } from "@/utils/Math";
import OptionPick from "../UI Control/Control/optionPick";
import { on } from "events";

interface FilterProps{
    filterRef: RefObject<Tone.Filter | null>,
    onLoaded?: () => void,
    ctx: Tone.BaseContext;
};

const filterTypes = ["lowpass", "highpass", "bandpass", "notch", "allpass", "peaking"] as BiquadFilterType[];

const [minFreq, maxFreq] = [20, 20000];


const FilterController = ( {filterRef, onLoaded, ctx}: FilterProps) => {

    const [frequency, setFreq] = useState<number>(1500);

    const chartDataRef = useRef<ChartData<"line", number[], number> | null>(null);
    const chartLineRef = useRef<Chart<"line"> | null>(null);
    const [filterType, setFilterType] = useState<BiquadFilterType>(filterTypes[0]);

    useEffect(() => {
        if(!filterRef.current){
            filterRef.current = new Tone.Filter({
                frequency: frequency,
                type: filterType,
                context: ctx
            });

            onLoaded?.();
        }
    }, [filterRef]);

    useEffect(() => {
        if(!filterRef.current) return;

        filterRef.current.frequency.rampTo(frequency, 0.05);

    }, [frequency]);


    useEffect(() => {
        console.log("Updating chart data");
        const chartLabels = getChartLabels(30);
        const chartValues = getChartValues(chartLabels);

        chartDataRef.current = {
            labels: chartLabels,
            datasets: [{
                data: chartValues
            }]
        };

        if(chartLineRef.current){
            chartLineRef.current.update();
        }
    }, [frequency, filterType])
    const listenValue = useRef<{x: number, y:number}>({x: 0, y: 0});

    useEffect(() => {
        const listener = (x: number, y: number) => {
            if(!listenValue.current) return;
            listenValue.current = {x, y};

            const clampedValue = Math.max(0, Math.min(listenValue.current.x, 640));
            
            const mapedValue = mapValues(clampedValue, 0, 640, minFreq, maxFreq);
            
            setFreq(mapedValue);
        }

        // const unsubscribe = controlBus.subscribe(listener);

        // return () => unsubscribe();
    }, [listenValue])

    // Handle filter type change
    useEffect(() => {
        if(!filterRef.current) return;
        filterRef.current.type = filterType;
    }, [filterType])

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
        maintainAspectRatio: false,
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
                border: {
                    display: false,
                },
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
                border: {
                    display: false,
                },
                min: -60,
                max: 5,
                grid:{
                    display: false,
                },

                ticks: {
                    display: false,
                }
            }
        },
        animation: false
    } as ChartOptions<"line">;

    return(
    <div className="flex flex-col border-2 border-gray-300">
        <span>Filter</span>

        <OptionPick setOption={setFilterType} options={filterTypes} />
        {chartDataRef.current && 
        <div className="w-full">
            <Line data={chartDataRef.current} options={options} ref={chartLineRef}/>
        </div>
        }

        <Knob 
        setValue={setFreq}
        label="Frequency"
        minValue={20}
        maxValue={20000}
        mode="exponential"
        sensitivity={0.4}
        />

        
    </div>
    )
}

export default FilterController; 