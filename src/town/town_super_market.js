/**
 * ============================================================================
 * [ 城 市 超 市 模 块 ]
 * ----------------------------------------------------------------------------
 * 基于之前的武器屋页面，综合了武器屋、防具屋、饰品屋和物品屋。
 * ============================================================================
 */

import * as message from "../common/common_message";
import * as network from "../common/common_network";
import * as page from "../common/common_page";
import * as util from "../common/common_util";
import * as item from "../pocket/pocket_item";
import * as merchandise from "../pocket/pocket_merchandise";
import * as user from "../pocket/pocket_user";

export class TownSuperMarket {
    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    // 先保存页面上的需要信息
    const pageHTML = page.currentPageHTML();
    const userImage = page.findFirstUserImageHTML(pageHTML);
    const role = doParseRole();
    const personalEquipmentList = item.parseWeaponStoreItemList(pageHTML);
    const weaponStoreMerchandiseList = merchandise.parseWeaponStoreMerchandiseList(pageHTML);
    const credential = page.generateCredential();
    const townId = doParseTownId();
    const discount = doParseDiscount();

    // 删除整个旧的页面
    $("table:first").remove();

    // 顶部元素
    $("body:first").prepend($("<div id='PocketSuperMarket'></div>"));

    // 开始绘制新的页面
    let html = "";
    html += "<div id='Eden' style='display:none'>";
    html += "    <form action='' method='post' id='EdenForm'>";
    html += "        <input type='hidden' name='id' value='" + credential.id + "'>";
    html += "        <input type='hidden' name='pass' value='" + credential.pass + "'>";
    html += "        <div style='display:none' id='EdenFormPayload'></div>";
    html += "        <input type='submit' id='EdenFormSubmit'>";
    html += "    </form>";
    html += "</div>";
    $("#PocketSuperMarket").append($(html));

    html = "<div id='TownId' style='display:none'>" + townId + "</div>";
    $("#PocketSuperMarket").append($(html));
    html = "<div id='Discount' style='display:none'>" + discount + "</div>";
    $("#PocketSuperMarket").append($(html));

    html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0'>";
    html += "       <tr>";
    html += "           <td style='background-color:navy;color:yellowgreen;font-size:200%;font-weight:bold'>" +
        "＜＜ 口 袋 超 市 ＞＞" +
        "</td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='roleStatusContainer'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='equipmentContainer'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='messageBoardContainer'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='merchandiseContainer'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td style='text-align:center'>" +
        "<input type='button' id='returnButton' value='返回城市'>" +
        "</td>";
    html += "       </tr>";
    html += "   </tody>";
    html += "</table>";
    $("#PocketSuperMarket").append($(html));

    $("#returnButton").click(function () {
        $("#EdenForm").attr("action", "status.cgi");
        $("#EdenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#EdenFormSubmit").trigger("click");
    });

    doGenerateRoleTable(userImage, role);
    message.createMessageBoardStyleB(undefined, "messageBoardContainer");
    message.initializeMessageBoard("欢迎光临，超市全新改版重新开业。选购点什么土特产？");

    doRender(personalEquipmentList);
}

function doParseRole() {
    const role = new user.PocketRole();
    const table = $("td:contains('所持金')")
        .filter(function () {
            return $(this).text() === "所持金";
        })
        .closest("table");
    role.name = $(table).find("tr:eq(1) td:first").text();
    role.level = parseInt($(table).find("tr:eq(1) td:eq(1)").text());
    role.attribute = $(table).find("tr:eq(1) td:eq(2)").text();
    role.career = $(table).find("tr:eq(1) td:eq(3)").text();
    let s = $(table).find("tr:eq(2) td:eq(1)").text();
    s = util.substringBefore(s, " GOLD");
    role.cash = parseInt(s);
    return role;
}

function doParseTownId() {
    return $("input:hidden[name='townid']").val();
}

function doParseDiscount() {
    const value = $("input:hidden[name='val_off']").val();
    if (value === undefined) {
        return 1.0;
    }
    return parseFloat(value);
}

function doGenerateRoleTable(userImage, role) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%'>";
    html += "<tbody>";
    html += "<tr>";
    html += "<td style='background-color:#F8F0E0'>" + userImage + "</td>";
    html += "<td style='background-color:#EFE0C0;width:100%' id='roleStatus'></td>";
    html += "</tr>";
    html += "</tbody>";
    html += "</table>"
    $("#roleStatusContainer").html(html);

    html = "";
    html += "<table style='background-color:#888888;border-width:0'>";
    html += "<tbody>";
    html += "<tr>";
    html += "<td style='background-color:#E0D0B0'>姓名</td>";
    html += "<td style='background-color:#EFE0C0'>ＬＶ</td>";
    html += "<td style='background-color:#E0D0B0'>属性</td>";
    html += "<td style='background-color:#EFE0C0'>职业</td>";
    html += "<td style='background-color:#E8E8D0'>所持金</td>";
    html += "</tr>";
    html += "<tr>";
    html += "<td style='background-color:#E0D0B0'>" + role.name + "</td>";
    html += "<td style='background-color:#EFE0C0;text-align:right'>" + role.level + "</td>";
    html += "<td style='background-color:#E0D0B0'>" + role.attribute + "</td>";
    html += "<td style='background-color:#EFE0C0'>" + role.career + "</td>";
    html += "<td style='background-color:#E8E8D0;text-align:right'><span id='roleCash'>" + role.cash + "</span> GOLD</td>";
    html += "</tr>";
    html += "</tbody>";
    html += "</table>";

    $("#roleStatus").html(html);
}

function doRender(personalEquipmentList) {

}

function doRefresh(credential) {
    const request = credential.asRequest();
    request["town"] = $("#TownId").text();
    request["con_str"] = "50";
    request["mode"] = "ARM_SHOP";
    network.sendPostRequest("town.cgi", request, function (html) {
        $("#equipmentContainer").html("");
        const personalEquipmentList = item.parseWeaponStoreItemList(html);
        doRender(personalEquipmentList);
    });
}