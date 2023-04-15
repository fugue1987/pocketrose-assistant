/**
 * ============================================================================
 * [ 地 图 移 动 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 移动事件定义
 * LEAVE_CASTLE
 * LEAVE_TOWN
 * MOVE_STYLE
 * ============================================================================
 */
import {sendPostRequest} from "./network";

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
                    eventHandler("LEAVE_TOWN");
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
                    eventHandler("MOVE_STYLE", {"move_style": style});
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
                    eventHandler.publish("LEAVE_CASTLE");
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
                    eventHandler.publish("MOVE_STYLE", {"move_style": style});
                }

                resolve(style);
            });
        });
    };
    return await doLeaveCastle(credential, eventHandler);
}