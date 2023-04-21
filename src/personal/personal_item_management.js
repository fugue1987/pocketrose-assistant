/**
 * ============================================================================
 * [ 装 备 管 理 模 块 ]
 * ============================================================================
 */

import * as message from "../common/commons_message";
import * as page from "../common/common_page";
import * as item from "../pocket/pocket_item";

export function processPersonalItemManagement() {
    doProcessPersonalItemManagement();
}

function doProcessPersonalItemManagement() {
    const credential = page.generateCredential();
    const pageHTML = page.currentPageHTML();
    // 首先从老页面上解析所有的装备信息
    const itemList = item.parsePersonalItemList(pageHTML);
    // 获取旧页面上的玩家头像HTML代码
    const userImageHTML = page.findFirstUserImageHTML(pageHTML);
    // 创建消息面板
    $("table:first").removeAttr("height");
    $("table:first td:first").css("text-align", "center");
    $("table:first td:first").css("font-size", "150%");
    $("table:first td:first").css("font-weight", "700");
    $("table:first td:first").css("color", "navy");
    $("table:first td:first").html("＜＜　装 备 管 理 (v2.0)　＞＞");
    $("table:first tr:first").after($("<tr><td style='background-color:#E8E8D0' id='messageBoardContainer'></td></tr>"));
    message.createMessageBoard(userImageHTML, "messageBoardContainer");
    // 删除旧的页面组件，并且预留新的刷新的位置
    // 预留了两个div，ItemUI用于页面刷新，Eden隐藏用于放置表单以便可以转移到其他的页面
    $("table:first tr:first").next().next()
        .html("<td style='background-color:#F8F0E0'>" +
            "<div id='ItemUI'></div><div id='Eden' style='display:none'></div>" +
            "</td>");
    // 将返回按钮调整到页面中间，并且删除不需要的内容
    $("table:first tr:first").next().next().next()
        .html("<td style='background-color:#F8F0E0;text-align:center'>" +
            "    <form action='status.cgi' method='post'>" +
            "        <input type='hidden' name='id' value='" + credential.id + "'>" +
            "        <input type='hidden' name='pass' value='" + credential.pass + "'>" +
            "        <input type='hidden' name='mode' value='STATUS'>" +
            "        <input type='submit' id='returnButton' value='返回上个画面'>" +
            "    </form>" +
            "</td>");
    // 删除最后一个google-analytics的脚本
    $("script:last").remove();
}

