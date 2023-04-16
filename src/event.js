/**
 * ============================================================================
 * [ 事 件 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 没想好具体怎么弄好，目前不清楚js怎么做事件监听的机制，先临时这样吧，有机会再重构。
 * 目的是为了将逻辑和展现解耦。
 * ============================================================================
 */

import * as page from "./page";

export const EVENT_DEPOSIT_AT_TOWN = "EVENT_DEPOSIT_AT_TOWN";
export const EVENT_TARGET_CASTLE = "EVENT_TARGET_CASTLE";
export const EVENT_TARGET_TOWN = "EVENT_TARGET_TOWN";
export const EVENT_WITHDRAW_FROM_TOWN = "EVENT_WITHDRAW_FROM_TOWN";

export function createEventHandler(role) {
    return function (id, data) {
        if (id === EVENT_DEPOSIT_AT_TOWN) {
            page.publishMessageBoard(role.name + "把身上全部现金存入了银行");
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
