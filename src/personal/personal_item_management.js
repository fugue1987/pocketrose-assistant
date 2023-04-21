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
    // 在Eden里面添加预制的表单
    $("#Eden").html("" +
        "<form action='' method='post' id='edenForm'>" +
        "        <input type='hidden' name='id' value='" + credential.id + "'>" +
        "        <input type='hidden' name='pass' value='" + credential.pass + "'>" +
        "        <div id='edenFormPayload' style='display:none'></div>" +
        "        <input type='submit' id='edenSubmit'>" +
        "</form>");

    // 将返回按钮调整到页面中间，并且删除不需要的内容
    $("table:first tr:first").next().next().next()
        .html("<td style='background-color:#F8F0E0;text-align:center'>" +
            "    <input type='button' id='returnButton' value='返回上个画面'>" +
            "</td>");
    $("#returnButton").click(function () {
        $("#edenForm").attr("action", "status.cgi");
        $("#edenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#edenSubmit").trigger("click");
    });
    // 删除最后一个google-analytics的脚本
    $("script:last").remove();

    // 渲染页面并且绑定相应的事件处理
    renderPersonalItemManagement(itemList);
}

function renderPersonalItemManagement(itemList) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0'>";
    html += "       <tr>";
    html += "           <th style='background-color:#E8E8D0'>选择</th>";
    html += "           <th style='background-color:#EFE0C0'>装备</th>";
    html += "           <th style='background-color:#E0D0B0'>所持物品</th>";
    html += "           <th style='background-color:#EFE0C0'>种类</th>";
    html += "           <th style='background-color:#E0D0B0'>效果</th>";
    html += "           <th style='background-color:#EFE0C0'>重量</th>";
    html += "           <th style='background-color:#EFE0C0'>耐久</th>";
    html += "           <th style='background-color:#E0D0B0'>职业要求</th>";
    html += "           <th style='background-color:#E0D0B0'>攻击要求</th>";
    html += "           <th style='background-color:#E0D0B0'>防御要求</th>";
    html += "           <th style='background-color:#E0D0B0'>智力要求</th>";
    html += "           <th style='background-color:#E0D0B0'>精神要求</th>";
    html += "           <th style='background-color:#E0D0B0'>速度要求</th>";
    html += "           <th style='background-color:#E0D0B0'>附加威力</th>";
    html += "           <th style='background-color:#E0D0B0'>附加重量</th>";
    html += "           <th style='background-color:#E0D0B0'>附加幸运度</th>";
    html += "           <th style='background-color:#E0D0B0'>经验</th>";
    html += "           <th style='background-color:#EFE0C0'>属性</th>";
    html += "           <th style='background-color:#EFE0C0'>出售</th>";
    html += "       </tr>";
    for (const item of itemList.asList()) {
        if (item.isTreasureBag || item.isGoldenCage) {
            // 百宝袋和黄金笼子不再显示在页面上
            continue;
        }
        html += "<tr>";
        html += "    <td style='background-color:#E8E8D0'>";
        html += "    " + item.checkboxHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.usingHTML;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.nameHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.category;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.power;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.weight;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.endure;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredCareer === "所有职业" ? "-" : item.requiredCareer);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredAttack === 0 ? "-" : item.requiredAttack);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredDefense === 0 ? "-" : item.requiredDefense);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpecialAttack === 0 ? "-" : item.requiredSpecialAttack);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpecialDefense === 0 ? "-" : item.requiredSpecialDefense);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpeed === 0 ? "-" : item.requiredSpeed);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalPower);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalWeight);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalLuck);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.experienceHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + (item.attribute === "无" ? "-" : item.attribute);
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    ";
        html += "    </td>";
        html += "</tr>";
    }
    html += "       <tr>";
    html += "       </tr>";
    html += "       <tr>";
    html += "       </tr>";
    html += "       <tr>";
    html += "       </tr>";
    html += "   </tbody>";
    html += "</table>";

    $("#ItemUI").html(html);
}

