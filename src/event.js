/**
 * ============================================================================
 * [ 事 件 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 没想好具体怎么弄好，目前不清楚js怎么做事件监听的机制，先临时这样吧，有机会再重构。
 * 目的是为了将逻辑和展现解耦。
 * ============================================================================
 */

import * as page from "./page";

export const _event_town_target = "_event_town_target";
export const _event_town_deposit = "_event_town_deposit";
export const _event_town_withdraw = "_event_town_withdraw";

export const _event_castle_target = "_event_castle_target";

export const _event_move_path = "_event_move_path";

function getEventHandlers() {
    const doGetEventProperty = (data, name, defaultValue) => {
        if (data === undefined) {
            return defaultValue;
        }
        const value = data[name];
        if (value === undefined) {
            return defaultValue;
        }
        return value;
    }
    const doGetEventPlayer = (data) => {
        return doGetEventProperty(data, "player", "你");
    }
    const doGetEventTown = (data) => {
        let value = doGetEventProperty(data, "town");
        if (value !== undefined) {
            value = "<b style='color:darkorange'>" + value + "</b>";
        }
        return value;
    }
    const doGetEventCastle = (data) => {
        let value = doGetEventProperty(data, "castle");
        if (value !== undefined) {
            return "<b style='color:darkorange'>" + value + "</b>";
        } else {
            return "城堡";
        }
    };
    const handlers = {};
    handlers[_event_town_target] = function (data) {
        const player = doGetEventPlayer(data);
        const town = doGetEventTown(data);
        if (town !== undefined) {
            page.publishMessageBoard(player + "设定移动目标为" + town);
        }
    };
    handlers[_event_town_deposit] = function (data) {
        const player = doGetEventPlayer(data);
        const amount = doGetEventProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "在城市银行存入了" + amount + "万现金");
        } else {
            page.publishMessageBoard(player + "在城市银行存入了全部现金");
        }
    };
    handlers[_event_town_withdraw] = function (data) {
        const player = doGetEventPlayer(data);
        const amount = doGetEventProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "从城市银行提取了" + amount + "万现金");
        }
    };
    handlers[_event_castle_target] = function (data) {
        const player = doGetEventPlayer(data);
        const castle = doGetEventCastle(data);
        page.publishMessageBoard(player + "设定移动目标为" + castle);
    };
    handlers[_event_move_path] = function (data) {
        const pathList = doGetEventProperty(data, "pathList");
        if (pathList !== undefined && pathList.length > 1) {
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
    };
    return handlers;
}

export function publishEvent(id, data) {
    const handler = getEventHandlers()[id];
    if (handler !== undefined) {
        handler(data);
    }
}