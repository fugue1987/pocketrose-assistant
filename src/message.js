/**
 * ============================================================================
 * [ 消 息 面 板 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 用于展现实时消息，目的是为了将逻辑和展现解耦。
 * 在使用消息面板前需要提前在当前页面构建id为messageBoard的元素作为消息展现的载体。
 * ============================================================================
 */

import * as page from "./page";

// ============================================================================
// Message id definitions
// ============================================================================

export const _message_town_enter = "_message_town_enter";
export const _message_town_enter_await = "_message_town_enter_await";
export const _message_town_enter_guard = "_message_town_enter_guard";
export const _message_town_enter_guard_pass = "_message_town_enter_guard_pass";
export const _message_town_leave = "_message_town_leave";

function getMessageHandlers() {
    const getProperty = (data, name, defaultValue) => {
        if (data === undefined) {
            return defaultValue;
        }
        const value = data[name];
        if (value === undefined) {
            return defaultValue;
        }
        return value;
    }
    const getPlayer = (data) => {
        return getProperty(data, "player", "你");
    }
    const getTown = (data) => {
        let value = getProperty(data, "town");
        if (value !== undefined) {
            value = "<b style='color:darkorange'>" + value + "</b>";
        }
        return value;
    }
    const getCastle = (data) => {
        let value = getProperty(data, "castle");
        if (value !== undefined) {
            return "<b style='color:darkorange'>" + value + "</b>";
        } else {
            return "城堡";
        }
    };
    const handlers = {};
    // ------------------------------------------------------------------------
    // TOWN related message handlers
    // ------------------------------------------------------------------------
    handlers[_message_town_enter] = function (data) {
        const player = getPlayer(data);
        let town = getTown(data);
        if (town === undefined) {
            town = "目的城市";
        }
        page.publishMessageBoard(player + "进入了" + town);
    };
    handlers[_message_town_enter_await] = function (data) {
        const player = getPlayer(data);
        page.publishMessageBoard(player + "等待进城冷却中......(约55秒)");
    };
    handlers[_message_town_enter_guard] = function (data) {
        const player = getPlayer(data);
        page.publishMessageBoard(player + "与门卫交涉中......");
    };
    handlers[_message_town_enter_guard_pass] = function (data) {
        const player = getPlayer(data);
        page.publishMessageBoard("门卫通情达理的收取了入城费用放" + player + "入城");
    };
    handlers[_message_town_leave] = function (data) {
        const player = getPlayer(data);
        let town = getTown(data);
        if (town === undefined) {
            town = "所在城市";
        }
        page.publishMessageBoard(player + "已经离开了" + town);
    };
    return handlers;
}

export function publishMessageBoard(id, data) {
    const handler = getMessageHandlers()[id];
    if (handler !== undefined) {
        handler(data);
    }
}

export function initializeMessageBoard(htmlMessage) {
    page.initializeMessageBoard(htmlMessage);
}

export function writeMessageBoard(htmlMessage) {
    page.publishMessageBoard(htmlMessage);
}
