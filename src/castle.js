/**
 * ============================================================================
 * [ 城 堡 相 关 功 能 ]
 * ============================================================================
 */

import * as message from "./message";
import * as map from "./map";
import {enterTown, leaveCastle} from "./map";
import * as page from "./page";
import {generateCredential} from "./page";
import * as pocket from "./pocket";
import * as util from "./util";
import * as finance from "./bank";
import * as user from "./user";

/**
 * 城堡相关页面的处理入口
 */
export class CastleRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body").text();
        if (text.includes("在网吧的用户请使用这个退出")) {
            // 根据关键字匹配出城堡首页，重新渲染
            new CastleStatusRenderer().render();
        }

        // 城堡机车建造厂改造成城堡驿站
        // castle.cgi CASTLE_BUILDMACHINE
        if (text.includes("＜＜ * 机车建造厂 *＞＞")) {
            new CastlePostHouse().process();
        }

        // 城堡有很多中间确认页面，意义不大，平白无故增加了点击的消息
        // 把这些页面修改为自动确认返回，包括以下操作的确认
        // 1. 城堡取钱
        // 2. 城堡存钱
        if (
            text.includes("请善加利用，欢迎您再来！") ||
            text.includes("已经顺利存入您的账户！")
        ) {
            new ConfirmationEliminator().returnToCastle();
        }
    }
}

/**
 * ----------------------------------------------------------------------------
 * 城堡首页渲染器
 * ----------------------------------------------------------------------------
 * 1. 资金超过100万红色显示。
 * 2. 经验满级时蓝色显示[MAX]。
 * 3. 机车建造(CASTLE_BUILDMACHINE)改造为城堡驿站。
 * ----------------------------------------------------------------------------
 */
class CastleStatusRenderer {

    render() {
        $("td:parent").each(function (_idx, td) {
            const tdText = $(td).text();
            if (tdText === "资金") {
                const cash = parseInt(util.substringBefore($(td).next().text(), " Gold"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color:red");
                }
            }
            if (tdText === "经验值") {
                const exp = parseInt(util.substringBefore($(td).next().text(), " EX"));
                if (exp >= 14900) {
                    $(td).next().attr("style", "color:blue");
                    $(td).next().text("[MAX]");
                }
            }
        });

        $("option[value='CASTLE_BUILDMACHINE']").attr("style", "background: yellow");
        $("option[value='CASTLE_BUILDMACHINE']").text("城堡驿站");
    }
}

/**
 * 城堡驿站
 */
class CastlePostHouse {

    process() {
        this.#reformatHTML();
    }

    #reformatHTML() {
        // 把之前的机车建设厂的部分内容隐藏
        const html = $("body:first").html();
        const a1 = util.substringBefore(html, "<center>");
        let left = util.substringAfter(html, "<center>");
        const a2 = util.substringBefore(left, "</center>");
        const a3 = util.substringAfter(left, "</center>");
        const reformat = a1 + "<div style='display: none'>" + a2 + "</div>" + a3;
        $("body:first").html(reformat);

        $("table:first").removeAttr("height");

        let cash = 0;
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith("＜＜ * 机车建造厂 *＞＞")) {
                // 改名字为“城堡驿站”
                const title = "　<font color=#f1f1f1 size=4>　　　＜＜<B> * 城堡驿站 *</B>＞＞</font>";
                $(td).html(title);
            }
            if (text === "机车建造厂是城堡内最重要的设施之一,在这里建造的机车将用于异世界的行动") {
                // 改说明
                $(td).attr("id", "messageBoard");
                $(td).attr("style", "color: white");
                $(td).html("我们已经将城堡中废弃的机车建造厂改造成为了驿站。<br>");
            }
            if (text === "姓名") {
                $(td).parent().next().find("td:first").attr("id", "role_name");
            }
            if (text === "所持金") {
                $(td).next().attr("id", "role_cash");
                cash = parseInt(util.substringBefore($(td).next().text(), " GOLD"));
            }
            if (text === "铁储备") {
                $(td).text("计时器");
                $(td).next().attr("id", "count_up_timer");
                $(td).next().text("-");
            }
        });

        const npc = page.createFooterNPC("饭饭");
        npc.welcome("轮到我啦，上镜+RP，+RP，+RP，重要的事情喊三遍！<br>");
        npc.message("快看看你想去哪里？<br>");
        npc.message("<input type='button' id='returnTown' style='color: blue' value='选好后立刻出发'><br>");
        npc.message(page.generateTownSelectionTable());

        const postHouse = this;
        $("#returnTown").click(function () {
            const townId = $("input:radio[name='townId']:checked").val();
            if (townId === undefined) {
                alert("人可以笨，但是不可以这么笨，好歹你先选个目的地，你觉得呢？");
            } else {
                $("input:radio[name='townId']").prop("disabled", true);
                $("input:submit[value='返回城堡']").prop("disabled", true);
                $("#returnTown").prop("disabled", true);

                message.initializeMessageBoard("开始播报实时动态：<br>");
                const town = pocket.getTown(townId);
                message.publishMessageBoard(message._message_town_target, {"town": town.name});

                const amount = finance.calculateCashDifferenceAmount(cash, 100000);
                const credential = generateCredential();
                finance.withdrawFromCastleBank(credential, amount).then(() => {
                    message.publishMessageBoard(message._message_castle_withdraw, {"amount": amount});
                    $("#role_cash").text((cash + amount * 10000) + " GOLD");
                    postHouse.#travelTo(town);
                });
            }
        });
    }

    #travelTo(town) {
        const credential = generateCredential();
        user.loadRole(credential).then(role => {
            $("#role_name").text(role.name);

            leaveCastle(credential).then(plan => {
                plan.source = role.coordinate;
                plan.destination = town.coordinate;
                map.executeMovePlan(plan).then(() => {
                    enterTown(credential, town.id).then(() => {
                        message.publishMessageBoard(message._message_town_enter, {
                            "player": role.name,
                            "town": town.name
                        });
                        finance.depositIntoTownBank(credential, undefined).then(() => {
                            message.publishMessageBoard(message._message_town_deposit, {"player": role.name});
                            $("form[action='castlestatus.cgi']").attr("action", "status.cgi");
                            $("input:hidden[value='CASTLESTATUS']").attr("value", "STATUS");
                            $("input:submit[value='返回城堡']").prop("disabled", false);
                            $("input:submit[value='返回城堡']").attr("value", town.name + "欢迎您");
                        });
                    });
                });

            });
        });
    }
}

/**
 * 消除冗余的确认页面，直接点击返回城堡按钮。
 */
class ConfirmationEliminator {

    returnToCastle() {
        $("input:submit[value='返回城堡']").trigger("click");
    }
}
