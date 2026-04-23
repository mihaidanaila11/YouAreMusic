import { createContext } from "react";

const SynthIdContext = createContext<string | null>(null);

const SynthWrapper = ({ synthId, children }: { synthId: string, children: React.ReactNode }) => {
    return(
        <SynthIdContext.Provider value={synthId}>
            {children}
        </SynthIdContext.Provider>
    )
};

export { SynthIdContext, SynthWrapper };