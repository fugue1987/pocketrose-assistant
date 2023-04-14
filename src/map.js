/**
 * ============================================================================
 * [ 地 图 相 关 功 能 ]
 * ============================================================================
 */

import * as network from "./network";
import {Coordinate, isSameCoordinate} from "./util";
import * as page from "./page";

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
    _scope;
    _mode;

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

    set scope(value) {
        this._scope = value;
    }

    set mode(value) {
        this._mode = value;
    }

    start(callback) {
        const pathList = this.#calculatePath();
        this.#moveOnPath(pathList, 0, callback);
    }

    #moveOnPath(pathList, index, callback) {
        if (pathList.length === 1) {
            // 路径中只有一个点，表示起点和终点是一个点，直接结束
            callback(this._credential, this._role, this._destination);
        } else if (index === pathList.length - 1) {
            // 已经移动到最后一个点
            callback(this._credential, this._role, this._destination);
        } else {
            const journey = this;
            page.publishMessageBoard(this._role.name + "等待行动冷却中...... (约55秒)");
            setTimeout(function () {
                const from = pathList[index];
                const to = pathList[index + 1];

                const direction = journey.#calculateDirection(from, to);
                const distance = journey.#calculateDistance(from, to);
                page.publishMessageBoard("准备" + direction[1] + "移动" + distance + "格");

                const request = journey._credential.asRequest();
                request["con"] = "2";
                request["navi"] = "on";
                request["mode"] = "CHARA_MOVE";
                request["direct"] = direction[0];
                request["chara_m"] = distance;
                network.sendPostRequest("map.cgi", request, function () {
                    page.publishMessageBoard(journey._role.name + "到达坐标" + to.longText());
                    journey.#moveOnPath(pathList, index + 1, callback);
                });

            }, 55000);
        }
    }

    #calculatePath() {
        const pathList = [];
        if (isSameCoordinate(this._source, this._destination)) {
            pathList.push(this._source);
            return pathList;
        }
        const milestone = this.#calculateMilestone(this._source, this._destination, this._mode);
        if (milestone !== undefined) {
            const p1 = this.#calculateMilestonePath(this._source, milestone, this._scope);
            const p2 = this.#calculateMilestonePath(milestone, this._destination, this._scope);
            pathList.push(...p1);
            pathList.push(...p2);
            pathList.push(this._destination);
        } else {
            const p = this.#calculateMilestonePath(this._source, this._destination, this._scope);
            pathList.push(...p);
            pathList.push(this._destination);
        }

        page.publishMessageBoard("旅途路径已经计算完毕，总共需要次移动" + (pathList.length - 1) + "步");
        let msg = "旅途路径规划：";
        for (let i = 0; i < pathList.length; i++) {
            let node = pathList[i];
            msg += node.longText();
            if (i !== pathList.length - 1) {
                msg += "=>";
            }
        }
        page.publishMessageBoard(msg);

        return pathList;
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

    #calculateDirection(from, to) {
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

        return direction;
    }

    #calculateDistance(from, to) {
        const x1 = from.x;
        const y1 = from.y;
        const x2 = to.x;
        const y2 = to.y;
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }
}