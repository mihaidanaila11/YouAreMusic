import OptionPick from "../UI Control/Control/optionPick"

const scales = {
    "Major": [0, 2, 4, 5, 7, 9, 11],
    "Minor": [0, 2, 3, 5, 7, 8, 10],
}

interface ScaleControllerProps {
    setNotes: (notes: number[]) => void;
}

const ScaleController = ({ setNotes }: ScaleControllerProps) => {

    return(
        <OptionPick setOption={(option) => {
            setNotes(scales[option as keyof typeof scales]);
        }}
        options={Object.keys(scales)} />
    )
};

export default ScaleController;