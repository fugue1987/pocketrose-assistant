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
import * as pokemon from "./pokemon/pokemon";
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
