import * as util from "../common/common_util";
import * as page2 from "../common/common_page";
import * as message2 from "../common/common_message";
import * as town from "../pocket/pocket_town";
import {getTown} from "../pocket/pocket_town";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromCastleBank} from "../pocket/pocket_service";
import * as user from "../pocket/pocket_user";
import * as map from "../pocket/pocket_map";
import {enterTown, leaveCastle} from "../pocket/pocket_map";
import * as pocket from "../common/common_pocket";

/**
 * 城堡驿站
 */
export class CastlePostHouse {

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

        const imageHTML = pocket.getNPCImageHTML("饭饭");
        message2.createFooterMessageStyleA(imageHTML);
        message2.writeFooterMessage("轮到我啦，上镜+RP，+RP，+RP，重要的事情喊三遍！<br>");
        message2.writeFooterMessage("快看看你想去哪里？<br>");
        message2.writeFooterMessage("<input type='button' id='returnTown' style='color: blue' value='选好后立刻出发'><br>");
        message2.writeFooterMessage(town.generateTownSelectionTableStyleB());

        const postHouse = this;
        $("#returnTown").click(function () {
            const townId = $("input:radio[name='townId']:checked").val();
            if (townId === undefined) {
                alert("人可以笨，但是不可以这么笨，好歹你先选个目的地，你觉得呢？");
            } else {
                $("input:radio[name='townId']").prop("disabled", true);
                $("input:submit[value='返回城堡']").prop("disabled", true);
                $("#returnTown").prop("disabled", true);

                message2.initializeMessageBoard("开始播报实时动态：<br>");
                const town = getTown(townId);
                message2.publishMessageBoard("你设定移动目标为" + town.name + "。");

                const amount = calculateCashDifferenceAmount(cash, 100000);
                const credential = page2.generateCredential();
                withdrawFromCastleBank(credential, amount).then(() => {
                    $("#role_cash").text((cash + amount * 10000) + " GOLD");
                    postHouse.#travelTo(town);
                });
            }
        });
    }

    #travelTo(town) {
        const credential = page2.generateCredential();
        user.loadRole(credential).then(role => {
            $("#role_name").text(role.name);

            leaveCastle(credential).then(plan => {
                plan.source = role.coordinate;
                plan.destination = town.coordinate;
                map.executeMovePlan(plan).then(() => {
                    enterTown(credential, town.id).then(() => {
                        depositIntoTownBank(credential, undefined).then(() => {
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