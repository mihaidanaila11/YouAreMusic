import { Point } from "@/services/ControlManager";

export const mapValues = (value: number, inputMin: number, inputMax: number, outputMin: number, outputMax: number): number => {
    return (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin) + outputMin;
};

export const pointsDistance = (point1: Point, point2: Point): number => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

export const minMaxNormalize = (value: number, min: number, max: number): number => {
    if (max - min === 0) return 0; // Avoid division by zero
    return (value - min) / (max - min);
}