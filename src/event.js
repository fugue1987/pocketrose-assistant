/**
 * ============================================================================
 * [ 事 件 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 没想好具体怎么弄好，目前不清楚js怎么做事件监听的机制，先临时这样吧，有机会再重构。
 * 目的是为了将逻辑和展现解耦。
 * ============================================================================
 */

import * as page from "./page";

export const EVENT_CALCULATE_MOVE_PATH = "EVENT_CALCULATE_MOVE_PATH";
export const EVENT_CHECK_MOVE_STYLE = "EVENT_CHECK_MOVE_STYLE";
export const EVENT_ENTER_TOWN_AWAIT = "EVENT_ENTER_TOWN_AWAIT";
export const EVENT_ENTER_TOWN_GUARD = "EVENT_ENTER_TOWN_GUARD";
export const EVENT_ENTER_TOWN_GUARD_PASS = "EVENT_ENTER_TOWN_GUARD_PASS";
export const EVENT_LEAVE_CASTLE = "EVENT_LEAVE_CASTLE";
export const EVENT_LEAVE_TOWN = "EVENT_LEAVE_TOWN";

export function createEventHandler(role) {
    return function (id, data) {
        if (id === EVENT_CALCULATE_MOVE_PATH) {
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
        if (id === "EVENT_CHECK_MOVE_STYLE") {
            const scope = data["scope"];
            const mode = data["mode"];
            page.publishMessageBoard(role.name + "确定移动范围" + scope);
            page.publishMessageBoard(role.name + "确定移动模式" + mode);
        }
        if (id === "EVENT_ENTER_TOWN_AWAIT") {
            page.publishMessageBoard(role.name + "等待进城冷却中......(约55秒)");
        }
        if (id === "EVENT_ENTER_TOWN_GUARD") {
            page.publishMessageBoard(role.name + "与门卫交涉中......");
        }
        if (id === "EVENT_ENTER_TOWN_GUARD_PASS") {
            page.publishMessageBoard("门卫通情达理的收取了入城费用放" + role.name + "入城");
        }
        if (id === "EVENT_LEAVE_CASTLE") {
            page.publishMessageBoard(role.name + "已经离开城堡'" + role.castleName + "'");
            page.publishMessageBoard(role.name + "当前所在坐标" + role.coordinate.longText());
        }
    };
}
