'use client'

import { useRef } from "react";
import MapControll from "./mapControll";

const HandController = () => {

    return (
        <div className="relative bg-[url('/hand.png')] bg-contain bg-no-repeat w-90 aspect-square m-3">
            <div className="absolute left-1/4 top-5/100">
                <MapControll />
            </div>
            
            <div className="absolute left-47/100 top-0">
                <MapControll />
            </div>

            <div className="absolute left-63/100 top-7/100">
                <MapControll />
            </div>

            <div className="absolute left-88/100 top-29/100">
                <MapControll />
            </div>
        </div>
    )
};

export default HandController;