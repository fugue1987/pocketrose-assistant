/**
 * ============================================================================
 * [ 地 理 信 息 模 块 ]
 * ============================================================================
 */

/**
 * 地图上的坐标点。
 */
export class Coordinate {

    #x;
    #y;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    /**
     * X坐标
     * @returns {number}
     */
    get x() {
        return this.#x;
    }

    /**
     * Y坐标
     * @returns {number}
     */
    get y() {
        return this.#y;
    }

    longText() {
        return "(" + this.#x + "," + this.#y + ")";
    }
}

export function isSameCoordinate(a, b) {
    return a.x === b.x && a.y === b.y;
}

export function calculateDistance(from, to) {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
