interface MapController{
    category: ControlCategory;
};

interface Control{
    name: string,
    subscribeFunction: () => void;
}

interface ControlCategory{
    name: string,
    controls: Control[]
}

const SynthControlls: ControlCategory[] = [
    {
        name: "Filter",
        controls: [
            {
                name: "Frequency",
                subscribeFunction: () => {
                    console.log("Subscribed to Frequency control");
                }
            }
        ]
    },
    {
        name: "ADSR",
        controls: [
            {
                name: "Attack",
                subscribeFunction: () => {}
            },
            {
                name: "Decay",
                subscribeFunction: () => {}
            },
            {
                name: "Sustain",
                subscribeFunction: () => {}
            },
            {
                name: "Release",
                subscribeFunction: () => {}
            }
        ]
    }
];

export default SynthControlls;