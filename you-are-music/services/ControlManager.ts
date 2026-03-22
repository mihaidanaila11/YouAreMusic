export type Listener = (x: number, y: number) => void;

class ControlManager{
    private listeners = new Set<Listener>();

    publish(x: number, y: number){
        this.listeners.forEach(listener => {
            listener(x, y);
        });
    };

    subscribe(listener: Listener){
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    }
};

export const controlBus = new ControlManager();