/**
 * ============================================================================
 * [ 通 用 页 面 模 块 ]
 * ============================================================================
 */

import * as util from "./common_util";
import * as constant from "./common_pocket";
import {_old_loadNPC} from "./common_pocket";
import {getTownsAsList} from "../pocket/pocket_town";

/**
 * Generate Credential object from current HTML form.
 * @returns {Credential}
 */
export function generateCredential() {
    let id = $("input:hidden[name='id']:first").attr("value");
    let pass = $("input:hidden[name='pass']:first").attr("value");
    return new util.Credential(id, pass);
}

/**
 * 获取当前页面的HTML代码
 * @returns {*|jQuery}
 */
export function currentPageHTML() {
    return $("body:first").html();
}

/**
 * 查找指定页面的第一个用户头像HTML代码，如果没有找到就返回undefined
 * @param html 入股undefined则使用当前页面
 * @returns {undefined|string}
 */
export function findFirstUserImageHTML(html) {
    if (html === undefined) {
        html = currentPageHTML();
    }
    let userImage = "";
    $(html).find("img").each(function (_idx, img) {
        if (userImage === "") {
            const src = $(img).attr("src");
            if (src.startsWith(constant.DOMAIN + "/image/head/")) {
                // 发现了用户头像
                userImage = src;
            }
        }
    });
    if (userImage === "") {
        return undefined;
    } else {
        return "<img src='" + userImage + "' width='64' height='64' id='userImage' alt=''>";
    }
}

export function generateProgressBarHTML(ratio) {
    if (ratio === 0) {
        return "<img src='" + constant.DOMAIN + "/image/bg/bar2.gif'  height='7' width='50' alt=''>";
    }
    if (ratio === 1) {
        return "<img src='" + constant.DOMAIN + "/image/bg/bar1.gif'  height='7' width='50' alt=''>";
    }
    const w1 = Math.min(49, Math.ceil(50 * ratio));
    const w2 = 50 - w1;
    return "<img src='" + constant.DOMAIN + "/image/bg/bar1.gif'  height='7' width='" + w1 + "' alt=''>" +
        "<img src='" + constant.DOMAIN + "/image/bg/bar2.gif'  height='7' width='" + w2 + "' alt=''>";
}

export function isColorBlue(id) {
    const color = $("#" + id).css("color");
    return color.toString() === "rgb(0, 0, 255)"
}

export function isColorGrey(id) {
    const color = $("#" + id).css("color");
    return color.toString() === "rgb(128, 128, 128)"
}

export function removeGoogleAnalyticsScript() {
    // 删除最后一个google-analytics的脚本
    $("script:last").remove();
}

export function removeUnusedHyperLinks() {
    $("div:last").find("a:first").attr("href", "javascript:void(0)");
    $("div:last").find("a:eq(1)").attr("href", "javascript:void(0)");
    $("div:last").find("a").attr("tabIndex", "-1");
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

    const townList = getTownsAsList();
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

export function generateTownSelectionTableStyleB() {
    let html = "";
    // html += "<table style='background-color:#888888;border-width:0;width:100%'>";
    // html += "<tbody style='background-color:#F8F0E0'>";
    // html += "<tr><td>";
    html += "<table style='background-color:#888888;width:100%'><tbody style='background-color:#F8F0E0'>";
    html += "<tr>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "</tr>";


    const townList = getTownsAsList();
    for (let i = 0; i < 7; i++) {
        const row = [];
        row.push(townList[i * 4]);
        row.push(townList[i * 4 + 1]);
        row.push(townList[i * 4 + 2]);
        row.push(townList[i * 4 + 3]);

        html += "<tr>";
        for (let j = 0; j < row.length; j++) {
            const town = row[j];
            html += "<td style='background-color:#E8E8D0'><input type='radio' class='townClass' name='townId' value='" + town.id + "'></td>";
            html += "<td style='background-color:#EFE0C0'>" + town.name + "</td>";
            html += "<td style='background-color:#E0D0B0'>" + town.coordinate.x + "</td>";
            html += "<td style='background-color:#E0D0B0'>" + town.coordinate.y + "</td>";
        }
        html += "</tr>";
    }

    html += "</tbody></table>";
    // html += "</td></tr>";
    // html += "</tbody>";
    // html += "</table>";
    html += "<br>";

    return html;
}

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
export function _old_createFooterNPC(name) {
    const npc = _old_loadNPC(name);
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