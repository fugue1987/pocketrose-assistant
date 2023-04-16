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
import {
    __utilities_checkIfEquipmentFullExperience,
    _ACCESSORY_DICT,
    _ARMOR_DICT,
    _CAREER_DICT,
    _CITY_DICT,
    _PROHIBIT_SELLING_ITEM_DICT,
    _WEAPON_DICT,
    isUnavailableTreasureHintMap,
    transferCareerRequirementDict
} from "./pocket";
import * as pokemon from "./pokemon";
import * as util from "./util";
import * as finance from "./bank";
import {
    __cookie_getDepositBattleNumber,
    __cookie_getDepositButtonText,
    __cookie_getEnableBattleAutoScroll,
    __cookie_getEnableBattleForceRecommendation,
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
import {StatusRequestInterceptor} from "./status";
import {generateCredential} from "./page";

const CGI_MAPPING = {
    "/battle.cgi": new battle.BattleRequestInterceptor(),
    "/mydata.cgi": new StatusRequestInterceptor(),
    "/status.cgi": new StatusRequestInterceptor(),
    "/town.cgi": new TownRequestInterceptor(),
    "/castlestatus.cgi": new castle.CastleRequestInterceptor(),
    "/castle.cgi": new castle.CastleRequestInterceptor()
};

$(function () {
    replacePkm('pocketrose')
});

function replacePkm(page) {
    if (location.href.includes(page)) {
        $(document).ready(function () {
            if (__cookie_getEnablePokemonWiki()) {
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
// 工具功能函数实现
// ============================================================================

// ============================================================================
// 通用辅助功能函数实现
// ============================================================================

function __lookupTownIdByName(townName) {
    let cityIds = Object.keys(_CITY_DICT);
    for (let i = 0; i < cityIds.length; i++) {
        let id = cityIds[i];
        let city = _CITY_DICT[id];
        let cityName = city["name"];
        if (townName.indexOf(cityName) !== -1) {
            return id;
        }
    }
    // 人在野外的情况
    return "-1";
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

function convertEncodingToUtf8(response, fromEncoding) {
    const decoder = new TextDecoder(fromEncoding);
    const uint8Array = new Uint8Array(response.length);

    for (let i = 0; i < response.length; i++) {
        uint8Array[i] = response.charCodeAt(i);
    }

    return decoder.decode(uint8Array);
}


function readCastleInformation(id, pass, callback) {
    fetch("castle_print.cgi", {
        method: "GET"
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

            const castles = {};
            $(html).find("td").each(function (_idx, td) {
                const tdText = $(td).text();
                if (tdText.endsWith(" (自购)")) {
                    const castleName = $(td).prev().text();
                    const castleOwner = tdText.substring(0, tdText.indexOf(" (自购)"));
                    const castleLocationText = $(td).next().text();
                    const coordinate = castleLocationText.substring(1, castleLocationText.length - 1).split(",");
                    const castleLocation = [parseInt(coordinate[0]), parseInt(coordinate[1])];
                    castles[castleOwner] = {
                        "name": castleName,
                        "owner": castleOwner,
                        "coordinate": castleLocation
                    };
                }
            });
            callback({"id": id, "pass": pass, "html": html}, castles);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

/**
 * 异步读取并解析个人状态中的基础信息，完成后回调传入的函数。
 * @param id ID
 * @param pass PASSWORD
 * @param callback 回调函数
 * @private
 * @deprecated
 */
function __ajax_readPersonalInformation(id, pass, callback) {
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({id: id, pass: pass, mode: "STATUS_PRINT"}),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Posting STATUS_PRINT was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));

            let statusTable = $(html).find('table').first().find('table').first();
            let levelText = $(statusTable.find('td')[1]).text();
            let level = "";
            for (let i = 0; i < levelText.length; i++) {
                if (levelText[i] >= '0' && levelText[i] <= '9') {
                    level += levelText[i];
                }
            }
            let healthText = $(statusTable.find('td')[5]).text();
            let manaText = $(statusTable.find('td')[7]).text();
            let currentHealth = util.substringBeforeSlash(healthText);
            let maxHealth = util.substringAfterSlash(healthText);
            let currentMana = util.substringBeforeSlash(manaText);
            let maxMana = util.substringAfterSlash(manaText);
            let att = $(statusTable.find('td')[13]).text();
            let def = $(statusTable.find('td')[15]).text();
            let int = $(statusTable.find('td')[17]).text();
            let spi = $(statusTable.find('td')[19]).text();
            let spe = $(statusTable.find('td')[21]).text();
            let town = $(statusTable.find('td')[31]).text();
            let townId = __lookupTownIdByName(town);
            let exp = $(statusTable.find('td')[58]).text();
            let goldText = $(statusTable.find('td')[60]).text();
            let gold = goldText.substring(0, goldText.indexOf(" G"));

            // 寻找仙人的宝物那一栏的数据
            let faeryTreasureCount = 0;
            $(html).find("td:parent").each(function (_idx, td) {
                const text = $(td).text();
                if (text.startsWith("仙人的宝物：")) {
                    let faeryTreasureText;
                    if (text.endsWith(" ")) {
                        faeryTreasureText = text.substring(6, text.length - 1);
                    } else {
                        faeryTreasureText = text.substring(6);
                    }
                    faeryTreasureCount = faeryTreasureText.split(" ").length;
                }
            });

            let data = {
                "id": id, "pass": pass,
                "LV": level,
                "HP": currentHealth, "MAX_HP": maxHealth, "MP": currentMana, "MAX_MP": maxMana,
                "AT": att, "DF": def, "SA": int, "SD": spi, "SP": spe,
                "TOWN": town, "TOWN_ID": townId,
                "EXP": exp, "GOLD": gold,
                "FTC": faeryTreasureCount
            };
            callback(data);
        })
        .catch((error) => {
            console.error("Error raised when posting STATUS_PRINT:", error);
        });
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

/**
 * 在客栈住宿恢复
 * @param id ID
 * @param pass PASS
 * @param callback 回调函数，参数{id:x,pass:x}
 * @private
 */
function __ajax_lodgeAtInn(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "town.cgi",
        data: {id: id, pass: pass, mode: "RECOVERY"},
        success: function (html) {
            let data = {id: id, pass: pass};
            callback(data);
        }
    });
}

/**
 * 存储所有的现金到银行
 * @param id ID
 * @param pass PASS
 * @param callback 回调函数，参数{id:x,pass:x}
 * @private
 * @deprecated
 */
function __ajax_depositAllGolds(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "town.cgi",
        data: {id: id, pass: pass, mode: "BANK_SELL", azukeru: "all"},
        success: function (html) {
            let data = {id: id, pass: pass};
            callback(data);
        }
    });
}

/**
 * 从银行取钱
 * @param id ID
 * @param pass PASS
 * @param amount 单位是万
 * @param callback 回调
 * @private
 * @deprecated
 */
function __ajax_withdrawGolds(id, pass, amount, callback) {
    if (amount <= 0) {
        let data = {id: id, pass: pass};
        callback(data);
    } else {
        $.ajax({
            type: "POST",
            url: "town.cgi",
            data: {id: id, pass: pass, mode: "BANK_BUY", dasu: amount},
            success: function (html) {
                let data = {id: id, pass: pass};
                callback(data);
            }
        });
    }
}

function __common_item_selectBag(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "百宝袋") {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectCage(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "黄金笼子") {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectAllGems(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name.indexOf("宝石") != -1) {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectAllStorableItems(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "百宝袋") {
            $(inputElement).prop('checked', false);
        } else if (category == "物品" && name == "黄金笼子") {
            $(inputElement).prop('checked', false);
        } else if ($(inputElement).attr('disabled') != undefined) {
            // 无法放入袋子的物品，忽略
        } else {
            var using = $(inputTableCell).next().text();
            if (using == "★") {
                $(inputElement).prop('checked', false);
            } else {
                $(inputElement).prop('checked', true);
                checkedCount++;
            }
        }
    });
    return checkedCount;
}


// ============================================================================
// 城市点击后续辅助功能
// ============================================================================
function postProcessCityRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("* 宠物图鉴 *") !== -1) {
        // 宠物图鉴
        __town_petMap(htmlText);
    }
    if (htmlText.indexOf("* 宠 物 赠 送 屋 *") !== -1) {
        __town_houseForSendingPets(htmlText);
    }
    // if (htmlText.indexOf("＜＜　□　<B>武器屋</B>　□　＞＞") !== -1 ||
    //     htmlText.indexOf("＜＜　□　<b>武器屋</b>　□　＞＞") !== -1) {
    //     __town_weaponStore(htmlText);
    // }
    // if (htmlText.indexOf("＜＜　□　<B>防具屋</B>　□　＞＞") !== -1 ||
    //     htmlText.indexOf("＜＜　□　<b>防具屋</b>　□　＞＞") !== -1) {
    //     __town_armorStore(htmlText);
    // }
    // if (htmlText.indexOf("＜＜　□　<B>饰品屋</B>　□　＞＞") !== -1 ||
    //     htmlText.indexOf("＜＜　□　<b>饰品屋</b>　□　＞＞") !== -1) {
    //     __town_accessoryStore(htmlText);
    // }
    // if (htmlText.indexOf("＜＜　□　<B>物品屋</B>　□　＞＞") !== -1 ||
    //     htmlText.indexOf("＜＜　□　<b>物品屋</b>　□　＞＞") !== -1) {
    //     __town_itemStore(htmlText);
    // }
    if (htmlText.indexOf(" Gold卖出。") !== -1) {
        // 物品卖出完成
        //__city_itemSold(htmlText);
    }
    if (htmlText.indexOf("*  藏宝图以旧换新业务 *") !== -1) {
        //enhanceTownAdventurerGuild(htmlText);
    }
}

function __update_travel_message_board(message) {
    const messageBoard = $("#messageBoard").html();
    const now = new Date();
    $("#messageBoard").html(messageBoard + "<li>(" + now.toLocaleString() + ") " + message + "</li>");
}

function moveToTown(id, pass, player, sourceTownId, destinationTownId) {
    leaveTown(id, pass, player, sourceTownId, function (data) {
        const sourceLocation = data["location"];
        const moveScope = data["moveScope"];
        const moveMode = data["moveMode"];
        const destinationTown = _CITY_DICT[destinationTownId];
        const destinationLocation = [parseInt(destinationTown["x"]), parseInt(destinationTown["y"])];

        moveFromTo(id, pass, player, sourceLocation, destinationLocation, moveScope, moveMode, function (data) {
            // 到达目的地了，准备执行进城操作
            __update_travel_message_board(player + "准备进城，等待行动冷却中...... (约55秒)");
            setTimeout(function () {
                enterTown(id, pass, destinationTownId, function (data) {
                    const html = data["html"];
                    if ($(html).text().indexOf("战胜门卫。") !== -1) {
                        // 到达了其他国家的城市，并且没有仙人宝物。。无法直接进入，选择交钱吧。。打打杀杀挺不好的
                        __update_travel_message_board("与门卫交涉中......");
                        const request = {};
                        request["id"] = id;
                        request["pass"] = pass;
                        request["townid"] = destinationTownId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        $.post("status.cgi", request, function (html) {
                            __update_travel_message_board("门卫通情达理的收取了合理的入城税。");
                            __ajax_depositAllGolds(id, pass, function () {
                                __update_travel_message_board("我们贴心为您把剩余的现金存入了银行。");
                                $("#returnButton").prop("disabled", false);
                                $("#returnButton").attr("value", destinationTown["name"] + "欢迎您的到来");
                                __update_travel_message_board(player + "成功到达" + destinationTown["name"] + "。");
                                __update_travel_message_board("期待下次旅途与您再见。");
                            });
                        });
                    } else {
                        __ajax_depositAllGolds(id, pass, function () {
                            __update_travel_message_board("我们贴心为您把剩余的现金存入了银行。");
                            $("#returnButton").prop("disabled", false);
                            $("#returnButton").attr("value", destinationTown["name"] + "欢迎您的到来");
                            __update_travel_message_board(player + "成功到达" + destinationTown["name"] + "。");
                            __update_travel_message_board("期待下次旅途与您再见。");
                        });
                    }
                });
            }, 55000);
        });
    });
}

function moveFromTo(id, pass, player, from, to, scope, mode, callback) {
    const pathList = __travel_calculate_path_locations(from, to, scope, mode);
    moveThePathList(id, pass, player, pathList, 0, callback);
}

function moveThePathList(id, pass, player, pathList, index, callback) {
    __update_travel_message_board(player + "等待行动冷却中...... (约55秒)");
    setTimeout(function () {
        const from = pathList[index];
        const to = pathList[index + 1];

        const x1 = from[0];
        const y1 = from[1];
        const x2 = to[0];
        const y2 = to[1];

        let direction;
        if (x1 === x2) {
            // 上或者下
            if (y2 > y1) {
                direction = ["%u2191", "↑"];
            } else {
                direction = ["%u2193", "↓"];
            }
        } else if (y1 === y2) {
            // 左或者右
            if (x2 > x1) {
                direction = ["%u2192", "→"];
            } else {
                direction = ["%u2190", "←"];
            }
        } else {
            // 4种斜向移动
            if (x2 > x1 && y2 > y1) {
                direction = ["%u2197", "↗"];
            }
            if (x2 > x1 && y2 < y1) {
                direction = ["%u2198", "↘"];
            }
            if (x2 < x1 && y2 > y1) {
                direction = ["%u2196", "↖"];
            }
            if (x2 < x1 && y2 < y1) {
                direction = ["%u2199", "↙"];
            }
        }

        const distance = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
        __update_travel_message_board("准备" + direction[1] + "移动" + distance + "格。");

        const request = {};
        request["id"] = id;
        request["pass"] = pass;
        request["con"] = "2";
        request["navi"] = "on";
        request["mode"] = "CHARA_MOVE";
        request["direct"] = direction[0];
        request["chara_m"] = distance;
        $.post("map.cgi", request, function (html) {
            const nextIndex = index + 1;
            if (nextIndex === pathList.length - 1) {
                __update_travel_message_board(player + "到达目的地(" + to[0] + "," + to[1] + ")。");
                callback({"id": id, "pass": pass, "player": player, "html": html});
            } else {
                __update_travel_message_board(player + "到达坐标(" + to[0] + "," + to[1] + ")。");
                moveThePathList(id, pass, player, pathList, nextIndex, callback);
            }
        });

    }, 55000);
}

function enterTown(id, pass, townId, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["townid"] = townId;
    request["mode"] = "MOVE";
    fetch("status.cgi", {
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
            const data = {};
            data["id"] = id;
            data["pass"] = pass;
            data["townId"] = townId;
            data["html"] = html;
            callback(data);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

/**
 * 出城，离开当前所在的城市。
 * @param id ID
 * @param pass PASS
 @param player PLAYER NAME
 * @param townId TOWN ID
 * @param callback 后续动作
 */
function leaveTown(id, pass, player, townId, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["navi"] = "on";
    request["out"] = "1";
    request["mode"] = "MAP_MOVE";
    fetch("map.cgi", {
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

            const moveScope = $(html).find("select[name='chara_m']").find("option:last").attr("value");
            let moveMode = "ROOK";
            $(html).find("input:submit").each(function (_idx, input) {
                const v = $(input).attr("value");
                const d = $(input).attr("disabled");
                if (v === "↖" && d === undefined) {
                    moveMode = "QUEEN";
                }
            });

            const town = _CITY_DICT[townId];
            __update_travel_message_board(player + "已经离开了" + town["name"] + "。");
            __update_travel_message_board(player + "已经确认最大行动力" + moveScope + "，行动采用" + moveMode + "模式。");

            const data = {};
            data["id"] = id;
            data["pass"] = pass;
            data["html"] = html;
            data["player"] = player;
            data["townId"] = townId;
            data["location"] = [town["x"], town["y"]];
            data["moveScope"] = moveScope;
            data["moveMode"] = moveMode;

            callback(data);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

function __travel_calculate_path_locations(sourceLocation, destinationLocation, moveScope, moveMode) {
    const nodeList = [];

    if (sourceLocation[0] === destinationLocation[0] && sourceLocation[1] === destinationLocation[1]) {
        nodeList.push(sourceLocation);
        return nodeList;
    }

    const milestone = __travel_lookup_milestone_node(sourceLocation, destinationLocation, moveMode);
    if (milestone !== undefined) {
        const p1 = __travel_move_from_to(sourceLocation, milestone, moveScope);
        const p2 = __travel_move_from_to(milestone, destinationLocation, moveScope);
        nodeList.push(...p1);
        nodeList.push(...p2);
        nodeList.push(destinationLocation);
    } else {
        const p = __travel_move_from_to(sourceLocation, destinationLocation, moveScope);
        nodeList.push(...p);
        nodeList.push(destinationLocation);
    }

    __update_travel_message_board("旅途路径已经计算完毕，总共需要次移动" + (nodeList.length - 1) + "次。");

    let msg = "旅途路径规划：";
    for (let i = 0; i < nodeList.length; i++) {
        let node = nodeList[i];
        msg += "(" + node[0] + "," + node[1] + ")";
        if (i !== nodeList.length - 1) {
            msg += " -> ";
        }
    }
    __update_travel_message_board(msg);

    return nodeList;
}

/**
 * 根据移动模式寻找两个坐标之间的里程碑坐标，返回undefined表示源和目的地在一条线上
 * @param from 源坐标
 * @param to 目的坐标
 * @param moveMode 移动模式，ROOK或者QUEEN
 * @returns {number[]|undefined|*[]}
 * @private
 */
function __travel_lookup_milestone_node(from, to, moveMode) {
    if (moveMode === "ROOK") {
        if (from[0] === to[0] || from[1] === to[1]) {
            return undefined;
        }
        return [from[0], to[1]];
    }
    if (moveMode === "QUEEN") {
        if (from[0] === to[0] || from[1] === to[1]) {
            return undefined;
        }
        const xDelta = Math.abs(from[0] - to[0]);
        const yDelta = Math.abs(from[1] - to[1]);
        if (xDelta === yDelta) {
            return undefined;
        }
        const delta = Math.min(xDelta, yDelta);
        let x = from[0];
        let y = from[1];
        if (to[0] > from[0]) {
            x = x + delta;
        } else {
            x = x - delta;
        }
        if (to[1] > from[1]) {
            y = y + delta;
        } else {
            y = y - delta;
        }
        return [x, y];
    }
    return undefined;
}

/**
 * 根据移动范围计算两个坐标之间的移动节点，已经确保两个坐标在同一条线上
 * @param from 源坐标
 * @param to 目的坐标
 * @param moveScope 移动范围
 * @returns {*[]} [from, ..., to)
 * @private
 */
function __travel_move_from_to(from, to, moveScope) {
    const nodeList = [];
    nodeList.push(from);
    if (from[0] === to[0]) {
        // 一条竖线上
        const step = Math.ceil(Math.abs(from[1] - to[1]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            if (to[1] > from[1]) {
                nodeList.push([from[0], from[1] + (i * moveScope)]);
            } else {
                nodeList.push([from[0], from[1] - (i * moveScope)]);
            }
        }
    } else if (from[1] === to[1]) {
        // 一条横线上
        const step = Math.ceil(Math.abs(from[0] - to[0]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            if (to[0] > from[0]) {
                nodeList.push([from[0] + (i * moveScope), from[1]]);
            } else {
                nodeList.push([from[0] - (i * moveScope), from[1]]);
            }
        }
    } else {
        // 一条斜线上
        const step = Math.ceil(Math.abs(from[0] - to[0]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            let x = from[0];
            if (to[0] > from[0]) {
                x = x + (i * moveScope);
            } else {
                x = x - (i * moveScope);
            }
            let y = from[1];
            if (to[1] > from[1]) {
                y = y + (i * moveScope);
            } else {
                y = y - (i * moveScope);
            }
            nodeList.push([x, y]);
        }
    }
    return nodeList;
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

/**
 * 城市送宠屋增强实现。
 * @param htmlText HTML文本
 * @private
 */
function __town_houseForSendingPets(htmlText) {
    __page_constructNpcMessageTable("末末");
    __page_writeNpcMessage("哈哈，我又来啦！没想到吧？这边还是我。");

    $("input[value='发送']").attr("id", "sendPetSubmit");

    let gold = 0;
    $("td:parent").each(function (_idx, td) {
        if ($(td).text() === "所持金") {
            let goldText = $(td).next().text();
            gold = goldText.substring(0, goldText.indexOf(" "));
        }
    });

    if (gold < 100000) {
        let delta = Math.ceil((100000 - gold) / 10000);
        let message = "差" + delta + "万，老规矩，还是<a href='javascript:void(0)' id='safeSendPet'><b>取钱发送</b></a>？";
        __page_writeNpcMessage(message);

        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        $("#safeSendPet").click(function () {
            __ajax_withdrawGolds(id, pass, delta, function (data) {
                $("#sendPetSubmit").trigger("click");
            });
        });
    }
}


/**
 * 物品屋：增强实现。
 * @param htmlText HTML
 * @private
 */
function __town_itemStore(htmlText) {
    __page_constructNpcMessageTable("青鸟");
    __town_common_disableProhibitSellingItems($("table")[3]);
    $("input:submit[value='买入']").attr("id", "buyButton");

    // 检查是否身上还有富裕的购物空间？
    if ($("select[name='num']").find("option:first").length === 0) {
        $("#buyButton").prop("disabled", true);
        __page_writeNpcMessage("咱们就是说买东西之前至少身上腾点空间出来。");
        return;
    }

    // 获取当前身上现金的数量
    let cash = 0;
    $("td:parent").each(function (idx, td) {
        if ($(td).text() === "所持金") {
            let cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_writeNpcMessage("为了回馈新老客户，本店特推出直接通过<b><a href='javascript:void(0)' id='bankBuy'>银行转账购买</a></b>的方式。");
    $("#bankBuy").click(function () {
        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        __town_common_prepareForShopping(id, pass, cash, $("table")[5], $("#buyButton"));
    });
}

/**
 * 正在装备中和禁售名单上的物品不再提供选择。
 * @param table 身上物品所在表格的DOM
 * @private
 */
function __town_common_disableProhibitSellingItems(table) {
    $(table).find("input:radio[name='select']").each(function (idx, radio) {
        let name = $(radio).parent().next().next().text();
        if ($(radio).parent().next().text() === "★") {
            // 已经装备上的禁止售卖
            $(radio).prop("disabled", true);
        } else {
            for (let i = 0; i < _PROHIBIT_SELLING_ITEM_DICT.length; i++) {
                if (name === _PROHIBIT_SELLING_ITEM_DICT[i]) {
                    // 禁售名单里面
                    $(radio).prop("disabled", true);
                }
            }
        }
    });
}

function __town_common_prepareForShopping(id, pass, cash, table, submit) {
    let name = "";
    let price = 0;
    $(table).find("input:radio[name='select']").each(function (idx, radio) {
        if ($(radio).prop("checked")) {
            name = $(radio).parent().next().text();
            let priceText = $(radio).parent().next().next().text();
            price = priceText.substring(0, priceText.indexOf(" "));
        }
    });
    if (name !== "") {
        let count = 0;
        $("select[name='num']").find("option").each(function (idx, option) {
            if ($(option).prop("selected")) {
                count = $(option).val();
            }
        });

        let totalPrice = price * count;
        if (totalPrice > 0) {
            totalPrice = Math.max(10000, totalPrice);   // 如果总价不到1万，按照1万来计算
        }
        const amount = finance.calculateCashDifferenceAmount(cash, totalPrice);
        if (amount === 0) {
            $(submit).trigger("click");
        } else {
            const credential = generateCredential();
            finance.withdrawFromTownBank(credential, amount).then(() => {
                $(submit).trigger("click");
            });
        }
    }
}

/**
 * 卖出物品后，自动存入银行
 */
function __city_itemSold(htmlText) {
    __page_constructNpcMessageTable("青鸟");

    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();

    // 获取到卖出的金钱数
    var messageElement = $('h2:first');
    var price = messageElement.find('b:first').text();

    let returnMessage = "";
    returnMessage += "另外，要不要我带你回";
    returnMessage += "<b><a href='javascript:void(0)' id='returnARM'>武器屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnPRO'>防具屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnACC'>饰品屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnITM'>物品屋</a></b>？";

    if (price < 10000) {
        // 卖的钱太少了，不值得为你做点啥
        var lowPriceMessage = "虫吃鼠咬,光板没毛,破面烂袄一件儿~";
        __page_writeNpcMessage(lowPriceMessage);
        __page_writeNpcMessage(returnMessage);
        __city_itemSold_buildReturnFunction(id, pass);
    } else if (!__cookie_getEnableSoldAutoDeposit()) {
        // 卖的钱倒是够了，奈何自动存钱功能被禁用了
        var noDepositMessage = "破家值万贯，能换多少算多少吧！";
        __page_writeNpcMessage(noDepositMessage);
        __page_writeNpcMessage(returnMessage);
        __city_itemSold_buildReturnFunction(id, pass);
    } else {
        const credential = generateCredential();
        finance.depositIntoTownBank(credential, undefined).then(() => {
            let messageHtml = messageElement.html() + "已经自动存入银行。";
            messageElement.html(messageHtml);
            let autoDepositMessage = "呦嚯嚯。。这个全口袋也只有我能收下！钱已经存到银行了，我是雷锋。";
            __page_writeNpcMessage(autoDepositMessage);
            __page_writeNpcMessage(returnMessage);
            __city_itemSold_buildReturnFunction(credential.id, credential.pass);
        });
    }
}

function __city_itemSold_buildReturnFunction(id, pass) {
    $("#returnARM").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ARM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回武器屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnPRO").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "PRO_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回防具屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnACC").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ACC_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回饰品屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnITM").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ITEM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回物品屋");
            $("input[type='submit']").trigger("click");
        });
    });
}

// ============================================================================
// 个人状态后续辅助功能
// ============================================================================
function postProcessPersonalStatusRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("给其他人发送消息") !== -1) {
        // 复用个人接收的信作为Cookie管理的页面
        __personalStatus_cookieManagement(htmlText);
    }
    if (htmlText.indexOf("物品使用．装备") != -1) {
        __personalStatus_equipment(htmlText);
    }
    if (htmlText.indexOf("* 转职神殿 *") != -1) {
        __personalStatus_transferCareer(htmlText);
    }
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

    $(".o1[value='" + Number(b1) + "']").prop("selected", true);
    $(".o2[value='" + Number(b2) + "']").prop("selected", true);
    $(".o3[value='" + b3 + "']").prop("selected", true);
    $(".o10[value='" + b10 + "']").prop("selected", true);
    $(".o4[value='" + b4 + "']").prop("selected", true);
    $(".o5[value='" + b5 + "']").prop("selected", true);
    $(".o11[value='" + Number(b11) + "']").prop("selected", true);
    $(".o12[value='" + Number(b12) + "']").prop("selected", true);
    $(".zodiacSelect_class[value='" + Number(zodiac) + "']").prop("selected", true);

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

// 个人状态 -> 物品使用．装备
function __personalStatus_equipment(htmlText) {
    __page_constructNpcMessageTable("妮可");
    __page_writeNpcMessage("快捷简单的操作谁又会不喜欢呢？");

    $("input:submit[value='返回上个画面']").attr("id", "returnButton");
    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();

    let cash = 0;
    $("td:parent").each(function (_i, e) {
        if ($(e).text() === "所持金") {
            let cashText = $(e).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
            $(e).parent().parent().append("<tr><td colspan='6' bgcolor='#E8E8D0' id='extMenuLocation'></td></tr>");
        }
    });

    let treasureBagIndex = -1;
    let goldenCageIndex = -1;
    $("input[type='checkbox']").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        if (category === "物品") {
            if (name === "百宝袋") {
                treasureBagIndex = $(checkbox).val();
            }
            if (name === "黄金笼子") {
                goldenCageIndex = $(checkbox).val();
            }
        }
    });

    let extMenu = "";
    extMenu += "<li><a href='javascript:void(0)' id='goIntoBag'>进入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='goIntoCage'>进入黄金笼子</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllGemsIntoBag'>所有的宝石放入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllItemsIntoBag'>所有非必要装备/物品放入百宝袋</a></li>"
    $("#extMenuLocation").html(extMenu);

    let treasureMapLocatedAtCity = [];
    $("input[type='checkbox']").each(function (_idx, inputElement) {
        let inputTableCell = $(inputElement).parent();
        let name = $(inputTableCell).next().next().text();
        let category = $(inputTableCell).next().next().next().text();
        if (category === "武器" || category === "防具" || category === "饰品") {
            // 计算装备满级所需要的最高经验
            let power = $(inputTableCell).next().next().next().next().text();
            let currentExp = $(inputTableCell).next().next().next().next()
                .next().next().next().next()
                .next().next().next().next()
                .next().next().next().next().text();

            if (__utilities_checkIfEquipmentFullExperience(name, power, currentExp)) {
                let nameHtml = $(inputTableCell).next().next().html();
                nameHtml = "<font color='red'><b>[满]</b></font>" + nameHtml;
                $(inputTableCell).next().next().html(nameHtml);
            }
        }
        if (category === "物品" && name.indexOf("藏宝图") !== -1) {
            // Process 藏宝图 related enhancement.
            let x = $(inputTableCell).next().next().next().next().text();
            let y = $(inputTableCell).next().next().next().next().next().text();
            if (isUnavailableTreasureHintMap(parseInt(x), parseInt(y))) {
                let nameHtml = $(inputTableCell).next().next().html();
                nameHtml = "<font color='red'><b>[城]</b></font>" + nameHtml;
                $(inputTableCell).next().next().html(nameHtml);
                treasureMapLocatedAtCity.push([$(inputElement).attr("name"), $(inputElement).val()]);
            }
        }
    });

    $("#goIntoBag").click(function () {
        if (__common_item_selectBag($("html")) > 0) {
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#goIntoCage").click(function () {
        if (__common_item_selectCage($("html")) > 0) {
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#putAllGemsIntoBag").click(function () {
        if (__common_item_selectAllGems($("html")) > 0) {
            $("option[value='USE']").prop("selected", false);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", true);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#putAllItemsIntoBag").click(function () {
        if (__common_item_selectAllStorableItems($("html")) > 0) {
            $("option[value='USE']").prop("selected", false);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", true);
            $("input[value='确定']").trigger("click");
        }
    });

    if (treasureMapLocatedAtCity.length > 0) {
        __page_writeNpcMessage("<li><a href='javascript:void(0)' id='exchangeTreasureMaps' style='color:yellow'><b>一键更换所有的城市藏宝图</b></a></li>");
    }
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='unloadAllEquipments' style='color:yellow'><b>一键卸下所有装备</b></a>" +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareChocolateSet' style='color:yellow'><b>一键准备巧克力套装</b></a>   " +
        "<a href='javascript:void(0)' id='useChocolateSet' style='color:yellow'><b>一键装备巧克力套装</b></a>" +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetA' style='color:yellow'><b>一键准备套装A</b></a>   " +
        "<a href='javascript:void(0)' id='useSetA' style='color:yellow'><b>一键装备套装A</b></a>   " +
        ____format_set_text("A", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetB' style='color:yellow'><b>一键准备套装B</b></a>   " +
        "<a href='javascript:void(0)' id='useSetB' style='color:yellow'><b>一键装备套装B</b></a>   " +
        ____format_set_text("B", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetC' style='color:yellow'><b>一键准备套装C</b></a>   " +
        "<a href='javascript:void(0)' id='useSetC' style='color:yellow'><b>一键装备套装C</b></a>   " +
        ____format_set_text("C", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetD' style='color:yellow'><b>一键准备套装D</b></a>   " +
        "<a href='javascript:void(0)' id='useSetD' style='color:yellow'><b>一键装备套装D</b></a>   " +
        ____format_set_text("D", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetE' style='color:yellow'><b>一键准备套装E</b></a>   " +
        "<a href='javascript:void(0)' id='useSetE' style='color:yellow'><b>一键装备套装E</b></a>   " +
        ____format_set_text("E", id) +
        "</li>");

    if (treasureMapLocatedAtCity.length > 0) {
        $("#exchangeTreasureMaps").click(function () {
            let amount = 0;
            if (cash < 100000) {
                amount = Math.ceil((100000 - cash) / 10000);
            }
            __ajax_withdrawGolds(id, pass, amount, function (data) {
                let request = {};
                request["id"] = data["id"];
                request["pass"] = data["pass"];
                request["mode"] = "CHANGEMAP2";
                for (let i = 0; i < treasureMapLocatedAtCity.length; i++) {
                    request[treasureMapLocatedAtCity[i][0]] = treasureMapLocatedAtCity[i][1];
                }
                $.post("town.cgi", request, function (html) {
                    $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                    $("form[action='status.cgi']").attr("action", "mydata.cgi");
                    $("#returnButton").trigger("click");
                });
            });
        });
    }
    // 一键卸下所有装备
    $("#unloadAllEquipments").click(function () {
        let candidates = [];
        $("input[type='checkbox']").each(function (_idx, checkbox) {
            let using = $(checkbox).parent().next().text();
            if (using === "★") {
                $(checkbox).prop("checked", true);
                candidates.push([$(checkbox).attr("name"), $(checkbox).val()]);
            } else {
                $(checkbox).prop("checked", false);
            }
        });
        if (candidates.length > 0) {
            let request = {};
            request["id"] = id;
            request["pass"] = pass;
            request["mode"] = "USE";
            request["chara"] = "1";
            for (let i = 0; i < candidates.length; i++) {
                request[candidates[i][0]] = candidates[i][1];
            }
            $.post("mydata.cgi", request, function (html) {
                $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                $("form[action='status.cgi']").attr("action", "mydata.cgi");
                $("#returnButton").trigger("click");
            });
        }
    });
    $("#prepareChocolateSet").click(function () {
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            "2015.02.14情人节巧克力", false,
            "2015.01.29十周年纪念", false,
            "2015.02.14情人节玫瑰", false);
    });
    $("#useChocolateSet").click(function () {
        ____use_equipment_set(id, pass,
            "2015.02.14情人节巧克力", false,
            "2015.01.29十周年纪念", false,
            "2015.02.14情人节玫瑰", false);
    });
    $("#prepareSetA").click(function () {
        let set = __cookie_getEquipmentSet("A", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetA").click(function () {
        let set = __cookie_getEquipmentSet("A", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetB").click(function () {
        let set = __cookie_getEquipmentSet("B", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetB").click(function () {
        let set = __cookie_getEquipmentSet("B", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetC").click(function () {
        let set = __cookie_getEquipmentSet("C", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetC").click(function () {
        let set = __cookie_getEquipmentSet("C", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetD").click(function () {
        let set = __cookie_getEquipmentSet("D", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetD").click(function () {
        let set = __cookie_getEquipmentSet("D", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetE").click(function () {
        let set = __cookie_getEquipmentSet("E", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetE").click(function () {
        let set = __cookie_getEquipmentSet("E", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
}

function ____format_set_text(no, id) {
    let set = __cookie_getEquipmentSet(no, id);
    let text = "";
    if (set[0] === "NONE") {
        text += "无";
    } else {
        if (set[1] !== "0") {
            text += "齐心★";
        }
        text += set[0];
    }
    text += "/";
    if (set[2] === "NONE") {
        text += "无";
    } else {
        if (set[3] !== "0") {
            text += "齐心★";
        }
        text += set[2];
    }
    text += "/";
    if (set[4] === "NONE") {
        text += "无";
    } else {
        if (set[5] !== "0") {
            text += "齐心★";
        }
        text += set[4];
    }
    return "[" + text + "]";
}

function __personalStatus_equipment_prepareItems(id, pass, treasureBagIndex,
                                                 weaponName, weaponStar,
                                                 armorName, armorStar,
                                                 accessoryName, accessoryStar) {
    let weaponNameForUse = weaponName;
    if (weaponStar) {
        weaponNameForUse = "齐心★" + weaponNameForUse;
    }
    let armorNameForUse = armorName;
    if (armorStar) {
        armorNameForUse = "齐心★" + armorNameForUse;
    }
    let accessoryNameForUse = accessoryName;
    if (accessoryStar) {
        accessoryNameForUse = "齐心★" + accessoryNameForUse;
    }

    let weaponFound = false;
    let armorFound = false;
    let accessoryFound = false;
    $("input:checkbox").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        if (category === "武器" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
            weaponFound = true;
        }
        if (category === "防具" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
            armorFound = true;
        }
        if (category === "饰品" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
            accessoryFound = true;
        }
    });
    if ((!weaponFound || !armorFound || !accessoryFound) && treasureBagIndex >= 0) {
        __ajax_openTreasureBag(id, pass, treasureBagIndex, function (id, pass, html) {
            let weaponIndex = -1;
            let armorIndex = -1;
            let accessoryIndex = -1;
            $(html).find("input:checkbox").each(function (_idx, checkbox) {
                let name = $(checkbox).parent().next().text();
                let category = $(checkbox).parent().next().next().text();
                if (!weaponFound && category === "武器" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
                    weaponIndex = $(checkbox).val();
                    weaponFound = true;
                }
                if (!armorFound && category === "防具" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
                    armorIndex = $(checkbox).val();
                    armorFound = true;
                }
                if (!accessoryFound && category === "饰品" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
                    accessoryIndex = $(checkbox).val();
                    accessoryFound = true;
                }
            });
            if (weaponIndex >= 0 || armorIndex >= 0 || accessoryIndex >= 0) {
                let takeFromBagRequest = {};
                takeFromBagRequest["id"] = id;
                takeFromBagRequest["pass"] = pass;
                takeFromBagRequest["mode"] = "GETOUTBAG";
                if (weaponIndex >= 0) {
                    takeFromBagRequest["item" + weaponIndex] = weaponIndex;
                }
                if (armorIndex >= 0) {
                    takeFromBagRequest["item" + armorIndex] = armorIndex;
                }
                if (accessoryIndex >= 0) {
                    takeFromBagRequest["item" + accessoryIndex] = accessoryIndex;
                }
                $.post("mydata.cgi", takeFromBagRequest, function (html) {
                    $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                    $("form[action='status.cgi']").attr("action", "mydata.cgi");
                    $("#returnButton").trigger("click");
                });
            }
        });
    }
}

/**
 * 装备指定的套装
 * @param id ID
 * @param pass PASS
 * @param weaponName 武器名
 * @param weaponStar 是否齐心武器
 * @param armorName 防具名
 * @param armorStar 是否齐心防具
 * @param accessoryName 饰品名
 * @param accessoryStar 是否齐心饰品
 * @private
 */
function ____use_equipment_set(id, pass,
                               weaponName, weaponStar,
                               armorName, armorStar,
                               accessoryName, accessoryStar) {
    let weaponNameForUse = weaponName;
    if (weaponStar) {
        weaponNameForUse = "齐心★" + weaponNameForUse;
    }
    let armorNameForUse = armorName;
    if (armorStar) {
        armorNameForUse = "齐心★" + armorNameForUse;
    }
    let accessoryNameForUse = accessoryName;
    if (accessoryStar) {
        accessoryNameForUse = "齐心★" + accessoryNameForUse;
    }
    let weaponIndex = -1;
    let armorIndex = -1;
    let accessoryIndex = -1;
    $("input:checkbox").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        let using = $(checkbox).parent().next().text();
        if (category === "武器" && using !== "★" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
            weaponIndex = $(checkbox).val();
        }
        if (category === "防具" && using !== "★" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
            armorIndex = $(checkbox).val();
        }
        if (category === "饰品" && using !== "★" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
            accessoryIndex = $(checkbox).val();
        }
    });
    if (weaponIndex >= 0 || armorIndex >= 0 || accessoryIndex >= 0) {
        let request = {};
        request["id"] = id;
        request["pass"] = pass;
        request["chara"] = "1";
        request["mode"] = "USE"
        if (weaponIndex >= 0) {
            request["item" + weaponIndex] = weaponIndex;
        }
        if (armorIndex >= 0) {
            request["item" + armorIndex] = armorIndex;
        }
        if (accessoryIndex >= 0) {
            request["item" + accessoryIndex] = accessoryIndex;
        }
        $.post("mydata.cgi", request, function (html) {
            $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
            $("form[action='status.cgi']").attr("action", "mydata.cgi");
            $("#returnButton").trigger("click");
        });
    }
}


// 个人状态 -> 转职
function __personalStatus_transferCareer(htmlText) {
    __page_constructNpcMessageTable("白皇");
    __page_writeNpcMessage("是的，你没有看错，换人了，某幕后黑手不愿意出镜。不过请放心，转职方面我是专业的，毕竟我一直制霸钉耙榜。<br>");

    $('input[value="转职"]').attr('id', 'transferCareerButton');

    let lastTargetCareer = "";
    $("option[value!='']").each(function (_idx, option) {
        lastTargetCareer = $(option).attr("value");
    });

    if (lastTargetCareer === "") {
        __page_writeNpcMessage("我的天，你甚至连最基础的转职条件都没有满足，那你来这么干什么？我不愿意说粗口，所以我无话可说了，你走吧。<br>");
        return;
    }

    let level = $($($("table")[4]).find("td")[7]).text();
    if (level < 150) {
        __page_writeNpcMessage("从专业的角度来说，你现在并没有满级，我并不推荐你现在就转职。当然你如果强行要这么做的话，我也不说啥。<br>");
        return;
    }

    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();
    // 进入转职页面的时候，读取一下个人信息。把标准的HP/MP和五围读出来
    __ajax_readPersonalInformation(id, pass, function (information) {
        var mhp = information["MAX_HP"];
        var mmp = information["MAX_MP"];
        var at = information["AT"];
        var df = information["DF"];
        var sa = information["SA"];
        var sd = information["SD"];
        var sp = information["SP"];
        var stableCareer = (mhp == 1999 && mmp >= 1000
            && at >= 300 && df >= 300 && sa >= 300 && sd >= 300 && sp >= 300);

        if (stableCareer) {
            // 看起来这能力已经可以定型了，给个警告吧，确认是否要转职！
            var current = information["HP"] + "/" + mhp + " " + information["MP"] + "/" + mmp + " " + at + " " + df + " " + sa + " " + sd + " " + sp;
            $('#transferCareerButton').attr('value', '看起来你现在满足了最低的定型标准(' + current + ')，你确认要转职吗？');
        }

        // 是否需要给个转职建议呢？
        var recommendationCareers = [];
        var careers = Object.keys(transferCareerRequirementDict);
        for (var careerIndex = 0; careerIndex < careers.length; careerIndex++) {
            var career = careers[careerIndex];
            var requirement = transferCareerRequirementDict[career];
            if (mmp >= requirement[0] && at >= requirement[1] && df >= requirement[2] &&
                sa >= requirement[3] && sd >= requirement[4] && sp >= requirement[5]) {
                // 发现了可以推荐的职业
                recommendationCareers.push(career);
            }
        }

        let autoSuggest = false;
        let message = "";
        if (recommendationCareers.length > 0) {
            message += "我觉得你可以尝试一下这些新职业：";
            for (let ci = 0; ci < recommendationCareers.length; ci++) {
                message += "<b>" + recommendationCareers[ci] + "</b> "
            }
            message += " 当然，看脸时代的转职成功率你应该心中有数。";
        } else {
            autoSuggest = true;
            message += "不过说实话，你现在的能力，确实爱转啥就转啥吧，区别不大。";
        }
        message += "<br>"
        __page_writeNpcMessage(message);

        if (autoSuggest) {
            let targetCareer = "";
            let careerNames = Object.keys(_CAREER_DICT);
            for (let ci = 0; ci < careerNames.length; ci++) {
                let careerName = careerNames[ci];
                let career = _CAREER_DICT[careerName];
                if (career["id"] == lastTargetCareer) {
                    targetCareer = careerName;
                }
            }
            if (targetCareer !== "") {
                __page_writeNpcMessage("嗯，还有另外一种选择，继续转职<b>" + targetCareer + "</b>，如何？" +
                    "<b>[<a href='javascript:void(0)' id='toTopCareer'>我听你的就转职" + targetCareer + "</a>]</b>");
                $("#toTopCareer").click(function () {
                    $("option").each(function (_i, o) {
                        let optionValue = $(o).attr("value");
                        if (optionValue != lastTargetCareer) {
                            $(o).prop("selected", false);
                        } else {
                            $(o).prop("selected", true);
                        }
                    });
                    $("input[type='radio']").prop("checked", true);
                    __ajax_lodgeAtInn(information["id"], information["pass"], function (data) {
                        // 转职前住宿，保持最佳状态
                        $("#transferCareerButton").trigger("click");
                    });
                });
            }
        }
    });
}