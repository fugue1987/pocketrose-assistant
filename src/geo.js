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

export class Direction {

    #name;
    #code;

    constructor(name, code) {
        this.#name = name;
        this.#code = code;
    }


    get name() {
        return this.#name;
    }

    get code() {
        return this.#code;
    }
}

export function isSameCoordinate(a, b) {
    return a.x === b.x && a.y === b.y;
}

export function calculateDirection(from, to) {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;

    let direction;
    if (x1 === x2) {
        // 上或者下
        if (y2 > y1) {
            direction = ["%u2191", "↑"];
        } else {
            direction = ["%u2193", "↓"];
        }
    } else if (y1 === y2) {
        // 左或者右
        if (x2 > x1) {
            direction = ["%u2192", "→"];
        } else {
            direction = ["%u2190", "←"];
        }
    } else {
        // 4种斜向移动
        if (x2 > x1 && y2 > y1) {
            direction = ["%u2197", "↗"];
        }
        if (x2 > x1 && y2 < y1) {
            direction = ["%u2198", "↘"];
        }
        if (x2 < x1 && y2 > y1) {
            direction = ["%u2196", "↖"];
        }
        if (x2 < x1 && y2 < y1) {
            direction = ["%u2199", "↙"];
        }
    }

    return new Direction(direction[0], direction[1]);
}

export function calculateDistance(from, to) {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}
