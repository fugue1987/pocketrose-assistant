/**
 * ============================================================================
 * [ 页 面 相 关 功 能 ]
 * ============================================================================
 */

import {loadNPC} from "./npc";

export class NPC {

    #messageId;

    constructor(messageId) {
        this.#messageId = messageId;
    }

    welcome(message) {
        $("#" + this.#messageId).html(message);
    }

    message(message) {
        let html = $("#" + this.#messageId).html();
        html += message;
        $("#" + this.#messageId).html(html);
    }
}

/**
 * 在页面最后一个div元素之前添加指定的NPC
 * @param name NPC名字
 */
export function createFooterNPC(name) {
    const npc = loadNPC(name);
    if (npc === undefined) {
        return undefined;
    }
    $("div:last").prepend("<TABLE WIDTH='100%' bgcolor='#888888'><tbody><tr>" +
        "<TD bgcolor='#F8F0E0' height='5'>" +
        "<table bgcolor='#888888' border='0'><tbody><tr>" +
        "<td bgcolor='#F8F0E0'>" + npc.imageHTML + "</td>" +
        "<td width='100%' bgcolor='#000000' id='footerNPCMessage' style='color: white'>" +
        "</td></tr></tbody></table>" +
        "</TD>" +
        "</tr></tbody></TABLE>");

    return new NPC("footerNPCMessage");
}

// ----------------------------------------------------------------------------
// M E S S A G E   B O A R D
// ----------------------------------------------------------------------------

export function initializeMessageBoard(message) {
    $("#messageBoard").html(message);
}

export function publishMessageBoard(message) {
    let html = $("#messageBoard").html();
    html = html + "<li>" + message + "</li>";
    $("#messageBoard").html(html);
}