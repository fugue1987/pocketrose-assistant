// ==UserScript==
// @name         pocketrose assistant
// @namespace    https://pocketrose.itsns.net.cn/
// @description  Intercepts and modifies pocketrose CGI requests
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      mit
// @author       xiaohaiz,fugue
// @version      1.6.0.RC4
// @grant        unsafeWindow
// @match        *://pocketrose.itsns.net.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-cookie/3.0.1/js.cookie.min.js
// @run-at       document-start
// @unwrap
// ==/UserScript==

// ============================================================================
// 口 袋 助 手 郑 重 承 诺
// ----------------------------------------------------------------------------
// 所有验证码破解的相关领域都设立为禁区，我们绝对不触碰验证码破解！
// ============================================================================

import * as battle from "./battle";
import * as castle from "./castle";
import * as npc from "./npc";
import * as pocket from "./pocket";
import {_ACCESSORY_DICT, _ARMOR_DICT, _WEAPON_DICT} from "./pocket";
import * as pokemon from "./pokemon/pokemon";
import {
    __cookie_getDepositBattleNumber,
    __cookie_getDepositButtonText,
    __cookie_getEnableBattleAutoScroll,
    __cookie_getEnableBattleForceRecommendation,
    __cookie_getEnableCareerManagementUI,
    __cookie_getEnableNewItemUI,
    __cookie_getEnableNewPetUI,
    __cookie_getEnablePokemonWiki,
    __cookie_getEnableSoldAutoDeposit,
    __cookie_getEnableZodiacFlashBattle,
    __cookie_getEquipmentSet,
    __cookie_getHealthLoseAutoLodgeRatio,
    __cookie_getLodgeButtonText,
    __cookie_getManaLoseAutoLodgePoint,
    __cookie_getRepairButtonText,
    __cookie_getRepairItemThreshold,
    __cookie_getReturnButtonText
} from "./option";
import {TownRequestInterceptor} from "./town";
import {WildRequestInterceptor} from "./wild";
import {PersonalRequestInterceptor} from "./personal/personal";
import * as setup from "./setup/setup";

const CGI_MAPPING = {
    "/battle.cgi": new battle.BattleRequestInterceptor(),
    "/mydata.cgi": new PersonalRequestInterceptor(),
    "/status.cgi": new PersonalRequestInterceptor(),
    "/town.cgi": new TownRequestInterceptor(),
    "/castlestatus.cgi": new castle.CastleRequestInterceptor(),
    "/castle.cgi": new castle.CastleRequestInterceptor(),
    "/map.cgi": new WildRequestInterceptor()
};

$(function () {
    replacePkm('pocketrose')
});

function replacePkm(page) {
    if (location.href.includes(page)) {
        $(document).ready(function () {
            if (setup.isPokemonWikiEnabled()) {
                pokemon.processPokemonWikiReplacement();
            }
            if (location.href.includes("/town.cgi")) {
                postProcessCityRelatedFunctionalities($('html').html());
            }
            if (location.href.includes("/mydata.cgi")) {
                postProcessPersonalStatusRelatedFunctionalities($('html').html());
            }

            // Lookup CGI request interceptor and process the request if found.
            const keywords = Object.keys(CGI_MAPPING);
            for (let i = 0; i < keywords.length; i++) {
                const keyword = keywords[i];
                if (location.href.includes(keyword)) {
                    CGI_MAPPING[keyword].process();
                }
            }
        })
    }
}

// ============================================================================
// 通用辅助功能函数实现
// ============================================================================

/**
 * 在页面的最下方构建一个NPC的消息表格。
 * @param npcName NPC名字，对应字典中的预定义
 * @private
 */
function __page_constructNpcMessageTable(npcName) {
    let NPC = npc.getNPC(npcName);
    let image = "<img src='" + NPC["image"] + "' width='64' height='64' alt='" + npcName + "'>";
    $("div:last").prepend("<TABLE WIDTH='100%' bgcolor='#888888' id='npcMessageTable'><tbody><tr>" +
        "<TD id='npcMessageCell' bgcolor='#F8F0E0' height='5'>" +
        "<table bgcolor='#888888' border='0'><tbody><tr>" +
        "<td bgcolor='#F8F0E0'>" + image + "</td>" +
        "<td width='100%' bgcolor='#000000' id='npcMessage'></td></tr></tbody></table>" +
        "</TD>" +
        "</tr></tbody></TABLE>");
}

/**
 * 向NPC消息表格中添加消息，尾加模式。
 * @param message 消息内容。
 * @private
 */
function __page_writeNpcMessage(message) {
    var formattedMessage = "<font color='#FFFFFF'>" + message + "</font>";
    var currentMessage = $("#npcMessage").html();
    $("#npcMessage").html(currentMessage + formattedMessage);
}

/**
 * 从当前页面读出id
 * @returns string
 * @private
 */
function __page_readIdFromCurrentPage() {
    return $("input[name='id']").first().attr("value");
}

/**
 * 从当前页面读出pass
 * @returns string
 * @private
 */
function __page_readPassFromCurrentPage() {
    return $("input[name='pass']").first().attr("value");
}


function __ajax_checkOwnItems(id, pass, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["mode"] = "USE_ITEM";
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(request),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            callback(id, pass, html);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

function __ajax_openTreasureBag(id, pass, treasureBagIndex, callback) {
    let openTreasureBagRequest = {};
    openTreasureBagRequest["id"] = id;
    openTreasureBagRequest["pass"] = pass;
    openTreasureBagRequest["chara"] = "1";
    openTreasureBagRequest["mode"] = "USE";
    openTreasureBagRequest["item" + treasureBagIndex] = treasureBagIndex;
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(openTreasureBagRequest),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Opening treasure bag was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            callback(id, pass, html);
        })
        .catch((error) => {
            console.error("Error raised when opening treasure bag:", error);
        });
}

// ============================================================================
// 城市点击后续辅助功能
// ============================================================================
function postProcessCityRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("* 宠物图鉴 *") !== -1) {
        // 宠物图鉴
        __town_petMap(htmlText);
    }
}

// 城市 -> 宠物图鉴
function __town_petMap(htmlText) {
    __page_constructNpcMessageTable("七七");
    __page_writeNpcMessage("我打小数学就是体育老师教的，学的特别好。数一数图鉴数量这种事，交给我完全没有问题。");

    var petIdText = "";             // 宠物图鉴编号及数量的文本
    $("td:parent").each(function (_i, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf(pocket.DOMAIN + "/image/386/") != -1) {
            var code = img.attr("alt");
            var count = $(element).next();

            petIdText += code;
            petIdText += "/";
            petIdText += count.text();
            petIdText += "  ";
        }
    });
    if (petIdText != "") {
        __page_writeNpcMessage("<br>" + petIdText);
        __page_writeNpcMessage("<br>要不要现在就去宠物进化退化那里<b><a href='javascript:void(0)' id='petBorn'>看一眼</a></b>？");
        $("#petBorn").click(function () {
            $("input[name='mode']").attr("value", "PETBORN");
            $("form[action='status.cgi']").attr("action", "mydata.cgi");
            $("input[value='返回城市']").trigger("click");
        });
    }
}


// ============================================================================
// 个人状态后续辅助功能
// ============================================================================
function postProcessPersonalStatusRelatedFunctionalities(htmlText) {
    //if (htmlText.indexOf("给其他人发送消息") !== -1) {
    // 复用个人接收的信作为Cookie管理的页面
    //__personalStatus_cookieManagement(htmlText);
    //}
}

function __personalStatus_cookieManagement(htmlText) {
    const originalBodyHtml = $("body:first").html();
    const startLocation = originalBodyHtml.indexOf("<form action=\"status.cgi\" method=\"post\">");
    let reformatBodyHtml = originalBodyHtml.substring(startLocation);
    reformatBodyHtml = "<hr size=0><h2>口袋助手设置<BR></h2><hr size=0><CENTER>" + reformatBodyHtml;
    $("body:first").html(reformatBodyHtml);

    $("input:submit[value='返回城市']").attr("id", "returnButton");
    __page_constructNpcMessageTable("夜九年");
    __page_writeNpcMessage("在这里我来协助各位维护本机（浏览器）的口袋相关设置：&nbsp;" +
        "<a href='javascript:void(0)' id='listAllEquipment' style='color: gold'><b>选择所有装备</b></a>&nbsp;&nbsp;&nbsp;" +
        "<a href='javascript:void(0)' id='listOwnEquipment' style='color: gold'><b>选择自有装备</b></a>" +
        "<br>");

    const id = __page_readIdFromCurrentPage();
    const pass = __page_readPassFromCurrentPage();

    let b1 = __cookie_getEnablePokemonWiki();
    let s1 = "<select name='s1' id='s1'>";
    s1 += "<option class='o1' value='1'>启用</option>";
    s1 += "<option class='o1' value='0'>禁用</option>";
    s1 += "</select>";
    __page_writeNpcMessage("<li>宝可梦百科超链 " + s1 + " <a href='javascript:void(0)' id='a1' style='color: yellow'>设置</a></li>");


    let b2 = __cookie_getEnableSoldAutoDeposit();
    let s2 = "<select name='s2' id='s2'>";
    s2 += "<option class='o2' value='1'>启用</option>";
    s2 += "<option class='o2' value='0'>禁用</option>";
    s2 += "</select>";
    __page_writeNpcMessage("<li>售卖后自动存钱 " + s2 + " <a href='javascript:void(0)' id='a2' style='color: yellow'>设置</a></li>");


    let b3 = __cookie_getHealthLoseAutoLodgeRatio();
    let s3 = "<select name='s3' id='s3'>";
    s3 += "<option class='o3' value='0.1'>10%</option>";
    s3 += "<option class='o3' value='0.2'>20%</option>";
    s3 += "<option class='o3' value='0.3'>30%</option>";
    s3 += "<option class='o3' value='0.4'>40%</option>";
    s3 += "<option class='o3' value='0.5'>50%</option>";
    s3 += "<option class='o3' value='0.6'>60%</option>";
    s3 += "<option class='o3' value='0.7'>70%</option>";
    s3 += "<option class='o3' value='0.8'>80%</option>";
    s3 += "<option class='o3' value='0.9'>90%</option>";
    s3 += "</select>";
    __page_writeNpcMessage("<li>掉血后自动住宿 " + s3 + " <a href='javascript:void(0)' id='a3' style='color: yellow'>设置</a></li>");

    let b10 = __cookie_getManaLoseAutoLodgePoint();
    let s10 = "<select name='s10' id='s10'>";
    s10 += "<option class='o10' value='10'>10PP</option>";
    s10 += "<option class='o10' value='20'>20PP</option>";
    s10 += "<option class='o10' value='50'>50PP</option>";
    s10 += "<option class='o10' value='100'>100PP</option>";
    s10 += "<option class='o10' value='200'>200PP</option>";
    s10 += "<option class='o10' value='500'>500PP</option>";
    s10 += "</select>";
    __page_writeNpcMessage("<li>掉魔后自动住宿 " + s10 + " <a href='javascript:void(0)' id='a10' style='color: yellow'>设置</a></li>");

    let b4 = __cookie_getRepairItemThreshold();
    let s4 = "<select name='s4' id='s4'>";
    s4 += "<option class='o4' value='10'>耐久10</option>";
    s4 += "<option class='o4' value='20'>耐久20</option>";
    s4 += "<option class='o4' value='50'>耐久50</option>";
    s4 += "<option class='o4' value='100'>耐久100</option>";
    s4 += "</select>";
    __page_writeNpcMessage("<li>修理装备耐久限 " + s4 + " <a href='javascript:void(0)' id='a4' style='color: yellow'>设置</a></li>");

    let b5 = __cookie_getDepositBattleNumber();
    let s5 = "<select name='s5' id='s5'>";
    s5 += "<option class='o5' value='0'>每战存钱</option>";
    s5 += "<option class='o5' value='2'>2战一存</option>";
    s5 += "<option class='o5' value='5'>5战一存</option>";
    s5 += "<option class='o5' value='10'>10战一存</option>";
    s5 += "</select>";
    __page_writeNpcMessage("<li>触发存钱的战数 " + s5 + " <a href='javascript:void(0)' id='a5' style='color: yellow'>设置</a></li>");

    let b6 = __cookie_getReturnButtonText();
    let s6 = "<input type='text' class='o6' name='s6' id='s6' size='48' placeholder='" + b6 + "'>";
    __page_writeNpcMessage("<li>战斗返回的台词 " + s6 + " <a href='javascript:void(0)' id='a6' style='color: yellow'>设置</a></li>");

    let b7 = __cookie_getDepositButtonText();
    let s7 = "<input type='text' class='o7' name='s7' id='s7' size='48' placeholder='" + b7 + "'>";
    __page_writeNpcMessage("<li>战斗存钱的台词 " + s7 + " <a href='javascript:void(0)' id='a7' style='color: yellow'>设置</a></li>");

    let b8 = __cookie_getLodgeButtonText();
    let s8 = "<input type='text' class='o8' name='s8' id='s8' size='48' placeholder='" + b8 + "'>";
    __page_writeNpcMessage("<li>战斗住宿的台词 " + s8 + " <a href='javascript:void(0)' id='a8' style='color: yellow'>设置</a></li>");

    let b9 = __cookie_getRepairButtonText();
    let s9 = "<input type='text' class='o9' name='s9' id='s9' size='48' placeholder='" + b9 + "'>";
    __page_writeNpcMessage("<li>战斗修理的台词 " + s9 + " <a href='javascript:void(0)' id='a9' style='color: yellow'>设置</a></li>");

    let b11 = __cookie_getEnableBattleAutoScroll();
    let s11 = "<select name='s11' id='s11'>";
    s11 += "<option class='o11' value='1'>启用</option>";
    s11 += "<option class='o11' value='0'>禁用</option>";
    s11 += "</select>";
    __page_writeNpcMessage("<li>战斗页自动触底 " + s11 + " <a href='javascript:void(0)' id='a11' style='color: yellow'>设置</a></li>");

    let b12 = __cookie_getEnableBattleForceRecommendation();
    let s12 = "<select name='s12' id='s12'>";
    s12 += "<option class='o12' value='1'>启用</option>";
    s12 += "<option class='o12' value='0'>禁用</option>";
    s12 += "</select>";
    __page_writeNpcMessage("<li>战斗后强制推荐 " + s12 + " <a href='javascript:void(0)' id='a12' style='color: yellow'>设置</a></li>");

    let set1 = __cookie_getEquipmentSet("A", id);
    let h1 = "";
    h1 += "<select name='set1_weapon_star' id='set1_weapon_star'>";
    h1 += "<option class='set1_weapon_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_weapon_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_weapon' id='set1_weapon'>";
    h1 += "</select>";
    h1 += "<select name='set1_armor_star' id='set1_armor_star'>";
    h1 += "<option class='set1_armor_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_armor_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_armor' id='set1_armor'>";
    h1 += "</select>";
    h1 += "<select name='set1_accessory_star' id='set1_accessory_star'>";
    h1 += "<option class='set1_accessory_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_accessory_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_accessory' id='set1_accessory'>";
    h1 += "</select>";
    __page_writeNpcMessage("<li>第一类自定套装 " + h1 + " <a href='javascript:void(0)' id='set1' style='color: yellow'>设置</a></li>");

    let set2 = __cookie_getEquipmentSet("B", id);
    let h2 = "";
    h2 += "<select name='set2_weapon_star' id='set2_weapon_star'>";
    h2 += "<option class='set2_weapon_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_weapon_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_weapon' id='set2_weapon'>";
    h2 += "</select>";
    h2 += "<select name='set2_armor_star' id='set2_armor_star'>";
    h2 += "<option class='set2_armor_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_armor_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_armor' id='set2_armor'>";
    h2 += "</select>";
    h2 += "<select name='set2_accessory_star' id='set2_accessory_star'>";
    h2 += "<option class='set2_accessory_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_accessory_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_accessory' id='set2_accessory'>";
    h2 += "</select>";
    __page_writeNpcMessage("<li>第二类自定套装 " + h2 + " <a href='javascript:void(0)' id='set2' style='color: yellow'>设置</a></li>");

    let set3 = __cookie_getEquipmentSet("C", id);
    let h3 = "";
    h3 += "<select name='set3_weapon_star' id='set3_weapon_star'>";
    h3 += "<option class='set3_weapon_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_weapon_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_weapon' id='set3_weapon'>";
    h3 += "</select>";
    h3 += "<select name='set3_armor_star' id='set3_armor_star'>";
    h3 += "<option class='set3_armor_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_armor_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_armor' id='set3_armor'>";
    h3 += "</select>";
    h3 += "<select name='set3_accessory_star' id='set3_accessory_star'>";
    h3 += "<option class='set3_accessory_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_accessory_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_accessory' id='set3_accessory'>";
    h3 += "</select>";
    __page_writeNpcMessage("<li>第三类自定套装 " + h3 + " <a href='javascript:void(0)' id='set3' style='color: yellow'>设置</a></li>");

    let set4 = __cookie_getEquipmentSet("D", id);
    let h4 = "";
    h4 += "<select name='set4_weapon_star' id='set4_weapon_star'>";
    h4 += "<option class='set4_weapon_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_weapon_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_weapon' id='set4_weapon'>";
    h4 += "</select>";
    h4 += "<select name='set4_armor_star' id='set4_armor_star'>";
    h4 += "<option class='set4_armor_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_armor_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_armor' id='set4_armor'>";
    h4 += "</select>";
    h4 += "<select name='set4_accessory_star' id='set4_accessory_star'>";
    h4 += "<option class='set4_accessory_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_accessory_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_accessory' id='set4_accessory'>";
    h4 += "</select>";
    __page_writeNpcMessage("<li>第四类自定套装 " + h4 + " <a href='javascript:void(0)' id='set4' style='color: yellow'>设置</a></li>");

    let set5 = __cookie_getEquipmentSet("E", id);
    let h5 = "";
    h5 += "<select name='set5_weapon_star' id='set5_weapon_star'>";
    h5 += "<option class='set5_weapon_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_weapon_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_weapon' id='set5_weapon'>";
    h5 += "</select>";
    h5 += "<select name='set5_armor_star' id='set5_armor_star'>";
    h5 += "<option class='set5_armor_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_armor_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_armor' id='set5_armor'>";
    h5 += "</select>";
    h5 += "<select name='set5_accessory_star' id='set5_accessory_star'>";
    h5 += "<option class='set5_accessory_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_accessory_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_accessory' id='set5_accessory'>";
    h5 += "</select>";
    __page_writeNpcMessage("<li>第五类自定套装 " + h5 + " <a href='javascript:void(0)' id='set5' style='color: yellow'>设置</a></li>");

    let zodiac = __cookie_getEnableZodiacFlashBattle();
    let zodiacSelect = "<select name='zodiacSelect' id='zodiacSelect'>";
    zodiacSelect += "<option class='zodiacSelect_class' value='1'>启用</option>";
    zodiacSelect += "<option class='zodiacSelect_class' value='0'>禁用</option>";
    zodiacSelect += "</select>";
    __page_writeNpcMessage("<li>十二宫极速战斗 " + zodiacSelect + " <a href='javascript:void(0)' id='zodiac' style='color: yellow'>设置</a></li>");

    let newPetUI = __cookie_getEnableNewPetUI();
    let petUISelect = "<select name='petUISelect' id='petUISelect'>";
    petUISelect += "<option class='petUISelect_class' value='1'>启用</option>";
    petUISelect += "<option class='petUISelect_class' value='0'>禁用</option>";
    petUISelect += "</select>";
    __page_writeNpcMessage("<li>新宠物管理界面 " + petUISelect + " <a href='javascript:void(0)' id='newPetUI' style='color: yellow'>设置</a></li>");

    let newItemUI = __cookie_getEnableNewItemUI();
    let itemUISelect = "<select name='itemUISelect' id='itemUISelect'>";
    itemUISelect += "<option class='itemUISelect_class' value='1'>启用</option>";
    itemUISelect += "<option class='itemUISelect_class' value='0'>禁用</option>";
    itemUISelect += "</select>";
    __page_writeNpcMessage("<li>新装备管理界面 " + itemUISelect + " <a href='javascript:void(0)' id='newItemUI' style='color: yellow'>设置</a></li>");

    let careerManagementUI = __cookie_getEnableCareerManagementUI();
    let careerManagementUISelect = "<select name='careerManagementUISelect' id='careerManagementUISelect'>";
    careerManagementUISelect += "<option class='careerManagementUISelect_class' value='1'>启用</option>";
    careerManagementUISelect += "<option class='careerManagementUISelect_class' value='0'>禁用</option>";
    careerManagementUISelect += "</select>";
    __page_writeNpcMessage("<li>新职业管理界面 " + careerManagementUISelect + " <a href='javascript:void(0)' id='careerManagementUI' style='color: yellow'>设置</a></li>");

    $(".o1[value='" + Number(b1) + "']").prop("selected", true);
    $(".o2[value='" + Number(b2) + "']").prop("selected", true);
    $(".o3[value='" + b3 + "']").prop("selected", true);
    $(".o10[value='" + b10 + "']").prop("selected", true);
    $(".o4[value='" + b4 + "']").prop("selected", true);
    $(".o5[value='" + b5 + "']").prop("selected", true);
    $(".o11[value='" + Number(b11) + "']").prop("selected", true);
    $(".o12[value='" + Number(b12) + "']").prop("selected", true);
    $(".zodiacSelect_class[value='" + Number(zodiac) + "']").prop("selected", true);
    $(".petUISelect_class[value='" + Number(newPetUI) + "']").prop("selected", true);
    $(".itemUISelect_class[value='" + Number(newItemUI) + "']").prop("selected", true);
    $(".careerManagementUISelect_class[value='" + Number(careerManagementUI) + "']").prop("selected", true);

    __generateOwnEquipmentSelectOptions(id, pass);

    $("#listAllEquipment").click(function () {
        __generateAllEquipmentSelectOptions(id);
    });

    $("#listOwnEquipment").click(function () {
        __generateOwnEquipmentSelectOptions(id, pass);
    });

    $("#a1").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_POKEMON_WIKI", $("#s1").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a2").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_SOLD_AUTO_DEPOSIT", $("#s2").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a3").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__HEALTH_LOSE_AUTO_LODGE_RATIO", $("#s3").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a10").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__MANA_LOSE_AUTO_LODGE_POINT", $("#s10").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a4").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD", $("#s4").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a5").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__DEPOSIT_BATTLE_NUMBER", $("#s5").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a6").click(function () {
        let text = $("#s6").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__RETURN_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a7").click(function () {
        let text = $("#s7").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__DEPOSIT_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a8").click(function () {
        let text = $("#s8").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__LODGE_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a9").click(function () {
        let text = $("#s9").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__REPAIR_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a11").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_AUTO_SCROLL", $("#s11").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a12").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_FORCE_RECOMMENDATION", $("#s12").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });

    $("#set1").click(function () {
        let p1 = $("#set1_weapon").val();
        let p2 = $("#set1_weapon_star").val();
        let p3 = $("#set1_armor").val();
        let p4 = $("#set1_armor_star").val();
        let p5 = $("#set1_accessory").val();
        let p6 = $("#set1_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_A_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set2").click(function () {
        let p1 = $("#set2_weapon").val();
        let p2 = $("#set2_weapon_star").val();
        let p3 = $("#set2_armor").val();
        let p4 = $("#set2_armor_star").val();
        let p5 = $("#set2_accessory").val();
        let p6 = $("#set2_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_B_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set3").click(function () {
        let p1 = $("#set3_weapon").val();
        let p2 = $("#set3_weapon_star").val();
        let p3 = $("#set3_armor").val();
        let p4 = $("#set3_armor_star").val();
        let p5 = $("#set3_accessory").val();
        let p6 = $("#set3_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_C_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set4").click(function () {
        let p1 = $("#set4_weapon").val();
        let p2 = $("#set4_weapon_star").val();
        let p3 = $("#set4_armor").val();
        let p4 = $("#set4_armor_star").val();
        let p5 = $("#set4_accessory").val();
        let p6 = $("#set4_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_D_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set5").click(function () {
        let p1 = $("#set5_weapon").val();
        let p2 = $("#set5_weapon_star").val();
        let p3 = $("#set5_armor").val();
        let p4 = $("#set5_armor_star").val();
        let p5 = $("#set5_accessory").val();
        let p6 = $("#set5_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_E_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#zodiac").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_ZODIAC_FLASH_BATTLE", $("#zodiacSelect").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#newPetUI").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_NEW_PET_UI", $("#petUISelect").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#newItemUI").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_NEW_ITEM_UI", $("#itemUISelect").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#careerManagementUI").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_CAREER_MANAGEMENT_UI", $("#careerManagementUISelect").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
}

function __generateAllEquipmentSelectOptions(id) {
    for (let idx = 1; idx <= 5; idx++) {
        let weaponOptions = "<option class='set" + idx + "_weapon_class' value='NONE'>★ 选择武器 ★</option>";
        for (let i = 0; i < _WEAPON_DICT.length; i++) {
            const weapon = _WEAPON_DICT[i];
            weaponOptions += "<option class='set" + idx + "_weapon_class' value='" + weapon + "'>" + weapon + "</option>";
        }
        $("#set" + idx + "_weapon").html(weaponOptions);

        let armorOptions = "<option class='set" + idx + "_armor_class' value='NONE'>★ 选择防具 ★</option>";
        for (let i = 0; i < _ARMOR_DICT.length; i++) {
            const armor = _ARMOR_DICT[i];
            armorOptions += "<option class='set" + idx + "_armor_class' value='" + armor + "'>" + armor + "</option>";
        }
        $("#set" + idx + "_armor").html(armorOptions);

        let accessoryOptions = "<option class='set" + idx + "_accessory_class' value='NONE'>★ 选择饰品 ★</option>";
        for (let i = 0; i < _ACCESSORY_DICT.length; i++) {
            const accessory = _ACCESSORY_DICT[i];
            accessoryOptions += "<option class='set" + idx + "_accessory_class' value='" + accessory + "'>" + accessory + "</option>";
        }
        $("#set" + idx + "_accessory").html(accessoryOptions);
    }

    for (let idx = 1; idx <= 5; idx++) {
        let no = "";
        if (idx === 1) {
            no = "A";
        } else if (idx === 2) {
            no = "B";
        } else if (idx === 3) {
            no = "C";
        } else if (idx === 4) {
            no = "D";
        } else {
            no = "E";
        }
        const set = __cookie_getEquipmentSet(no, id);

        $(".set" + idx + "_weapon_star_class[value='" + set[1] + "']").prop("selected", true);
        $(".set" + idx + "_weapon_class[value='" + set[0] + "']").prop("selected", true);
        $(".set" + idx + "_armor_star_class[value='" + set[3] + "']").prop("selected", true);
        $(".set" + idx + "_armor_class[value='" + set[2] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_star_class[value='" + set[5] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_class[value='" + set[4] + "']").prop("selected", true);
    }
}

function __generateOwnEquipmentSelectOptions(id, pass) {
    const ownWeapons = {};
    const ownArmors = {};
    const ownAccessories = {};
    __ajax_checkOwnItems(id, pass, function (id, pass, html) {
        let bagIndex = -1;
        $(html).find("input:checkbox").each(function (_idx, checkbox) {
            const name = $(checkbox).parent().next().next().text();
            const category = $(checkbox).parent().next().next().next().text();
            let nameForUse = name;
            if (nameForUse.indexOf("齐心★") !== -1) {
                nameForUse = nameForUse.substring(3);
            }
            if (category === "武器") {
                ownWeapons[nameForUse] = true;
            }
            if (category === "防具") {
                ownArmors[nameForUse] = true;
            }
            if (category === "饰品") {
                ownAccessories[nameForUse] = true;
            }
            if (category === "物品" && name === "百宝袋") {
                bagIndex = $(checkbox).val();
            }
        });

        if (bagIndex >= 0) {
            __ajax_openTreasureBag(id, pass, bagIndex, function (id, pass, html) {
                $(html).find("input:checkbox").each(function (_idx, checkbox) {
                    const name = $(checkbox).parent().next().text();
                    const category = $(checkbox).parent().next().next().text();
                    let nameForUse = name;
                    if (nameForUse.indexOf("齐心★") !== -1) {
                        nameForUse = nameForUse.substring(3);
                    }
                    if (category === "武器") {
                        ownWeapons[nameForUse] = true;
                    }
                    if (category === "防具") {
                        ownArmors[nameForUse] = true;
                    }
                    if (category === "饰品") {
                        ownAccessories[nameForUse] = true;
                    }
                    __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories);
                });
            });
        } else {
            __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories);
        }
    });
}

function __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories) {
    for (let idx = 1; idx <= 5; idx++) {
        let weaponOptions = "<option class='set" + idx + "_weapon_class' value='NONE'>★ 选择武器 ★</option>";
        for (let i = 0; i < _WEAPON_DICT.length; i++) {
            const weapon = _WEAPON_DICT[i];
            if (ownWeapons[weapon] !== undefined) {
                weaponOptions += "<option class='set" + idx + "_weapon_class' value='" + weapon + "'>" + weapon + "</option>";
            }
        }
        $("#set" + idx + "_weapon").html(weaponOptions);

        let armorOptions = "<option class='set" + idx + "_armor_class' value='NONE'>★ 选择防具 ★</option>";
        for (let i = 0; i < _ARMOR_DICT.length; i++) {
            const armor = _ARMOR_DICT[i];
            if (ownArmors[armor] !== undefined) {
                armorOptions += "<option class='set" + idx + "_armor_class' value='" + armor + "'>" + armor + "</option>";
            }
        }
        $("#set" + idx + "_armor").html(armorOptions);

        let accessoryOptions = "<option class='set" + idx + "_accessory_class' value='NONE'>★ 选择饰品 ★</option>";
        for (let i = 0; i < _ACCESSORY_DICT.length; i++) {
            const accessory = _ACCESSORY_DICT[i];
            if (ownAccessories[accessory] !== undefined) {
                accessoryOptions += "<option class='set" + idx + "_accessory_class' value='" + accessory + "'>" + accessory + "</option>";
            }
        }
        $("#set" + idx + "_accessory").html(accessoryOptions);
    }

    for (let idx = 1; idx <= 5; idx++) {
        let no = "";
        if (idx === 1) {
            no = "A";
        } else if (idx === 2) {
            no = "B";
        } else if (idx === 3) {
            no = "C";
        } else if (idx === 4) {
            no = "D";
        } else {
            no = "E";
        }
        const set = __cookie_getEquipmentSet(no, id);

        $(".set" + idx + "_weapon_star_class[value='" + set[1] + "']").prop("selected", true);
        $(".set" + idx + "_weapon_class[value='" + set[0] + "']").prop("selected", true);
        $(".set" + idx + "_armor_star_class[value='" + set[3] + "']").prop("selected", true);
        $(".set" + idx + "_armor_class[value='" + set[2] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_star_class[value='" + set[5] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_class[value='" + set[4] + "']").prop("selected", true);
    }
}
