/**
 * ============================================================================
 * [ 地 图 相 关 功 能 ]
 * ============================================================================
 */

import * as network from "./network";

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

export function leaveCastle(credential, role, callback) {
    const request = credential.asRequest();
    request["navi"] = "on";
    request["out"] = "1";
    request["mode"] = "MAP_MOVE";

    network.sendPostRequest("map.cgi", request, function (html) {
        const moveScope = $(html).find("select[name='chara_m']").find("option:last").attr("value");
        let moveMode = "ROOK";
        $(html).find("input:submit").each(function (_idx, input) {
            const v = $(input).attr("value");
            const d = $(input).attr("disabled");
            if (v === "↖" && d === undefined) {
                moveMode = "QUEEN";
            }
        });

        if (callback !== undefined) {
            callback(parseInt(moveScope), moveMode);
        }
    });
}

export class Journey {

    _credential;
    _role;
    _source;
    _destination;

    constructor() {
    }

    set credential(value) {
        this._credential = value;
    }

    set role(value) {
        this._role = value;
    }

    set source(value) {
        this._source = value;
    }

    set destination(value) {
        this._destination = value;
    }

    start(callback) {

    }

    #calculatePath() {
        const pathList = [];
        if (isSameCoordinate(this._source, this._destination)) {
            pathList.push(this._source);
            return pathList;
        }

    }

    #calculateMilestone(from, to, mode) {
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

    #calculateMilestonePath(from, to, scope) {
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
}