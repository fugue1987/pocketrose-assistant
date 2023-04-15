/**
 * ============================================================================
 * [ 地 图 相 关 功 能 ]
 * ============================================================================
 */

import * as network from "./network";
import * as page from "./page";
import * as geo from "./geo";
import {calculatePath} from "./geo";
import * as util from "./util";
import * as event from "./event";

export class MovePlan {

    _credential;
    _source;
    _destination;
    _scope;
    _mode;

    constructor() {
    }

    get credential() {
        return this._credential;
    }

    set credential(value) {
        this._credential = value;
    }

    get source() {
        return this._source;
    }

    set source(value) {
        this._source = value;
    }

    get destination() {
        return this._destination;
    }

    set destination(value) {
        this._destination = value;
    }

    get scope() {
        return this._scope;
    }

    set scope(value) {
        this._scope = value;
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;
    }
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

    start(callback, eventHandler) {
        const pathList = calculatePath(this._source,
            this._destination,
            this._scope,
            this._mode);
        if (eventHandler !== undefined) {
            eventHandler(event.EVENT_CALCULATE_MOVE_PATH, {"pathList": pathList});
        }
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

}

export async function executeMovePlan(plan, eventHandler) {
    const doExecuteMovePlan = (plan, eventHandler) => {
        return new Promise((resolve) => {
            const pathList = calculatePath(
                plan.source,
                plan.destination,
                plan.scope,
                plan.mode
            );
            if (eventHandler !== undefined) {
                eventHandler(event.EVENT_CALCULATE_MOVE_PATH, {"pathList": pathList});
            }
            moveOnPath(
                plan.credential,
                pathList,
                0,
                function () {
                    resolve();
                },
                eventHandler
            );
        });
    };
    await doExecuteMovePlan(plan, eventHandler);
}


function moveOnPath(credential, pathList, index, callback, eventHandler) {
    if (pathList.length === 1 || index === pathList.length - 1) {
        // 路径中只有一个点，表示起点和终点是一个点，直接结束
        // 已经移动到最后一个点
        callback();
    } else {
        if (eventHandler !== undefined) {
            eventHandler(event.EVENT_MOVE_AWAIT);
        }

        util.latencyExecute(55000, function () {
            const from = pathList[index];
            const to = pathList[index + 1];

            const direction = geo.calculateDirection(from, to);
            const distance = geo.calculateDistance(from, to);

            const request = credential.asRequest();
            request["con"] = "2";
            request["navi"] = "on";
            request["mode"] = "CHARA_MOVE";
            request["direct"] = direction.code;
            request["chara_m"] = distance;
            network.sendPostRequest("map.cgi", request, function () {
                if (eventHandler !== null) {
                    eventHandler(event.EVENT_MOVE, {
                        "direction": direction.name,
                        "distance": distance,
                        "coordinate": to
                    });
                }
                moveOnPath(credential, pathList, index + 1, callback, eventHandler);
            });
        });
    }
}