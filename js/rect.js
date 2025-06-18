export default class Rect {
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(point) {
        return point.x >= this.x
            && point.y >= this.y
            && point.x < this.x + this.w
            && point.y < this.y + this.h;
    }
}
