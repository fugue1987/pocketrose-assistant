/**
 * ============================================================================
 * [ 地 图 / 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */

import * as event from "./event";
import * as geo from "./geo";
import * as network from "./network";
import {sendPostRequest} from "./network";
import * as util from "./util";
import {latencyExecute} from "./util";
import * as page from "./page";

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
            publishEvent(_event_path, {"pathList": pathList});
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

/**
 * 离开当前所在城市的行动
 * @param credential 用户凭证
 * @param eventHandler 事件处理器
 * @returns {Promise<string, string>}
 */
export async function leaveTown(credential, eventHandler) {
    const doLeaveTown = (credential, eventHandler) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            sendPostRequest("map.cgi", request, function (html) {
                publishEvent(_event_leave_town, {});

                const scope = $(html).find("select[name='chara_m']")
                    .find("option:last").attr("value");
                let mode = "ROOK";
                $(html).find("input:submit").each(function (_idx, input) {
                    const v = $(input).attr("value");
                    const d = $(input).attr("disabled");
                    if (v === "↖" && d === undefined) {
                        mode = "QUEEN";
                    }
                });
                publishEvent(_event_move_mode, {"mode": mode});
                publishEvent(_event_move_scope, {"scope": scope});
                resolve(scope, mode);
            });
        });
    };
    return await doLeaveTown(credential, eventHandler);
}

/**
 * 离开当前所在城堡
 * @param credential 用户凭证
 * @param eventHandler 事件处理器
 * @returns {Promise<string, string>}
 */
export async function leaveCastle(credential, eventHandler) {
    const doLeaveCastle = (credential, eventHandler) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            sendPostRequest("map.cgi", request, function (html) {
                publishEvent(_event_leave_castle, {});

                const scope = $(html).find("select[name='chara_m']")
                    .find("option:last").attr("value");
                let mode = "ROOK";
                $(html).find("input:submit").each(function (_idx, input) {
                    const v = $(input).attr("value");
                    const d = $(input).attr("disabled");
                    if (v === "↖" && d === undefined) {
                        mode = "QUEEN";
                    }
                });
                publishEvent(_event_move_mode, {"mode": mode});
                publishEvent(_event_move_scope, {"scope": scope});
                resolve(scope, mode);
            });
        });
    };
    return await doLeaveCastle(credential, eventHandler);
}

/**
 * 进入城市，如果碰上门卫则自动缴入城费（必须保证身上有足够的现金）
 * @param credential 用户凭证
 * @param townId 城市ID
 * @param eventHandler 事件处理器
 * @returns {Promise<void>}
 */
export async function enterTown(credential, townId, eventHandler) {
    const doEnterTown = (credential, townId, eventHandler) => {
        return new Promise((resolve) => {
            publishEvent(_event_enter_town_await);
            latencyExecute(55000, function () {
                const request = credential.asRequest();
                request["townid"] = townId;
                request["mode"] = "MOVE";
                sendPostRequest("status.cgi", request, function (html) {
                    if ($(html).text().includes("战胜门卫。")) {
                        publishEvent(_event_enter_town_guard);
                        const request = credential.asRequest();
                        request["townid"] = townId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        network.sendPostRequest("status.cgi", request, function () {
                            publishEvent(_event_enter_town_guard_pass);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });
        });
    };
    await doEnterTown(credential, townId, eventHandler);
}

export async function enterCastle(credential, eventHandler) {
    const doEnterCastle = (credential, eventHandler) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "CASTLE_ENTRY";
            network.sendPostRequest("map.cgi", request, function () {
                publishEvent(_event_enter_castle_entry, {});
                resolve();
            });
        });
    };
    await doEnterCastle(credential, eventHandler);
}

// ============================================================================
// 移动时相关事件处理功能
// ============================================================================

export const _event_enter_castle = "_event_enter_castle";
export const _event_enter_castle_entry = "_event_enter_castle_entry";
export const _event_enter_town = "_event_enter_town";
export const _event_enter_town_await = "_event_enter_town_await";
export const _event_enter_town_guard = "_event_enter_town_guard";
export const _event_enter_town_guard_pass = "_event_enter_town_guard_pass";
export const _event_leave_castle = "_event_leave_castle";
export const _event_leave_town = "_event_leave_town";
export const _event_move_mode = "_event_move_mode";
export const _event_move_scope = "_event_move_scope";
export const _event_path = "_event_path";

export function publishEvent(id, data) {
    const player = readEventData(data, "player", "你");
    if (id === _event_enter_castle) {
        let castle = readEventData(data, "castle");
        if (castle === undefined) {
            castle = "所在城堡";
        } else {
            castle = "<b style='color:darkorange'>" + castle + "</b>";
        }
        page.publishMessageBoard(player + "进入了" + castle);
    }
    if (id === _event_enter_castle_entry) {
        page.publishMessageBoard(player + "来到城堡入口");
    }
    if (id === _event_enter_town) {
        let town = readEventData(data, "town");
        if (town === undefined) {
            town = "目的城市";
        } else {
            town = "<b style='color:darkorange'>" + town + "</b>";
        }
        page.publishMessageBoard(player + "进入了" + town);
    }
    if (id === _event_enter_town_await) {
        page.publishMessageBoard(player + "等待进城冷却中......(约55秒)");
    }
    if (id === _event_enter_town_guard) {
        page.publishMessageBoard(player + "与门卫交涉中......");
    }
    if (id === _event_enter_town_guard_pass) {
        page.publishMessageBoard("门卫通情达理的收取了入城费用放" + player + "入城");
    }
    if (id === _event_leave_castle) {
        let castle = readEventData(data, "castle");
        if (castle === undefined) {
            castle = "所在城堡";
        } else {
            castle = "<b style='color:darkorange'>" + castle + "</b>";
        }
        page.publishMessageBoard(player + "已经离开了" + castle);
    }
    if (id === _event_leave_town) {
        let town = readEventData(data, "town");
        if (town === undefined) {
            town = "所在城市";
        } else {
            town = "<b style='color:darkorange'>" + town + "</b>";
        }
        page.publishMessageBoard(player + "已经离开了" + town);
    }
    if (id === _event_move_mode) {
        const mode = readEventData(data, "mode");
        page.publishMessageBoard(player + "确定移动模式" + mode);
    }
    if (id === _event_move_scope) {
        const scope = readEventData(data, "scope");
        page.publishMessageBoard(player + "确定移动范围" + scope);
    }
    if (id === _event_path) {
        const pathList = data["pathList"];
        if (pathList.length > 1) {
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
        }
    }
}

function readEventData(data, name, defaultValue) {
    if (data === undefined) {
        return defaultValue;
    }
    const value = data[name];
    if (value === undefined) {
        return defaultValue;
    }
    return value;
}