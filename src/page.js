/**
 * ============================================================================
 * [ 页 面 相 关 功 能 ]
 * ============================================================================
 */

import {loadNPC} from "./npc";
import {Credential} from "./common/common_util";

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


export function initializeMessageBoard(message) {
    if ($("#messageBoard").length > 0) {
        $("#messageBoard").html(message);
    }
}

export function publishMessageBoard(message) {
    if ($("#messageBoard").length > 0) {
        let html = $("#messageBoard").html();
        const now = new Date();
        const timeHtml = "<font color='#adff2f'>(" + now.toLocaleString() + ")</font>";
        html = html + "<li>" + timeHtml + " " + message + "</li>";
        $("#messageBoard").html(html);
    }
}

/**
 * Generate Credential object from current HTML form.
 * @returns {Credential}
 */
export function generateCredential() {
    let id = $("input:hidden[name='id']:first").attr("value");
    let pass = $("input:hidden[name='pass']:first").attr("value");
    return new Credential(id, pass);
}

