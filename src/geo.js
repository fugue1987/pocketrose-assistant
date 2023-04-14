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