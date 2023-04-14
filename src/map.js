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
}