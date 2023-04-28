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
import * as bank from "../pocket/pocket_bank";
import * as item from "../pocket/pocket_equipment";
import * as merchandise from "../pocket/pocket_merchandise";
import * as service from "../pocket/pocket_service";
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
    const discount = doParseDiscount(pageHTML);
    const spaceCount = doParseSpaceCount(pageHTML);

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
    html = "<div id='SpaceCount' style='display:none'>" + spaceCount + "</div>";
    $("#PocketSuperMarket").append($(html));

    html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0'>";
    html += "       <tr>";
    html += "           <td style='background-color:navy;color:yellowgreen;font-size:200%;font-weight:bold' id='PocketSuperMarketTitle'>" +
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
        "<input type='button' id='itemManagementButton' value='装备管理'>" +
        "</td>";
    html += "       </tr>";
    html += "   </tody>";
    html += "</table>";
    $("#PocketSuperMarket").append($(html));

    $("#returnButton").attr("tabIndex", 1);
    $("#returnButton").click(function () {
        $("#EdenForm").attr("action", "status.cgi");
        $("#EdenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#EdenFormSubmit").trigger("click");
    });
    $("#itemManagementButton").click(function () {
        $("#EdenForm").attr("action", "mydata.cgi");
        $("#EdenFormPayload").html("<input type='hidden' name='mode' value='USE_ITEM'><input type='hidden' name='town' value='" + townId + "'>");
        $("#EdenFormSubmit").trigger("click");
    });

    doPaintRoleStatus(userImage, role);
    message.createMessageBoardStyleB(undefined, "messageBoardContainer");
    message.initializeMessageBoard("欢迎光临，超市全新改版重新开业。选购点什么土特产？<br>" +
        "对了，说一声，我们现在这里不再收你那些破烂了，想卖装备啥的自己回去卖。<br>");

    doPaintMerchandiseList(credential, weaponStoreMerchandiseList);

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

function doParseDiscount(pageHTML) {
    const value = $(pageHTML).find("input:hidden[name='val_off']").val();
    if (value === undefined) {
        return 1.0;
    }
    return parseFloat(value);
}

function doParseSpaceCount(pageHTML) {
    const select = $(pageHTML).find("select[name='num']");
    const option = $(select).find("option:last");
    if (option.length === 0) {
        return 0;
    }
    return parseInt($(option).val());
}

function doPaintRoleStatus(userImage, role) {
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
    html += "<td style='background-color:#E8E8D0'>现金</td>";
    html += "<td style='background-color:#E8E8D0'>存款</td>";
    html += "</tr>";
    html += "<tr>";
    html += "<td style='background-color:#E0D0B0'>" + role.name + "</td>";
    html += "<td style='background-color:#EFE0C0;text-align:right'>" + role.level + "</td>";
    html += "<td style='background-color:#E0D0B0'>" + role.attribute + "</td>";
    html += "<td style='background-color:#EFE0C0'>" + role.career + "</td>";
    html += "<td style='background-color:#E8E8D0;text-align:right'><span id='cash_amount'>" + role.cash + "</span> GOLD</td>";
    html += "<td style='background-color:#E8E8D0;text-align:right'><span id='saving_amount'>-</span> GOLD</td>";
    html += "</tr>";
    html += "</tbody>";
    html += "</table>";

    $("#roleStatus").html(html);
}

function doPaintMerchandiseList(credential, weaponStoreMerchandiseList) {
    const request = credential.asRequest();
    request["town"] = $("#TownId").text();
    request["con_str"] = "50";
    request["mode"] = "PRO_SHOP";
    network.sendPostRequest("town.cgi", request, function (html) {
        // 进入了防具屋
        const armorStoreMerchandiseList = merchandise.parseArmorStoreMerchandiseList(html);
        request["mode"] = "ACC_SHOP";
        network.sendPostRequest("town.cgi", request, function (html) {
            // 进入了饰品屋
            const accessoryStoreMerchandiseList = merchandise.parseAccessoryStoreMerchandiseList(html);
            request["mode"] = "ITEM_SHOP";
            network.sendPostRequest("town.cgi", request, function (html) {
                // 进入了物品屋
                const itemStoreMerchandiseList = merchandise.parseItemStoreMerchandiseList(html);
                doPaintFullMerchandiseList(
                    weaponStoreMerchandiseList,
                    armorStoreMerchandiseList,
                    accessoryStoreMerchandiseList,
                    itemStoreMerchandiseList
                );
            });
        });
    });
}

function doPaintFullMerchandiseList(weaponStoreMerchandiseList,
                                    armorStoreMerchandiseList,
                                    accessoryStoreMerchandiseList,
                                    itemStoreMerchandiseList) {
    const normalList = [];
    const specialList = [];

    for (const it of weaponStoreMerchandiseList.asList) {
        if (!it.speciality) {
            normalList.push(it);
        } else {
            specialList.push(it);
        }
    }
    for (const it of armorStoreMerchandiseList.asList) {
        if (!it.speciality) {
            normalList.push(it);
        } else {
            specialList.push(it);
        }
    }
    for (const it of accessoryStoreMerchandiseList.asList) {
        if (!it.speciality) {
            normalList.push(it);
        } else {
            specialList.push(it);
        }
    }
    for (const it of itemStoreMerchandiseList.asList) {
        if (!it.speciality) {
            normalList.push(it);
        } else {
            specialList.push(it);
        }
    }

    const discount = parseFloat($("#Discount").val());
    let html = "";
    html += "<table style='background-color:#888888;border-width:0;width:100%'>";
    html += "<tbody style='background-color:#F8F0E0'>";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>选择</th>";
    html += "<th style='background-color:#E0D0B0'>商品</th>";
    html += "<th style='background-color:#E0D0B0'>种类</th>";
    html += "<th style='background-color:#EFE0C0'>价格</th>";
    html += "<th style='background-color:#E0D0B0'>威力</th>";
    html += "<th style='background-color:#EFE0C0'>重量</th>";
    html += "<th style='background-color:#EFE0C0'>耐久</th>";
    html += "<th style='background-color:#E0D0B0'>属性</th>";
    html += "<th style='background-color:#E0D0B0'>职业</th>";
    html += "<th style='background-color:#E0D0B0'>攻击</th>";
    html += "<th style='background-color:#E0D0B0'>防御</th>";
    html += "<th style='background-color:#E0D0B0'>智力</th>";
    html += "<th style='background-color:#E0D0B0'>精神</th>";
    html += "<th style='background-color:#E0D0B0'>速度</th>";
    html += "<th style='background-color:#EFE0C0'>武器类型</th>";
    html += "<th style='background-color:#EFE0C0'>可镶宝石数</th>";
    html += "</tr>";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0' colspan='16'>=== 普 通 商 品 ===</th>";
    html += "</tr>";
    for (const it of normalList) {
        html += "<tr>";
        html += "<td style='background-color:#E8E8D0'><input type='radio' name='select' value='" + it.id + "'></td>";
        html += "<td style='background-color:#E0D0B0'>" + it.nameHTML + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.categoryHTML + "</td>";
        if (discount > 1) {
            html += "<td style='background-color:#EFE0C0;color:red'>" + it.price + " GOLD</td>";
        } else if (discount < 1) {
            html += "<td style='background-color:#EFE0C0;color:blue'>" + it.price + " GOLD</td>";
        } else {
            html += "<td style='background-color:#EFE0C0'>" + it.price + " GOLD</td>";
        }
        html += "<td style='background-color:#E0D0B0'>" + it.power + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + it.weight + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + (it.endure === 1 ? "-" : it.endure) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.attribute + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredCareer === "所有职业" ? "-" : it.requiredCareer) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredAttack === 0 ? "-" : it.requiredAttack) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredDefense === 0 ? "-" : it.requiredDefense) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpecialAttack === 0 ? "-" : it.requiredSpecialAttack) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpecialDefense === 0 ? "-" : it.requiredSpecialDefense) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpeed === 0 ? "-" : it.requiredSpeed) + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + it.weaponCategory + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + (it.gemCount <= 0 ? "-" : it.gemCount) + "</td>";
        html += "</tr>";
    }
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0' colspan='16'>=== 城 市 特 产 ===</th>";
    html += "</tr>";
    for (const it of specialList) {
        html += "<tr>";
        html += "<td style='background-color:#E8E8D0'><input type='radio' name='select' value='" + it.id + "'></td>";
        html += "<td style='background-color:#E0D0B0'>" + it.nameHTML + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.categoryHTML + "</td>";
        if (discount > 1) {
            html += "<td style='background-color:#EFE0C0;color:red'>" + it.price + " GOLD</td>";
        } else if (discount < 1) {
            html += "<td style='background-color:#EFE0C0;color:blue'>" + it.price + " GOLD</td>";
        } else {
            html += "<td style='background-color:#EFE0C0'>" + it.price + " GOLD</td>";
        }
        html += "<td style='background-color:#E0D0B0'>" + it.power + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + it.weight + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + (it.endure === 1 ? "-" : it.endure) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.attribute + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredCareer === "所有职业" ? "-" : it.requiredCareer) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredAttack === 0 ? "-" : it.requiredAttack) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredDefense === 0 ? "-" : it.requiredDefense) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpecialAttack === 0 ? "-" : it.requiredSpecialAttack) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpecialDefense === 0 ? "-" : it.requiredSpecialDefense) + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + (it.requiredSpeed === 0 ? "-" : it.requiredSpeed) + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + it.weaponCategory + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + (it.gemCount <= 0 ? "-" : it.gemCount) + "</td>";
        html += "</tr>";
    }
    html += "<tr>";
    html += "<td style='background-color:#E8E8D0;text-align:center' colspan='16' id='operationContainer'></td>";
    html += "</tr>";
    html += "</tbody>";
    html += "</table>";

    $("#merchandiseContainer").html(html);

    doRenderBuyOperation();
}

function doRender(personalEquipmentList) {
    let html = "";
    html += "<table style='background-color:#888888;border-width:0;width:100%'>";
    html += "<tbody style='background-color:#F8F0E0'>";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>装备</th>";
    html += "<th style='background-color:#E0D0B0'>名字</th>";
    html += "<th style='background-color:#E0D0B0'>种类</th>";
    html += "<th style='background-color:#EFE0C0'>效果</th>";
    html += "<th style='background-color:#E0D0B0'>重量</th>";
    html += "<th style='background-color:#EFE0C0'>耐久</th>";
    html += "</tr>";
    for (const it of personalEquipmentList.asList()) {
        html += "<tr>";
        html += "<td style='background-color:#E8E8D0;text-align:center'>" + (it.using ? "★" : "") + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.nameHTML + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.category + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + it.power + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + it.weight + "</td>";
        if (it.maxEndure === 1) {
            html += "<td style='background-color:#EFE0C0'>-</td>";
        } else {
            html += "<td style='background-color:#EFE0C0'>" + it.endure + "/" + it.maxEndure + "</td>";
        }
        html += "</tr>";
    }
    html += "<tr>";
    html += "<td style='background-color:#E8E8D0' colspan='6'><b style='color:navy'>剩余空间：</b><b style='color:red'>" + (20 - personalEquipmentList.asList().length) + "</b></td>";
    html += "</tr>";
    html += "</tbody>";
    html += "</table>";

    $("#equipmentContainer").html(html);

    const credential = page.generateCredential();
    bank.getBankAccount(credential)
        .then(account => {
            $("#cash_amount").text(account.cash);
            $("#saving_amount").text(account.saving);
        });
}

function doRenderBuyOperation() {
    let html = "";
    const spaceCount = parseInt($("#SpaceCount").text());
    if (spaceCount > 0) {
        html += "<select name='num'>";
        for (let i = 1; i <= spaceCount; i++) {
            html += "<option value='" + i + "'>" + i + "</option>";
        }
        html += "</select>";
    }
    html += "<input type='button' id='buyButton' class='dynamicButton' value='买入'>";
    $("#operationContainer").html(html);

    if (spaceCount === 0) {
        $("#buyButton").prop("disabled", true);
    }

    __bindBuyButton();
}

function doRefresh(credential) {
    const request = credential.asRequest();
    request["town"] = $("#TownId").text();
    request["con_str"] = "50";
    request["mode"] = "ARM_SHOP";
    network.sendPostRequest("town.cgi", request, function (html) {
        $(".dynamicButton").unbind("click");
        $("#equipmentContainer").html("");
        $("#operationContainer").html("");
        const discount = doParseDiscount(html);
        const spaceCount = doParseSpaceCount(html);
        $("#Discount").text(discount);
        $("#SpaceCount").text(spaceCount);
        const personalEquipmentList = item.parseWeaponStoreItemList(html);
        doRender(personalEquipmentList);
        doRenderBuyOperation();
    });
}

function __bindBuyButton() {
    if ($("#buyButton").prop("disabled")) {
        return;
    }
    $("#buyButton").click(function () {
        const count = parseInt($("select[name='num']").val());
        const select = $("input:radio:checked").val();
        if (select === undefined) {
            message.publishMessageBoard("你没有选择要购买的商品。");
            return;
        }
        let s = $("input:radio:checked").parent().next().next().next().text();
        s = util.substringBefore(s, " GOLD");
        const price = parseInt(s);

        const total = price * count;
        const amount = service.calculateCashDifferenceAmount(0, total);

        const townId = $("#TownId").text();
        const discount = $("#Discount").text();

        const credential = page.generateCredential();
        service.withdrawFromTownBank(credential, amount)
            .then(() => {
                const p1 = util.substringBefore(select, "_");
                const p2 = util.substringAfter(select, "_");
                if (p1 === "WEA") {
                    __buyViaWeaponStore(credential, townId, discount, p2, count);
                } else if (p1 === "ARM") {
                    __buyViaArmorStore(credential, townId, discount, p2, count);
                } else if (p1 === "ACC") {
                    __buyViaAccessoryStore(credential, townId, discount, p2, count);
                } else if (p1 === "ITE") {
                    __buyViaItemStore(credential, townId, discount, p2, count);
                }
            });
    });
}

function __buyViaWeaponStore(credential, townId, discount, select, count) {
    const request = credential.asRequest();
    request["val_off"] = discount;
    request["townid"] = townId;
    request["mode"] = "BUY";
    request["select"] = select;
    request["num"] = count;
    request["mark"] = "0";
    network.sendPostRequest("town.cgi", request, function (html) {
        message.processResponseHTML(html);
        service.depositIntoTownBank(credential, undefined)
            .then(() => {
                doRefresh(credential);
                document.getElementById("PocketSuperMarketTitle").scrollIntoView();
            });
    });
}

function __buyViaArmorStore(credential, townId, discount, select, count) {
    const request = credential.asRequest();
    request["val_off"] = discount;
    request["townid"] = townId;
    request["mode"] = "BUY";
    request["select"] = select;
    request["num"] = count;
    request["mark"] = "1";
    network.sendPostRequest("town.cgi", request, function (html) {
        message.processResponseHTML(html);
        service.depositIntoTownBank(credential, undefined)
            .then(() => {
                doRefresh(credential);
                document.getElementById("PocketSuperMarketTitle").scrollIntoView();
            });
    });
}

function __buyViaAccessoryStore(credential, townId, discount, select, count) {
    const request = credential.asRequest();
    request["val_off"] = discount;
    request["townid"] = townId;
    request["mode"] = "BUY";
    request["select"] = select;
    request["num"] = count;
    request["mark"] = "2";
    network.sendPostRequest("town.cgi", request, function (html) {
        message.processResponseHTML(html);
        service.depositIntoTownBank(credential, undefined)
            .then(() => {
                doRefresh(credential);
                document.getElementById("PocketSuperMarketTitle").scrollIntoView();
            });
    });
}

function __buyViaItemStore(credential, townId, discount, select, count) {
    const request = credential.asRequest();
    request["val_off"] = discount;
    request["townid"] = townId;
    request["mode"] = "BUY";
    request["select"] = select;
    request["num"] = count;
    request["mark"] = "3";
    network.sendPostRequest("town.cgi", request, function (html) {
        message.processResponseHTML(html);
        service.depositIntoTownBank(credential, undefined)
            .then(() => {
                doRefresh(credential);
                document.getElementById("PocketSuperMarketTitle").scrollIntoView();
            });
    });
}