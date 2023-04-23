import * as dashboard from "../dashboard";
import * as message from "../message";
import * as network from "../common/common_network";
import * as page from "../page";
import * as map from "../pocket/pocket_map";
import {getTown} from "../pocket/pocket_town";

export class WildRequestInterceptor {
    constructor() {
    }

    process() {
        const bodyText = $("body:first").text();
        if (bodyText.includes("请选择移动的格数")) {
            new dashboard.WildDashboardProcessor().process();
        } else if (bodyText.includes("＜＜住所＞＞")) {
            new WildPostHouse().process();
        } else if (bodyText.includes("各国资料")) {
            // 查看势力图
            new dashboard.PocketEventProcessor().process2();
        }
    }
}

class WildPostHouse {
    constructor() {
    }

    process() {
        $("table:eq(0)").removeAttr("height");
        $("table:eq(1)").removeAttr("height");

        $("img").each(function (_idx, img) {
            const src = $(img).attr("src");
            if (src !== undefined && src.endsWith("image/etc/39.gif")) {
                $(img).parent().prev().attr("id", "messageBoard");
                $(img).parent().prev().attr("style", "color:white");
            }
        });
        message.initializeMessageBoard("能在这荒郊野岭相逢，也是缘分。");

        $("table:eq(2) tr:last").after($("<TR>" +
            "<TD bgcolor=#E0D0B0>计时器</TD>" +
            "<TD bgcolor=#E8E8D0 colspan=3 id='count_up_timer' style='color: red;text-align: right'>-</TD>" +
            "</TR>"));

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
                $("input:radio").prop("disabled", true);
                $("select[name='mode']").prop("disabled", true);
                $("table:eq(7)").remove();

                const town = getTown(townId);
                message.publishMessageBoard(message._message_town_target, {"town": town.name});

                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["mode"] = "STATUS";
                network.sendPostRequest("status.cgi", request, function (html) {
                    const plan = map.initializeMovePlan(html);
                    plan.credential = credential;
                    plan.destination = town.coordinate;
                    map.executeMovePlan(plan).then(() => {
                        message.writeMessageBoard("已经到达" + town.name + "城门口，希望下次再见");
                        $("input:submit[value='返回上个画面']").prop("disabled", false);
                        $("input:submit[value='返回上个画面']").attr("value", town.name + "门口到了");
                    });
                });
            }
        });
    }
}