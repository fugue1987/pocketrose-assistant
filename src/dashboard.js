import * as bank from "./bank";
import * as network from "./network";
import * as page from "./page";
import * as pet from "./pet";
import * as user from "./user";
import * as util from "./util";

export class TownDashboardProcessor {

    constructor() {
    }

    process() {
        $("option[value='INN']").text("客栈·驿站");
        $("option[value='ARM_SHOP']").text("武器屋(v2.0)");
        $("option[value='PRO_SHOP']").text("防具屋(v2.0)");
        $("option[value='ACC_SHOP']").text("饰品屋(v2.0)");
        $("option[value='ITEM_SHOP']").text("物品屋(v2.0)");
        $("option[value='BAOSHI_SHOP']").text("合成屋(v2.0)");
        $("option[value='ITEM_SEND']").text("运送屋(v2.0)");
        $("option[value='PET_SEND']").text("宠物赠送(v2.0)");
        $("option[value='LETTER']").text("口袋助手设置");
        $("option[value='LETTER']").attr("style", "background:#20c0ff");
        $("option[value='CHANGEMAP']").text("冒险家公会");

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

            const credential = page.generateCredential();
            user.lodgeTown(credential)
                .then(() => {
                    pet.loadPets(credential)
                        .then(petList => {
                            const usingPet = pet.findUsingPet(petList);
                            if (usingPet !== undefined && usingPet.level >= 100) {
                                const expect = Math.ceil(100 - usingPet.love) * 10000;
                                if (expect > 0) {
                                    const amount = bank.calculateCashDifferenceAmount(cash, expect);
                                    bank.withdrawFromTownBank(credential, amount)
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
        const credential = page.generateCredential();
        bank.depositIntoTownBank(credential, undefined)
            .then(() => {
                instance.#returnAndRefresh();
            });
    }

    /**
     * 返回主页，并且更新HP/MP/资金
     */
    #returnAndRefresh() {
        const credential = page.generateCredential();
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
    }
}

export class WildDashboardProcessor {
    constructor() {
    }

    process() {
    }
}