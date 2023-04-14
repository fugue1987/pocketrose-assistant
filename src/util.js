/**
 * ============================================================================
 * [ 简 单 的 工 具 函 数 ]
 * ----------------------------------------------------------------------------
 * 对js不熟，如果有现成的函数，就尽量替换。
 * ============================================================================
 */

export function contains(text, searchString) {
    return text.indexOf(searchString) !== -1;
}

export function substringBefore(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(0, idx);
}

export function substringAfter(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(idx + searchString.length);
}

export function substringBetween(text, leftString, rightString) {
    return substringBefore(substringAfter(text, leftString), rightString);
}

export function substringBeforeSlash(text) {
    if (text.includes(" /")) {
        return substringBefore(text, " /");
    }
    if (text.includes("/")) {
        return substringBefore(text, "/");
    }
    return text;
}

export function substringAfterSlash(text) {
    if (text.includes("/ ")) {
        return substringAfter(text, "/ ");
    }
    if (text.includes("/")) {
        return substringAfter(text, "/");
    }
    return text;
}

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