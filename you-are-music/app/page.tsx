'use client'

import { useEffect, useRef, useState } from "react";

const words = ["love", "happiness", "sadness", "anger", "fear", "surprise", "disgust", "trust", "anticipation", "joy"];

const LandingPage = () => {

    const [currentWordIndex, setIndex] = useState(0);
    const [pauseWords, setPauseWords] = useState(true);

    useEffect(() => {
    let timer;

    if (!pauseWords) {
        timer = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 30);

        setTimeout(() => setPauseWords(true), 2000);
    } else {
        timer = setTimeout(() => {
            setPauseWords(false);
        }, 4000);
    }

    return () => {
        clearInterval(timer);
        clearTimeout(timer);
    };
}, [pauseWords, words.length]);
    

    return (
        <div className="bg-[url(/LandingBG.jpg)] bg-cover w-screen h-screen ">
            <div className="h-full w-130 flex flex-col gap-30 justify-center ml-20">
                <div>
                    <h1 className="elms-sans font-thin text-8xl ">You are<br />
                        <span className="cinzel-decorative font-bold">{pauseWords ? "music" : words[currentWordIndex]}</span>
                    </h1>

                    <p className="elms-sans font-light text-3xl">Break any barriers.<br />Make your gestures heard!</p>
                </div>
                <a href="/synth" className="cinzel-decorative font-regular bg-black w-fit h-fit text-theme-white px-7 py-2 rounded-full">get started</a>
            </div>



        </div>

    )
};

export default LandingPage;