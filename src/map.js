/**
 * ============================================================================
 * [ 地 图 / 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */

import * as geo from "./geo";
import * as network from "./network";
import * as util from "./util";
import * as message from "./message";
import * as pocket from "./pocket";

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
 * @returns {Promise<void>}
 */
export async function executeMovePlan(plan) {
    const doExecuteMovePlan = (plan) => {
        return new Promise((resolve) => {
            const pathList = geo.calculatePath(
                plan.source,
                plan.destination,
                plan.scope,
                plan.mode
            );
            message.publishMessageBoard(message._message_move_path, {"pathList": pathList});
            moveOnPath(
                plan.credential,
                pathList,
                0,
                function () {
                    resolve();
                }
            );
        });
    };
    await doExecuteMovePlan(plan);
}

function moveOnPath(credential, pathList, index, callback) {
    if (pathList.length === 1 || index === pathList.length - 1) {
        // 路径中只有一个点，表示起点和终点是一个点，直接结束
        // 已经移动到最后一个点
        callback();
    } else {
        message.publishMessageBoard(message._message_move_await, {"timeout": 55});
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
                message.publishMessageBoard(message._message_move, {
                    "direction": direction.name,
                    "distance": distance,
                    "coordinate": to
                });
                moveOnPath(credential, pathList, index + 1, callback);
            });
        });
    }
}

/**
 * 离开当前所在城市的行动
 * @param credential 用户凭证
 * @returns {Promise<MovePlan>}
 */
export async function leaveTown(credential) {
    const doLeaveTown = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            network.sendPostRequest("map.cgi", request, function (html) {
                message.publishMessageBoard(message._message_town_leave);

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
                message.publishMessageBoard(message._message_move_scope, {"scope": scope});
                message.publishMessageBoard(message._message_move_mode, {"mode": mode});

                const plan = new MovePlan();
                plan.credential = credential;
                plan.scope = scope;
                plan.mode = mode;

                resolve(plan);
            });
        });
    };
    return await doLeaveTown(credential);
}

/**
 * 离开当前所在城堡
 * @param credential 用户凭证
 * @returns {Promise<MovePlan>}
 */
export async function leaveCastle(credential) {
    const doLeaveCastle = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            network.sendPostRequest("map.cgi", request, function (html) {
                message.publishMessageBoard(message._message_castle_leave);

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
                message.publishMessageBoard(message._message_move_mode, {"mode": mode});
                message.publishMessageBoard(message._message_move_scope, {"scope": scope});
                const plan = new MovePlan();
                plan.credential = credential;
                plan.scope = scope;
                plan.mode = mode;
                resolve(plan);
            });
        });
    };
    return await doLeaveCastle(credential);
}

/**
 * 进入城市，如果碰上门卫则自动缴入城费（必须保证身上有足够的现金）
 * @param credential 用户凭证
 * @param townId 城市ID
 * @returns {Promise<void>}
 */
export async function enterTown(credential, townId) {
    const doEnterTown = (credential, townId) => {
        return new Promise((resolve) => {
            message.publishMessageBoard(message._message_town_enter_await);
            util.latencyExecute(55000, function () {
                const request = credential.asRequest();
                request["townid"] = townId;
                request["mode"] = "MOVE";
                network.sendPostRequest("status.cgi", request, function (html) {
                    if ($(html).text().includes("战胜门卫。")) {
                        message.publishMessageBoard(message._message_town_enter_guard);
                        const request = credential.asRequest();
                        request["townid"] = townId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        network.sendPostRequest("status.cgi", request, function () {
                            message.publishMessageBoard(message._message_town_enter_guard_pass);
                            const town = pocket.getTown(townId);
                            if (town !== undefined) {
                                message.publishMessageBoard(message._message_town_enter, {"town": town});
                            }
                            resolve();
                        });
                    } else {
                        const town = pocket.getTown(townId);
                        if (town !== undefined) {
                            message.publishMessageBoard(message._message_town_enter, {"town": town});
                        }
                        resolve();
                    }
                });
            });
        });
    };
    await doEnterTown(credential, townId);
}

export async function enterCastle(credential) {
    const doEnterCastle = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "CASTLE_ENTRY";
            network.sendPostRequest("map.cgi", request, function () {
                message.publishMessageBoard(message._message_castle_entry);
                resolve();
            });
        });
    };
    await doEnterCastle(credential);
}

export async function explore(credential) {
    const doExplore = (credential) => {
        return new Promise((resolve) => {
            message.publishMessageBoard(message._message_treasure_await, {"timeout": 55});
            util.latencyExecute(55000, function () {
                const request = credential.asRequest();
                request["mode"] = "MAP_SEARCH";
                // TODO
                message.writeMessageBoard("模拟探险");
                resolve();
            });
        });
    };
    await doExplore(credential);
}
