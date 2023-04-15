/**
 * ============================================================================
 * [ 地 图 / 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */

import * as event from "./event";
import * as geo from "./geo";
import * as network from "./network";
import * as util from "./util";

/**
 * 用于描述移动计划的数据结构。表述了谁从哪里移动到哪里，怎么样的移动方式。
 */
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

/**
 * 执行移动计划的入口函数
 * @param plan 移动计划
 * @param eventHandler 事件处理器
 * @returns {Promise<void>}
 */
export async function executeMovePlan(plan, eventHandler) {
    const doExecuteMovePlan = (plan, eventHandler) => {
        return new Promise((resolve) => {
            const pathList = geo.calculatePath(
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