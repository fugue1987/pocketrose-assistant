import * as network from "../common/common_network";
import * as pet from "../pocket/pocket_pet";
import * as util from "../common/common_util";
import {Coordinate} from "../common/common_util";
import * as service from "../pocket/pocket_service";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromTownBank} from "../pocket/pocket_service";
import {findTownBySecret} from "../pocket/pocket_town";
import * as setup from "../setup/setup";
import * as page2 from "../common/common_page";

export class TownDashboardProcessor {

    constructor() {
    }

    process() {
        const credential = page2.generateCredential();
        const preference = setup.getBattlePlacePreference(credential.id);
        let count = 0;
        if (preference["primary"]) {
            count++;
        }
        if (preference["junior"]) {
            count++;
        }
        if (preference["senior"]) {
            count++;
        }
        if (preference["zodiac"]) {
            count++;
        }
        if (count === 1) {
            // 只设置了一处战斗场所偏好
            let formBattle = $("form[action='battle.cgi'");
            let selectBattle = formBattle.find('select[name="level"]');
            let btnBattle = formBattle.parent().next().find('input');
            let inputDigits = '';
            $(document).off('keydown.city').on('keydown.city', function (e) {
                const key = e.key;
                if (!isNaN(parseInt(key))) {
                    inputDigits += key;
                }
                if (inputDigits.length === 2) {
                    switch (inputDigits) {
                        case '11':
                            selectBattle.find('option').eq(0).prop('selected', true);
                            break;
                        case '22':
                            selectBattle.find('option').eq(1).prop('selected', true);
                            break;
                        default:
                            inputDigits = '';
                            break;
                    }
                    btnBattle.focus();
                    // 重置 inputDigits
                    inputDigits = '';
                }
            });
        }

        if (count > 0) {
            // 设置了战斗场所偏好
            let keepDelim = true;
            $("select[name='level']").find("option").each(function (_idx, option) {
                const text = $(option).text();
                if (text.startsWith("秘宝之岛")) {
                    // do nothing, keep
                } else if (text.startsWith("初级之森")) {
                    // do nothing, keep
                } else if (text.startsWith("中级之塔")) {
                    // do nothing, keep
                } else if (text.startsWith("上级之洞")) {
                    // do nothing, keep
                } else if (text.startsWith("十二神殿")) {
                    // do nothing, keep
                } else if (text.startsWith("------")) {
                    // do nothing, keep
                } else {
                    $(option).remove();
                }
            });
            $("select[name='level']").find("option").each(function (_idx, option) {
                const text = $(option).text();
                if (text.startsWith("初级之森")) {
                    if (!preference["primary"]) {
                        $(option).remove();
                    }
                } else if (text.startsWith("中级之塔")) {
                    if (!preference["junior"]) {
                        $(option).remove();
                    }
                } else if (text.startsWith("上级之洞")) {
                    if (!preference["senior"]) {
                        $(option).remove();
                    }
                } else if (text.startsWith("十二神殿")) {
                    if (!preference["zodiac"]) {
                        $(option).remove();
                    }
                }
            });
            // 删除连续的分隔线
            let delimMatch = false;
            $("select[name='level']").find("option").each(function (_idx, option) {
                const text = $(option).text();
                if (text.startsWith("------")) {
                    if (!delimMatch) {
                        delimMatch = true;
                    } else {
                        $(option).remove();
                    }
                } else {
                    delimMatch = false;
                }
            });
            // 删除头尾的分隔线
            if ($("select[name='level']").find("option:last").text().startsWith("------")) {
                $("select[name='level']").find("option:last").remove();
            }
            if ($("select[name='level']").find("option:first").text().startsWith("------")) {
                $("select[name='level']").find("option:first").remove();
            }
        }


        $("option[value='INN']").text("客栈·驿站");
        $("option[value='INN']").css("background-color", "yellow");
        $("option[value='BAOSHI_SHOP']").text("超级合成屋");
        $("option[value='BAOSHI_SHOP']").css("background-color", "yellow");
        $("option[value='LETTER']").text("口袋助手设置");
        $("option[value='LETTER']").css("background-color", "yellow");
        if (setup.isItemManagementUIEnabled()) {
            $("option[value='USE_ITEM']").text("装备管理");
            $("option[value='USE_ITEM']").css("background-color", "yellow");
            $("option[value='ITEM_SEND']").remove();
        }
        if (setup.isPetManagementUIEnabled()) {
            $("option[value='PETSTATUS']").text("宠物管理");
            $("option[value='PETSTATUS']").css("background-color", "yellow");
            $("option[value='PET_SEND']").remove();
        }
        if (setup.isCareerManagementUIEnabled()) {
            $("option[value='CHANGE_OCCUPATION']").text("职业管理");
            $("option[value='CHANGE_OCCUPATION']").css("background-color", "yellow");
            $("option[value='MAGIC']").remove();
        }
        if (setup.isPocketSuperMarketEnabled()) {
            $("option[value='ARM_SHOP']").text("口袋超市");
            $("option[value='ARM_SHOP']").css("background-color", "yellow");
            $("option[value='PRO_SHOP']").remove();
            $("option[value='ACC_SHOP']").remove();
            $("option[value='ITEM_SHOP']").remove();
        }
        $("option[value='CHANGEMAP']").text("冒险家公会");
        $("option[value='CHANGEMAP']").css("background-color", "yellow");

        // 为某些支持动态更新的表格设置id
        // ＨＰ / ＭＰ / 资金
        $("td:contains('ＨＰ')")
            .filter(function () {
                return $(this).text() === "ＨＰ";
            })
            .next()
            .attr("id", "health_cell");
        $("td:contains('ＭＰ')")
            .filter(function () {
                return $(this).text() === "ＭＰ";
            })
            .next()
            .attr("id", "mana_cell");
        $("td:contains('资金')")
            .filter(function () {
                return $(this).text() === "资金";
            })
            .next()
            .attr("id", "cash_cell");

        this.#renderHTML();

        new PocketEventProcessor().process();

        const instance = this;
        $("img:first").attr("id", "town_picture");
        $("#town_picture").dblclick(function () {
            const cashText = $("td:contains('资金')")
                .filter(function () {
                    return $(this).text() === "资金";
                })
                .next()
                .text();
            const cash = parseInt(util.substringBefore(cashText, " Gold"));


            service.lodgeTown(credential)
                .then(() => {
                    pet.loadPersonalPetList(credential)
                        .then(petList => {
                            const usingPet = petList.usingPet;
                            if (usingPet !== undefined && usingPet.level >= 100) {
                                const expect = Math.ceil(100 - usingPet.love) * 10000;
                                if (expect > 0) {
                                    const amount = calculateCashDifferenceAmount(cash, expect);
                                    withdrawFromTownBank(credential, amount)
                                        .then(() => {
                                            const request = credential.asRequest();
                                            request["mode"] = "PETADDLOVE";
                                            request["select"] = usingPet.index;
                                            network.sendPostRequest("mydata.cgi", request, function () {
                                                instance.#depositAndReturn();
                                            });
                                        });
                                } else {
                                    instance.#depositAndReturn();
                                }
                            } else {
                                instance.#depositAndReturn();
                            }
                        });
                });
        });
    }

    #depositAndReturn() {
        const instance = this;
        const credential = page2.generateCredential();
        depositIntoTownBank(credential, undefined)
            .then(() => {
                instance.#returnAndRefresh();
            });
    }

    /**
     * 返回主页，并且更新HP/MP/资金
     */
    #returnAndRefresh() {
        const credential = page2.generateCredential();
        const request = credential.asRequest();
        request["mode"] = "STATUS";
        network.sendPostRequest("status.cgi", request, function (html) {
            let s = $(html).find("td:contains('ＨＰ')")
                .filter(function () {
                    return $(this).text() === "ＨＰ";
                })
                .next()
                .html();
            $("#health_cell").html(s);
            s = $(html).find("td:contains('ＭＰ')")
                .filter(function () {
                    return $(this).text() === "ＭＰ";
                })
                .next()
                .html();
            $("#mana_cell").html(s);
            s = $(html).find("td:contains('资金')")
                .filter(function () {
                    return $(this).text() === "资金";
                })
                .next()
                .text();
            const cash = parseInt(util.substringBefore(s, " Gold"));
            if (cash < 1000000) {
                $("#cash_cell").removeAttr("style");
            }
            $("#cash_cell").text(s);
        });
    }

    #renderHTML() {
        // 读取角色当前的能力值
        const text = $("#c_001").find("table:last").find("td:first").text();
        let idx = text.indexOf("Lv：");
        let s = text.substring(idx);
        const level = parseInt(s.substring(3, s.indexOf(" ")));
        idx = text.indexOf("攻击力：");
        s = text.substring(idx);
        const attack = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("防御力：");
        s = s.substring(idx);
        const defense = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("智力：");
        s = s.substring(idx);
        const specialAttack = parseInt(s.substring(3, s.indexOf(" ")));
        idx = s.indexOf("精神力：");
        s = s.substring(idx);
        const specialDefense = parseInt(s.substring(4, s.indexOf(" ")));
        idx = s.indexOf("速度：");
        s = s.substring(idx);
        const speed = parseInt(s.substring(3));

        // 主页面如果角色满级则经验(大于等于14900)显示为蓝色
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "经验值") {
                const expText = $(td).next().text();
                const exp = expText.substring(0, expText.indexOf(" EX"));
                if (exp >= 14900) {
                    $(td).next().attr("style", "color: blue");
                    $(td).next().text("[MAX]");
                }
            }
            if (text === "身份") {
                if (level !== 150 && (attack === 375 || defense === 375
                    || specialAttack === 375 || specialDefense === 375 || speed === 375)) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "资金") {
                const cashText = $(td).next().text();
                const cash = cashText.substring(0, cashText.indexOf(" Gold"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color: red");
                }
            }
        });

        // 读取战数
        const battleCount = parseInt($("input:hidden[name='ktotal']").val());
        $("td:contains('贡献度')")
            .filter(function () {
                return $(this).text() === "贡献度";
            })
            .closest("table")
            .find("th:first")
            .find("font:first")
            .html(function (_idx, text) {
                const name = util.substringBefore(text, "(");
                const unit = util.substringBetween(text, "(", "军)");
                if (unit.includes("无所属")) {
                    return name + "&nbsp;&nbsp;&nbsp;" + battleCount + "战";
                } else {
                    return name + "(" + unit + ")" + "&nbsp;&nbsp;&nbsp;" + battleCount + "战";
                }
            });
    }
}

export class WildDashboardProcessor {
    constructor() {
    }

    process() {
    }
}

/**
 * 最近发生的事件
 */
export class PocketEventProcessor {

    constructor() {
    }

    process() {
        const title = $("td:contains('最近发生的事件')")
            .filter(function () {
                return $(this).text() === "最近发生的事件";
            });
        const td = $(title).closest("table")
            .find("td:eq(1)");

        $(td).attr("id", "pocket_event");

        const originalEventHtmlList = [];
        const ss = $(td).html().split("<br>");
        for (const s of ss) {
            const c = util.substringAfter(s, "<font color=\"navy\">●</font>");
            if (c.endsWith(")")) {
                originalEventHtmlList.push(c);
            }
        }

        const processedEventHtmlList = [];
        for (const s of originalEventHtmlList) {
            const t = "<td>" + s + "</td>";
            const text = $(t).text();
            if (text.startsWith("[萝莉失踪]")) {
                const secret = util.substringBetween(text, "[萝莉失踪]据说在印有", "描述的城市附近有萝莉失踪！");
                const candidates = findTownBySecret(secret);
                let recommendation = "";
                if (candidates.length === 0) {
                    recommendation = "没有发现推荐的城市？检查一下城市字典吧，密字[" + secret + "]。";
                } else {
                    recommendation = "可能失踪的城市是：";
                    for (let i = 0; i < candidates.length; i++) {
                        const town = candidates[i];
                        recommendation += "<b style='color:red'>" + town.name + "</b>";
                        recommendation += this.#generateSuspectCoordinate(town);
                        if (i !== candidates.length - 1) {
                            recommendation += "，";
                        } else {
                            recommendation += "。";
                        }
                    }
                }
                let p1 = util.substringBefore(s, "失踪！");
                let p2 = "失踪！";
                let p3 = util.substringAfter(s, "失踪！");

                processedEventHtmlList.push(p1 + p2 + recommendation + p3);
            } else if (text.startsWith("[正太失踪]")) {
                const secret = util.substringBetween(text, "[正太失踪]据说在印有", "描述的城市附近有正太失踪！");
                const candidates = findTownBySecret(secret);
                let recommendation = "";
                if (candidates.length === 0) {
                    recommendation = "没有发现推荐的城市？检查一下城市字典吧，密字[" + secret + "]。";
                } else {
                    recommendation = "可能失踪的城市是：";
                    for (let i = 0; i < candidates.length; i++) {
                        const town = candidates[i];
                        recommendation += "<b style='color:red'>" + town.name + "</b>";
                        recommendation += this.#generateSuspectCoordinate(town);
                        if (i !== candidates.length - 1) {
                            recommendation += "，";
                        } else {
                            recommendation += "。";
                        }
                    }
                }
                let p1 = util.substringBefore(s, "失踪！");
                let p2 = "失踪！";
                let p3 = util.substringAfter(s, "失踪！");

                processedEventHtmlList.push(p1 + p2 + recommendation + p3);
            } else {
                processedEventHtmlList.push(s);
            }
        }

        let formatHTML = "";
        for (const it of processedEventHtmlList) {
            formatHTML = formatHTML + "<li>" + it + "</li>";
        }
        $("#pocket_event").html(formatHTML);
    }

    process2() {
        const title = $("th:contains('最近发生的事件')")
            .filter(function () {
                return $(this).text() === "最近发生的事件";
            });
        const td = $(title).closest("table")
            .find("td:eq(0)");

        $(td).attr("id", "pocket_event");

        const originalEventHtmlList = [];
        const ss = $(td).html().split("<br>");
        for (const s of ss) {
            const c = util.substringAfter(s, "<font color=\"green\">●</font>");
            if (c.endsWith(")")) {
                originalEventHtmlList.push(c);
            }
        }

        const processedEventHtmlList = [];
        for (const s of originalEventHtmlList) {
            const t = "<td>" + s + "</td>";
            const text = $(t).text();
            if (text.startsWith("[萝莉失踪]")) {
                const secret = util.substringBetween(text, "[萝莉失踪]据说在印有", "描述的城市附近有萝莉失踪！");
                const candidates = findTownBySecret(secret);
                let recommendation = "";
                if (candidates.length === 0) {
                    recommendation = "没有发现推荐的城市？检查一下城市字典吧，密字[" + secret + "]。";
                } else {
                    recommendation = "可能失踪的城市是：";
                    for (let i = 0; i < candidates.length; i++) {
                        const town = candidates[i];
                        recommendation += "<b style='color:red'>" + town.name + "</b>";
                        recommendation += this.#generateSuspectCoordinate(town);
                        if (i !== candidates.length - 1) {
                            recommendation += "，";
                        } else {
                            recommendation += "。";
                        }
                    }
                }
                let p1 = util.substringBefore(s, "失踪！");
                let p2 = "失踪！";
                let p3 = util.substringAfter(s, "失踪！");

                processedEventHtmlList.push(p1 + p2 + recommendation + p3);
            } else if (text.startsWith("[正太失踪]")) {
                const secret = util.substringBetween(text, "[正太失踪]据说在印有", "描述的城市附近有正太失踪！");
                const candidates = findTownBySecret(secret);
                let recommendation = "";
                if (candidates.length === 0) {
                    recommendation = "没有发现推荐的城市？检查一下城市字典吧，密字[" + secret + "]。";
                } else {
                    recommendation = "可能失踪的城市是：";
                    for (let i = 0; i < candidates.length; i++) {
                        const town = candidates[i];
                        recommendation += "<b style='color:red'>" + town.name + "</b>";
                        recommendation += this.#generateSuspectCoordinate(town);
                        if (i !== candidates.length - 1) {
                            recommendation += "，";
                        } else {
                            recommendation += "。";
                        }
                    }
                }
                let p1 = util.substringBefore(s, "失踪！");
                let p2 = "失踪！";
                let p3 = util.substringAfter(s, "失踪！");

                processedEventHtmlList.push(p1 + p2 + recommendation + p3);
            } else {
                processedEventHtmlList.push(s);
            }
        }

        let formatHTML = "";
        for (const it of processedEventHtmlList) {
            formatHTML = formatHTML + "<li>" + it + "</li>";
        }
        $("#pocket_event").html(formatHTML);
    }

    #generateSuspectCoordinate(town) {
        const locations = [];
        locations.push(new Coordinate(town.coordinate.x, town.coordinate.y + 1));
        locations.push(new Coordinate(town.coordinate.x, town.coordinate.y - 1));
        locations.push(new Coordinate(town.coordinate.x - 1, town.coordinate.y));
        locations.push(new Coordinate(town.coordinate.x + 1, town.coordinate.y));
        let s = "";
        for (const location of locations) {
            if (location.x >= 0 && location.x <= 15 && location.y >= 0 && location.y <= 15) {
                s += location.longText();
            }
        }
        return "<b style='color:blue'>" + s + "</b>";
    }
}