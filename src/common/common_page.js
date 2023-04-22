/**
 * ============================================================================
 * [ 通 用 页 面 模 块 ]
 * ============================================================================
 */

import * as util from "../util";
import * as constant from "./common_constant";

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