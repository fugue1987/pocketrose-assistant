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
export const EVENT_DEPOSIT_AT_TOWN = "EVENT_DEPOSIT_AT_TOWN";
export const EVENT_ENTER_CASTLE = "EVENT_ENTER_CASTLE";
export const EVENT_ENTER_CASTLE_ENTRY = "EVENT_ENTER_CASTLE_ENTRY";
export const EVENT_ENTER_TOWN = "EVENT_ENTER_TOWN";
export const EVENT_ENTER_TOWN_AWAIT = "EVENT_ENTER_TOWN_AWAIT";
export const EVENT_ENTER_TOWN_GUARD = "EVENT_ENTER_TOWN_GUARD";
export const EVENT_ENTER_TOWN_GUARD_PASS = "EVENT_ENTER_TOWN_GUARD_PASS";
export const EVENT_LEAVE_TOWN = "EVENT_LEAVE_TOWN";
export const EVENT_MOVE = "EVENT_MOVE";
export const EVENT_MOVE_AWAIT = "EVENT_MOVE_AWAIT";
export const EVENT_TARGET_CASTLE = "EVENT_TARGET_CASTLE";
export const EVENT_TARGET_TOWN = "EVENT_TARGET_TOWN";
export const EVENT_WITHDRAW_FROM_TOWN = "EVENT_WITHDRAW_FROM_TOWN";

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
        if (id === EVENT_DEPOSIT_AT_TOWN) {
            page.publishMessageBoard(role.name + "把身上全部现金存入了银行");
        }
        if (id === EVENT_ENTER_CASTLE) {
            const castleName = data["castleName"];
            page.publishMessageBoard(role.name + "进入了城堡'" + castleName + "'");
        }
        if (id === EVENT_ENTER_CASTLE_ENTRY) {
            page.publishMessageBoard(role.name + "进入城堡入口");
        }
        if (id === EVENT_ENTER_TOWN) {
            const townName = data["townName"];
            if (townName !== undefined) {
                page.publishMessageBoard(role.name + "进入了<b style='color:darkorange'>" + townName + "</b>");
            }
        }
        if (id === EVENT_ENTER_TOWN_AWAIT) {
            page.publishMessageBoard(role.name + "等待进城冷却中......(约55秒)");
        }
        if (id === EVENT_ENTER_TOWN_GUARD) {
            page.publishMessageBoard(role.name + "与门卫交涉中......");
        }
        if (id === EVENT_ENTER_TOWN_GUARD_PASS) {
            page.publishMessageBoard("门卫通情达理的收取了入城费用放" + role.name + "入城");
        }
        if (id === EVENT_LEAVE_TOWN) {
            const townName = role.townName;
            if (townName === undefined) {
                page.publishMessageBoard(role.name + "已经离开了所在城市");
            } else {
                page.publishMessageBoard(role.name + "已经离开了<b style='color:darkorange'>" + townName + "</b>");
            }
            if (role.coordinate !== undefined) {
                page.publishMessageBoard(role.name + "当前所在坐标" + role.coordinate.longText());
            }
        }
        if (id === EVENT_MOVE) {
            const direction = data["direction"];
            const distance = data["distance"];
            const coordinate = data["coordinate"];
            page.publishMessageBoard(role.name + direction + "移动" + distance + "格，到达" + coordinate.longText());
        }
        if (id === EVENT_MOVE_AWAIT) {
            page.publishMessageBoard(role.name + "等待移动冷却中...... (约55秒)");
        }
        if (id === EVENT_TARGET_CASTLE) {
            const castleName = data["castleName"];
            const castleCoordinate = data["castleCoordinate"];
            let message = role.name + "准备移动到";
            if (castleName === undefined) {
                message += "城堡";
            } else {
                message += "<b style='color:darkorange'>" + castleName + "</b>";
            }
            page.publishMessageBoard(message);
            if (castleCoordinate !== undefined) {
                page.publishMessageBoard("坐标位于" + castleCoordinate.longText());
            }
        }
        if (id === EVENT_TARGET_TOWN) {
            const townName = data["townName"];
            if (townName !== undefined) {
                page.publishMessageBoard(role.name + "准备移动到<b style='color:darkorange'>" + townName + "</b>");
            }
        }
        if (id === EVENT_WITHDRAW_FROM_TOWN) {
            const amount = data["amount"];
            if (amount !== undefined && amount > 0) {
                page.publishMessageBoard(role.name + "从银行提取了" + amount + "万现金");
            }
        }
    };
}
