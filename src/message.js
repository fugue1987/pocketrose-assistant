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
