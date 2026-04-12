import { useState } from "react";

interface ToggleProps {
    label: string,
    onToggle: (value: boolean) => void
};

const Toggle = ( { label, onToggle }: ToggleProps ) => {
    return(
        <div>
            <label>
                <input type="checkbox" onChange={(e) => {
                    console.log(e.target.checked);
                    onToggle(e.target.checked)}} />
                {label}
            </label>
        </div>
    )
};

export default Toggle;