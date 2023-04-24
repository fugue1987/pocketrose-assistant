/**
 * ============================================================================
 * [ 地 图 / 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */

import * as util from "../common/common_util";
import {calculateDirection, calculateDistance, calculatePath, Coordinate} from "../common/common_util";
import * as network from "../common/common_network";
import * as message from "../message";
import {getTown} from "./pocket_town";
import * as message2 from "../common/common_message";

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
            const pathList = calculatePath(
                plan.source,
                plan.destination,
                plan.scope,
                plan.mode
            );
            if (pathList.length > 1) {
                message2.publishMessageBoard("旅途路径已经计算完毕，总共需要次移动" + (pathList.length - 1) + "步");
                let msg = "旅途路径规划：";
                for (let i = 0; i < pathList.length; i++) {
                    let node = pathList[i];
                    msg += node.longText();
                    if (i !== pathList.length - 1) {
                        msg += "=>";
                    }
                }
                message2.publishMessageBoard(msg);
            }
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
        message2.publishMessageBoard("你等待移动冷却中......(约55秒)");
        util.latencyExecute(55000, function () {
            const from = pathList[index];
            const to = pathList[index + 1];

            const direction = calculateDirection(from, to);
            const distance = calculateDistance(from, to);

            const request = credential.asRequest();
            request["con"] = "2";
            request["navi"] = "on";
            request["mode"] = "CHARA_MOVE";
            request["direct"] = direction.code;
            request["chara_m"] = distance;
            network.sendPostRequest("map.cgi", request, function () {
                message2.publishMessageBoard("你" + direction.name + "移动" + distance + "格，到达" + to.longText() + "。");
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
                message2.publishMessageBoard("你已经离开了所在城市。");
                const plan = initializeMovePlan(html);
                plan.credential = credential;
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
                message2.publishMessageBoard("你已经离开了城堡。");
                const plan = initializeMovePlan(html);
                plan.credential = credential;
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
                            message2.publishMessageBoard("门卫通情达理的收取了入城费用放你入城。");
                            const town = getTown(townId);
                            if (town !== undefined) {
                                message.publishMessageBoard(message._message_town_enter, {"town": town.name});
                            }
                            resolve();
                        });
                    } else {
                        const town = getTown(townId);
                        if (town !== undefined) {
                            message.publishMessageBoard(message._message_town_enter, {"town": town.name});
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
                message2.publishMessageBoard("你来到了城堡入口。");
                resolve();
            });
        });
    };
    await doEnterCastle(credential);
}

/**
 * 执行探险操作
 * @param credential
 * @returns {Promise<string>}
 */
export async function explore(credential) {
    const doExplore = (credential) => {
        return new Promise((resolve) => {
            message2.publishMessageBoard("你在等待探险冷却中......(约55秒)");
            util.latencyExecute(55000, function () {
                const request = credential.asRequest();
                request["mode"] = "MAP_SEARCH";

                network.sendPostRequest("map.cgi", request, function (html) {
                    if (html.includes("所持金超过1000000。请先存入银行。")) {
                        message2.publishMessageBoard("在探险过程中，突然跳出<b style='color:chartreuse'>3个BT</b>对你进行了殴打！");
                        resolve("被3BT殴打！");
                    } else {
                        const found = $(html).find("h2:first").text();
                        message2.publishMessageBoard("<b style='color:red'>" + found + "</b>");
                        resolve(found);
                    }
                });
            });
        });
    };
    return await doExplore(credential);
}

/**
 * 当进入地图模式时，读取地图的信息初始化移动计划。
 * 有三种方式进入地图：
 * 1. 出城
 * 2. 离开城堡
 * 3. 大地图子菜单中退出
 * @param html 源HTML
 * @returns {MovePlan}
 */
export function initializeMovePlan(html) {
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
    let from = undefined;
    $(html).find("td").each(function (_idx, td) {
        const text = $(td).text();
        if (text.includes("现在位置(") && text.endsWith(")")) {
            const s = util.substringBetween(text, "(", ")");
            const x = util.substringBefore(s, ",");
            const y = util.substringAfter(s, ",");
            from = new Coordinate(parseInt(x), parseInt(y));
        }
    });
    message2.publishMessageBoard("你确定移动模式" + mode);
    message2.publishMessageBoard("你确定移动范围" + scope);
    message2.publishMessageBoard("你当前的坐标" + from.longText());
    const plan = new MovePlan();
    plan.scope = scope;
    plan.mode = mode;
    plan.source = from;
    return plan;
}
