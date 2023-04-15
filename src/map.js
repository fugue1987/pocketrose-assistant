/**
 * ============================================================================
 * [ 地 图 相 关 功 能 ]
 * ============================================================================
 */

import * as network from "./network";
import * as page from "./page";
import * as geo from "./geo";
import {isSameCoordinate} from "./geo";
import * as util from "./util";

export function enterTown(credential, townId, callback) {
    page.publishMessageBoard("等待进城冷却中......(约55秒)");
    util.latencyExecute(55000, function () {
        const request = credential.asRequest();
        request["townid"] = townId;
        request["mode"] = "MOVE";
        network.sendPostRequest("status.cgi", request, function (html) {
            if ($(html).text().includes("战胜门卫。")) {
                page.publishMessageBoard("与门卫交涉中......");
                const request = credential.asRequest();
                request["townid"] = townId;
                request["givemoney"] = "1";
                request["mode"] = "MOVE";
                network.sendPostRequest("status.cgi", request, function () {
                    page.publishMessageBoard("门卫通情达理的收取了合理的入城税");
                    if (callback !== undefined) {
                        callback();
                    }
                });
            } else {
                if (callback !== undefined) {
                    callback();
                }
            }
        });
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

            util.latencyExecute(55000, function () {
                const from = pathList[index];
                const to = pathList[index + 1];

                const direction = geo.calculateDirection(from, to);
                const distance = geo.calculateDistance(from, to);
                page.publishMessageBoard("准备" + direction.name + "移动" + distance + "格");

                const request = journey._credential.asRequest();
                request["con"] = "2";
                request["navi"] = "on";
                request["mode"] = "CHARA_MOVE";
                request["direct"] = direction.code;
                request["chara_m"] = distance;
                network.sendPostRequest("map.cgi", request, function () {
                    page.publishMessageBoard(journey._role.name + "到达坐标" + to.longText());
                    journey.#moveOnPath(pathList, index + 1, callback);
                });
            });
        }
    }

    #calculatePath() {
        const pathList = [];
        if (isSameCoordinate(this._source, this._destination)) {
            pathList.push(this._source);
            return pathList;
        }
        const milestone = geo.calculateMilestone(this._source, this._destination, this._mode);
        if (milestone !== undefined) {
            const p1 = geo.calculateMilestonePath(this._source, milestone, this._scope);
            const p2 = geo.calculateMilestonePath(milestone, this._destination, this._scope);
            pathList.push(...p1);
            pathList.push(...p2);
            pathList.push(this._destination);
        } else {
            const p = geo.calculateMilestonePath(this._source, this._destination, this._scope);
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


}