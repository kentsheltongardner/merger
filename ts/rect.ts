import Point from "./point"

export default class Rect {
    public x: number
    public y: number
    public w: number
    public h: number

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }

    public contains(point: Point) {
        return point.x >= this.x
            && point.y >= this.y
            && point.x < this.x + this.w
            && point.y < this.y + this.h
    }

    
}