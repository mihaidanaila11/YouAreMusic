export type Subscriber = (fingerDistance: number) => void;
export type Point = {
    x: number,
    y: number,
}

export class ControlManager{
    private subscribers = new Set<Subscriber>();

    publish(thumbPoint: Point, selectedPoint: Point, wristPoint: Point, middleBasePoint: Point){
        const wristToMiddleBaseDistance = Math.sqrt(
            Math.pow(middleBasePoint.x - wristPoint.x, 2) + Math.pow(middleBasePoint.y - wristPoint.y, 2)
        );

        const thumbToSelectedDistance = Math.sqrt(
            Math.pow(selectedPoint.x - thumbPoint.x, 2) + Math.pow(selectedPoint.y - thumbPoint.y, 2)
        ) / wristToMiddleBaseDistance;
        this.subscribers.forEach(listener => {
            listener(thumbPoint, selectedPoint);
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