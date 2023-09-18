export interface MovePath {
    x: number;
    y: number;
    length: number;
    canCapture: "yes" | "no" | "only";
}