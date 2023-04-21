/**
 * ============================================================================
 * [ 通 用 页 面 模 块 ]
 * ============================================================================
 */

import * as constant from "./common_constant";

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
        return "<img src='' width='64' height='64' id='userImage' alt=''>";
    }
}