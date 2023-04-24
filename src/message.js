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
export const _message_town_target = "_message_town_target";
export const _message_town_deposit = "_message_town_deposit";
export const _message_town_withdraw = "_message_town_withdraw";

export const _message_castle_enter = "_message_castle_enter";
export const _message_castle_entry = "_message_castle_entry";
export const _message_castle_leave = "_message_castle_leave";
export const _message_castle_target = "_message_castle_target";
export const _message_castle_withdraw = "_message_castle_withdraw";

export const _message_move = "_message_move";
export const _message_move_await = "_message_move_await";
export const _message_move_mode = "_message_move_mode";
export const _message_move_scope = "_message_move_scope";
export const _message_move_source = "_message_move_source";
export const _message_move_destination = "_message_move_destination";
export const _message_move_path = "_message_move_path";

export const _message_treasure_stay_put = "_message_treasure_stay_put";
export const _message_treasure_await = "_message_treasure_await";
export const _message_treasure_path = "_message_treasure_path";

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
    handlers[_message_town_target] = function (data) {
        const player = getPlayer(data);
        const town = getTown(data);
        if (town !== undefined) {
            page.publishMessageBoard(player + "设定移动目标为" + town);
        }
    };
    handlers[_message_town_deposit] = function (data) {
        const player = getPlayer(data);
        const amount = getProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "在城市银行存入了" + amount + "万现金");
        } else {
            page.publishMessageBoard(player + "在城市银行存入了全部现金");
        }
    };
    handlers[_message_town_withdraw] = function (data) {
        const player = getPlayer(data);
        const amount = getProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "从城市银行提取了" + amount + "万现金");
        }
    };
    // ------------------------------------------------------------------------
    // CASTLE related message handlers
    // ------------------------------------------------------------------------
    handlers[_message_castle_enter] = function (data) {
        const player = getPlayer(data);
        let castle = getCastle(data);
        if (castle === undefined) {
            castle = "城堡";
        }
        page.publishMessageBoard(player + "进入了" + castle);
    };
    handlers[_message_castle_entry] = function (data) {
        const player = getPlayer(data);
        let castle = getCastle(data);
        if (castle === undefined) {
            castle = "城堡";
        }
        page.publishMessageBoard(player + "来到" + castle + "入口");
    };
    handlers[_message_castle_leave] = function (data) {
        const player = getPlayer(data);
        let castle = getCastle(data);
        if (castle === undefined) {
            castle = "城堡";
        }
        page.publishMessageBoard(player + "已经离开了" + castle);
    };
    handlers[_message_castle_target] = function (data) {
        const player = getPlayer(data);
        const castle = getCastle(data);
        page.publishMessageBoard(player + "设定移动目标为" + castle);
    };
    handlers[_message_castle_withdraw] = function (data) {
        const player = getPlayer(data);
        const amount = getProperty(data, "amount");
        if (amount !== undefined && amount > 0) {
            page.publishMessageBoard(player + "从城堡提款机提取了" + amount + "万现金");
        }
    };
    // ------------------------------------------------------------------------
    // MOVE related message handlers
    // ------------------------------------------------------------------------
    handlers[_message_move] = function (data) {
        const player = getPlayer(data);
        const direction = data["direction"];
        const distance = data["distance"];
        const coordinate = data["coordinate"];
        page.publishMessageBoard(player + direction + "移动" + distance + "格，到达" + coordinate.longText());
    };
    handlers[_message_move_await] = function (data) {
        const player = getPlayer(data);
        const timeout = getProperty(data, "timeout");
        if (timeout === undefined) {
            page.publishMessageBoard(player + "等待移动冷却中......");
        } else {
            page.publishMessageBoard(player + "等待移动冷却中......(约" + timeout + "秒)");
        }
    };
    handlers[_message_move_mode] = function (data) {
        const player = getPlayer(data);
        const mode = getProperty(data, "mode");
        page.publishMessageBoard(player + "确定移动模式" + mode);
    };
    handlers[_message_move_scope] = function (data) {
        const player = getPlayer(data);
        const scope = getProperty(data, "scope");
        page.publishMessageBoard(player + "确定移动范围" + scope);
    };
    handlers[_message_move_source] = function (data) {
        const player = getPlayer(data);
        const source = getProperty(data, "source");
        if (source !== undefined) {
            page.publishMessageBoard(player + "当前的坐标" + source.longText());
        }
    }
    handlers[_message_move_destination] = function (data) {
        const player = getPlayer(data);
        const destination = getProperty(data, "destination");
        if (destination !== undefined) {
            page.publishMessageBoard(player + "目的地坐标" + destination.longText());
        }
    }
    handlers[_message_move_path] = function (data) {
        const pathList = getProperty(data, "pathList");
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
    // ------------------------------------------------------------------------
    // TREASURE related message handlers
    // ------------------------------------------------------------------------
    handlers[_message_treasure_stay_put] = function (data) {
        const player = getPlayer(data);
        writeMessageBoard("兔子骷髅对" + player + "说：运气真好，原地可以继续探险");
    };
    handlers[_message_treasure_await] = function (data) {
        const player = getPlayer(data);
        const timeout = getProperty(data, "timeout");
        if (timeout === undefined) {
            page.publishMessageBoard(player + "等待探险冷却中......");
        } else {
            page.publishMessageBoard(player + "等待探险冷却中......(约" + timeout + "秒)");
        }
    };
    handlers[_message_treasure_path] = function (data) {
        const pathList = getProperty(data, "pathList");
        if (pathList !== undefined && pathList.length !== 0) {
            let msg = "探险顺序：";
            for (let i = 0; i < pathList.length; i++) {
                const it = pathList[i];
                msg += it.longText();
                if (i !== pathList.length - 1) {
                    msg += "=>";
                }
            }
            writeMessageBoard(msg);
        }
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
