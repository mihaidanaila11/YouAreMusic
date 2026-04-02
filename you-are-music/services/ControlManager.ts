export type Subscriber = (fingerDistance: number) => void;
export type Point = {
    x: number,
    y: number,
}

export class ControlManager{
    private subscribers = new Set<Subscriber>();

    publish(fingerDistance: number){
        this.subscribers.forEach(listener => {
            listener(fingerDistance);
        });
    };

    subscribe(listener: Subscriber){
        this.subscribers.add(listener);
        console.log("Subscriber subscribed. Total subscribers: ", this.subscribers.size);

        return () => {
            this.subscribers.delete(listener);
            console.log("Subscriber unsubscribed. Total subscribers: ", this.subscribers.size);
        };
    }
};

const [indexFingerBus, middleFingerBus, ringFingerBus, pinkyFingerBus] = [new ControlManager(), new ControlManager(), new ControlManager(), new ControlManager()];

export { indexFingerBus, middleFingerBus, ringFingerBus, pinkyFingerBus };