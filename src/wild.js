import * as dashboard from "./dashboard";
import * as message from "./message";
import * as network from "./network";
import * as page from "./page";
import * as pocket from "./pocket";
import * as map from "./map";
import {MovePlan} from "./map";
import * as util from "./util";
import {Coordinate} from "./geo";

export class WildRequestInterceptor {
    constructor() {
    }

    process() {
        const bodyText = $("body:first").text();
        if (bodyText.includes("请选择移动的格数")) {
            new dashboard.WildDashboardProcessor().process();
        } else if (bodyText.includes("＜＜住所＞＞")) {
            new WildPostHouse().process();
        }
    }
}

class WildPostHouse {
    constructor() {
    }

    process() {
        $("img").each(function (_idx, img) {
            const src = $(img).attr("src");
            if (src !== undefined && src.endsWith("image/etc/39.gif")) {
                $(img).parent().prev().attr("id", "messageBoard");
                $(img).parent().prev().attr("style", "color:white");
            }
        });
        message.initializeMessageBoard("能在这荒郊野岭相逢，也是缘分。");

        const npc = page.createFooterNPC("花子");
        npc.welcome("没、没有想到这么快我们又见面了。这、这次我只能把你带到城门口。<br>");
        npc.message("<input type='button' id='moveToTown' style='color: blue' value='选择想去哪个城门口'><br>");
        npc.message(page.generateTownSelectionTable());

        $("#moveToTown").click(function () {
            const townId = $("input:radio[name='townId']:checked").val();
            if (townId === undefined) {
                alert("我觉得很难找到比你更笨的人了，你说呢？");
            } else {
                $("#moveToTown").prop("disabled", true);
                $("input:submit[value='确定']").prop("disabled", true);
                $("input:submit[value='返回上个画面']").prop("disabled", true);

                const town = pocket.getTown(townId);
                message.publishMessageBoard(message._message_town_target, {"town": town.name});

                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["mode"] = "STATUS";
                network.sendPostRequest("status.cgi", request, function (html) {
                    const scope = $(html).find("select[name='chara_m']")
                        .find("option:last").attr("value");
                    let mode = "ROOK";
                    $(html).find("input:submit").each(function (_idx, input) {
                        const v = $(input).attr("value");
                        const d = $(input).attr("disabled");
                        if (v === "↖" && d === undefined) {
                            mode = "QUEEN";
                        }
                    });
                    let from = undefined;
                    $(html).find("td").each(function (_idx, td) {
                        const text = $(td).text();
                        if (text.includes("现在位置(") && text.endsWith(")")) {
                            const s = util.substringBetween(text, "(", ")");
                            const x = util.substringBefore(s, ",");
                            const y = util.substringAfter(s, ",");
                            from = new Coordinate(parseInt(x), parseInt(y));
                        }
                    });
                    message.publishMessageBoard(message._message_move_mode, {"mode": mode});
                    message.publishMessageBoard(message._message_move_scope, {"scope": scope});
                    const plan = new MovePlan();
                    plan.credential = credential;
                    plan.scope = scope;
                    plan.mode = mode;
                    plan.source = from;
                    plan.destination = town.coordinate;
                    map.executeMovePlan(plan).then(() => {
                        $("input:submit[value='返回上个画面']").prop("disabled", false);
                        $("input:submit[value='返回上个画面']").attr("value", town.name + "门口到了");
                    });
                });
            }
        });
    }
}