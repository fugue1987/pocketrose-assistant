/**
 * ============================================================================
 * [ 地 图 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */
import * as network from "./network";
import {sendPostRequest} from "./network";
import {latencyExecute} from "./util";

export class MoveStyle {

    #scope;
    #mode;

    constructor(scope, mode) {
        this.#scope = scope;
        this.#mode = mode;
    }


    get scope() {
        return this.#scope;
    }

    get mode() {
        return this.#mode;
    }
}

/**
 * 离开当前所在城市的行动
 * @param credential 用户凭证
 * @param eventHandler 事件处理器
 * @returns {Promise<MoveStyle>}
 */
export async function leaveTown(credential, eventHandler) {
    const doLeaveTown = (credential, eventHandler) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            sendPostRequest("map.cgi", request, function (html) {
                if (eventHandler !== undefined) {
                    eventHandler("EVENT_LEAVE_TOWN");
                }

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

                const style = new MoveStyle(scope, mode);
                if (eventHandler !== undefined) {
                    eventHandler("EVENT_CHECK_MOVE_STYLE", {"scope": scope, "mode": mode});
                }

                resolve(style);
            });
        });
    };
    return await doLeaveTown(credential, eventHandler);
}

/**
 * 离开当前所在城堡
 * @param credential 用户凭证
 * @param eventHandler 事件处理器
 * @returns {Promise<MoveStyle>}
 */
export async function leaveCastle(credential, eventHandler) {
    const doLeaveCastle = (credential, eventHandler) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            sendPostRequest("map.cgi", request, function (html) {
                if (eventHandler !== undefined) {
                    eventHandler("EVENT_LEAVE_CASTLE");
                }

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

                const style = new MoveStyle(scope, mode);
                if (eventHandler !== undefined) {
                    eventHandler("EVENT_CHECK_MOVE_STYLE", {"scope": scope, "mode": mode});
                }

                resolve(style);
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
            if (eventHandler !== undefined) {
                eventHandler("EVENT_ENTER_TOWN_AWAIT");
            }
            latencyExecute(55000, function () {
                const request = credential.asRequest();
                request["townid"] = townId;
                request["mode"] = "MOVE";
                sendPostRequest("status.cgi", request, function (html) {
                    if ($(html).text().includes("战胜门卫。")) {
                        if (eventHandler !== undefined) {
                            eventHandler("EVENT_ENTER_TOWN_GUARD");
                        }
                        const request = credential.asRequest();
                        request["townid"] = townId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        network.sendPostRequest("status.cgi", request, function () {
                            if (eventHandler !== undefined) {
                                eventHandler("EVENT_ENTER_TOWN_GUARD_PASS");
                            }
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