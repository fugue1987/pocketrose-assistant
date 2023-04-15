/**
 * ============================================================================
 * [ 地 图 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */
import {sendPostRequest} from "./network";

export class MoveEvent {

    #listener;

    constructor(listener) {
        this.#listener = listener;
    }

    publish(id, data) {
        this.#listener(id, data);
    }

}

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
 * @param moveEvent 移动事件
 * @returns {Promise<MoveStyle>}
 */
export async function leaveTown(credential, moveEvent) {
    const doLeaveTown = (credential, moveEvent) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["navi"] = "on";
            request["out"] = "1";
            request["mode"] = "MAP_MOVE";
            sendPostRequest("map.cgi", request, function (html) {
                moveEvent.publish("LEAVE_TOWN");

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
                moveEvent.publish("MOVE_STYLE", {"move_style": style});

                resolve(style);
            });
        });
    };
    return await doLeaveTown(credential, moveEvent);
}