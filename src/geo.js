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

export function calculateMilestone(from, to, mode) {
    if (mode === "ROOK") {
        if (from.x === to.x || from.y === to.y) {
            return undefined;
        }
        return new Coordinate(from.x, to.y);
    }
    if (mode === "QUEEN") {
        if (from.x === to.x || from.y === to.y) {
            return undefined;
        }
        const xDelta = Math.abs(from.x - to.x);
        const yDelta = Math.abs(from.y - to.y);
        if (xDelta === yDelta) {
            return undefined;
        }
        const delta = Math.min(xDelta, yDelta);
        let x = from.x;
        let y = from.y;
        if (to.x > from.x) {
            x = x + delta;
        } else {
            x = x - delta;
        }
        if (to.y > from.y) {
            y = y + delta;
        } else {
            y = y - delta;
        }
        return new Coordinate(x, y);
    }
    return undefined;
}

export function calculateMilestonePath(from, to, scope) {
    const nodeList = [];
    nodeList.push(from);
    if (from.x === to.x) {
        // 一条竖线上
        const step = Math.ceil(Math.abs(from.y - to.y) / scope);
        for (let i = 1; i <= step - 1; i++) {
            if (to.y > from.y) {
                nodeList.push(new Coordinate(from.x, from.y + (i * scope)));
            } else {
                nodeList.push(new Coordinate(from.x, from.y - (i * scope)));
            }
        }
    } else if (from.y === to.y) {
        // 一条横线上
        const step = Math.ceil(Math.abs(from.x - to.x) / scope);
        for (let i = 1; i <= step - 1; i++) {
            if (to.x > from.x) {
                nodeList.push(new Coordinate(from.x + (i * scope), from.y));
            } else {
                nodeList.push(new Coordinate(from.x - (i * scope), from.y));
            }
        }
    } else {
        // 一条斜线上
        const step = Math.ceil(Math.abs(from.x - to.x) / scope);
        for (let i = 1; i <= step - 1; i++) {
            let x = from.x;
            if (to.x > from.x) {
                x = x + (i * scope);
            } else {
                x = x - (i * scope);
            }
            let y = from.y;
            if (to.y > from.y) {
                y = y + (i * scope);
            } else {
                y = y - (i * scope);
            }
            nodeList.push(new Coordinate(x, y));
        }
    }
    return nodeList;
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

    return new Direction(direction[1], direction[0]);
}

export function calculateDistance(from, to) {
    const x1 = from.x;
    const y1 = from.y;
    const x2 = to.x;
    const y2 = to.y;
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
}

/**
 * 计算起始坐标到目的坐标之间完整的路径
 * @param source 起点坐标
 * @param destination 目的坐标
 * @param scope 移动范围
 * @param mode 移动模式
 * @returns {Coordinate[]}
 */
export function calculatePath(source, destination, scope, mode) {
    const pathList = [];
    if (isSameCoordinate(source, destination)) {
        pathList.push(source);
        return pathList;
    }
    const milestone = calculateMilestone(source, destination, mode);
    if (milestone !== undefined) {
        const p1 = calculateMilestonePath(source, milestone, scope);
        const p2 = calculateMilestonePath(milestone, destination, scope);
        pathList.push(...p1);
        pathList.push(...p2);
        pathList.push(destination);
    } else {
        const p = calculateMilestonePath(source, destination, scope);
        pathList.push(...p);
        pathList.push(destination);
    }

    return pathList;
}