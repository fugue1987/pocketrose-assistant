import * as page from "./page";

export const EVENT_CHECK_MOVE_STYLE = "EVENT_CHECK_MOVE_STYLE";
export const EVENT_ENTER_TOWN_AWAIT = "EVENT_ENTER_TOWN_AWAIT";
export const EVENT_ENTER_TOWN_GUARD = "EVENT_ENTER_TOWN_GUARD";
export const EVENT_ENTER_TOWN_GUARD_PASS = "EVENT_ENTER_TOWN_GUARD_PASS";
export const EVENT_LEAVE_CASTLE = "EVENT_LEAVE_CASTLE";
export const EVENT_LEAVE_TOWN = "EVENT_LEAVE_TOWN";

export function createEventHandler(role) {
    return function (id, data) {
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
