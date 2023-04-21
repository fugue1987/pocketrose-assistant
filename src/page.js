/**
 * ============================================================================
 * [ 页 面 相 关 功 能 ]
 * ============================================================================
 */

import {loadNPC} from "./npc";
import * as util from "./util";
import {Credential} from "./util";
import * as pocket from "./pocket";
import {isProhibitSellingItem} from "./pocket";

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

export function createHeaderNPC(name, parentId) {
    const npc = loadNPC(name);
    $("#" + parentId).append($("<TABLE WIDTH='100%' bgcolor='#888888'><tbody><tr>" +
        "<TD bgcolor='#F8F0E0' height='5'>" +
        "<table bgcolor='#888888' border='0'><tbody><tr>" +
        "<td bgcolor='#F8F0E0'>" + npc.imageHTML + "</td>" +
        "<td width='100%' bgcolor='#000000' id='messageBoard' style='color: white'>" +
        "</td></tr></tbody></table>" +
        "</TD>" +
        "</tr></tbody></TABLE>"));
}

export function createMessageBoardWithPictureCode(pictureCode, parentId) {
    const portrait = pocket.DOMAIN + "/image/head/" + pictureCode + ".gif";
    const imageHTML = "<img src='" + portrait + "' width='64' height='64' id='npc_" + pictureCode + "' alt='" + pictureCode + "'>";
    $("#" + parentId).append($("<TABLE WIDTH='100%' bgcolor='#888888'><tbody><tr>" +
        "<TD bgcolor='#F8F0E0' height='5'>" +
        "<table bgcolor='#888888' border='0'><tbody><tr>" +
        "<td bgcolor='#F8F0E0'>" + imageHTML + "</td>" +
        "<td width='100%' bgcolor='#000000' id='messageBoard' style='color: white'>" +
        "</td></tr></tbody></table>" +
        "</TD>" +
        "</tr></tbody></TABLE>"));
}

// ----------------------------------------------------------------------------
// M E S S A G E   B O A R D
// ----------------------------------------------------------------------------

export function resetMessageBoard() {
    if ($("#messageBoard").length > 0) {
        $("#messageBoard").html("");
    }
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

export function generateTownSelectionTable() {
    let html = "";
    html += "<table border='1'><tbody>";
    html += "<thead><tr>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "</tr></thead>";

    const townList = pocket.getTownsAsList();
    for (let i = 0; i < 7; i++) {
        const row = [];
        row.push(townList[i * 4]);
        row.push(townList[i * 4 + 1]);
        row.push(townList[i * 4 + 2]);
        row.push(townList[i * 4 + 3]);

        html += "<tr>";
        for (let j = 0; j < row.length; j++) {
            const town = row[j];
            html += "<td><input type='radio' class='townClass' name='townId' value='" + town.id + "'></td>";
            html += "<td style='color: white'>" + town.name + "</td>";
            html += "<td style='color: white'>" + town.coordinate.x + "</td>";
            html += "<td style='color: white'>" + town.coordinate.y + "</td>";
        }
        html += "</tr>";
    }

    html += "</tbody></table>";
    html += "<br>";

    return html;
}

export function findAndCreateMessageBoard(s) {
    let i = -1;
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text.includes(s)) {
            i = _idx;
        }
    });
    if (i >= 0) {
        $("td:parent").each(function (_idx, td) {
            if (i === _idx) {
                $(td).attr("id", "messageBoard");
                $(td).attr("style", "color:white");
            }
        });
    }
}

export function getRoleName() {
    let name = "";
    $("td:parent").each(function (_idx, td) {
        if ($(td).text() === "姓名") {
            name = $(td).parent().next().find("td:first").text();
        }
    });
    return name;
}

export function getRoleCash() {
    let cash = 0;
    $("td:parent").each(function (_idx, td) {
        if ($(td).text() === "所持金") {
            const text = $(td).next().text();
            cash = parseInt(util.substringBefore(text, " "));
        }
    });
    return cash;
}

export function disableProhibitSellingItems(table) {
    $(table).find("input:radio[name='select']").each(function (idx, radio) {
        const name = $(radio).parent().next().next().text();
        if ($(radio).parent().next().text() === "★") {
            $(radio).prop("disabled", true);
        } else {
            if (isProhibitSellingItem(name)) {
                $(radio).prop("disabled", true);
            }
        }
    });
}
