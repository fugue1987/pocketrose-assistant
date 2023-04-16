/**
 * ============================================================================
 * [ 事 件 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 没想好具体怎么弄好，目前不清楚js怎么做事件监听的机制，先临时这样吧，有机会再重构。
 * 目的是为了将逻辑和展现解耦。
 * ============================================================================
 */

import * as page from "./page";

export const EVENT_TARGET_CASTLE = "EVENT_TARGET_CASTLE";
export const EVENT_TARGET_TOWN = "EVENT_TARGET_TOWN";

export function createEventHandler(role) {
    return function (id, data) {
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
    };
}

export const _event_town_deposit = "_event_town_deposit";
export const _event_town_withdraw = "_event_town_withdraw";

function getEventHandlers() {
    const eventHandlers = {};
    eventHandlers[_event_town_deposit] = function (data) {
        const player = getEventProperty(data, "player", "你");
        const amount = getEventProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "在城市银行存入了" + amount + "万现金");
        } else {
            page.publishMessageBoard(player + "在城市银行存入了全部现金");
        }
    };
    eventHandlers[_event_town_withdraw] = function (data) {
        const player = getEventProperty(data, "player", "你");
        const amount = getEventProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "从城市银行提取了" + amount + "万现金");
        }
    };
    return eventHandlers;
}

function getEventProperty(data, name, defaultValue) {
    if (data === undefined) {
        return defaultValue;
    }
    const value = data[name];
    if (value === undefined) {
        return defaultValue;
    }
    return value;
}

export function publishEvent(id, data) {
    const handler = getEventHandlers()[id];
    if (handler !== undefined) {
        handler(data);
    }
}