export type Subscriber = (fingerDistance: number | null) => void;
export type Point = {
    x: number,
    y: number,
}

export class ControlManager{
    private subscribers = new Set<Subscriber>();

    publish(fingerDistance: number | null){
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

const [leftIndexFingerBus, 
    leftMiddleFingerBus, 
    leftRingFingerBus, 
    leftPinkyFingerBus, 

    rightIndexFingerBus,
    rightMiddleFingerBus,
    rightRingFingerBus,
    rightPinkyFingerBus,
    
    leftHandYBus,
    leftHandXBus,
    rightHandYBus,
    rightHandXBus,

    ] = new Array(12).fill(null).map(() => new ControlManager());

export { leftIndexFingerBus, leftMiddleFingerBus, leftRingFingerBus, leftPinkyFingerBus,
    rightIndexFingerBus, rightMiddleFingerBus, rightRingFingerBus, rightPinkyFingerBus,
    leftHandYBus, leftHandXBus, rightHandYBus, rightHandXBus };