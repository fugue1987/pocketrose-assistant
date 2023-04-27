import * as message2 from "../common/common_message";
import * as page2 from "../common/common_page";
import * as town from "../pocket/pocket_town";
import * as network from "../common/common_network";
import * as map from "../pocket/pocket_map";
import * as pocket from "../common/common_pocket";

export class WildPostHouse {
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
        message2.initializeMessageBoard("能在这荒郊野岭相逢，也是缘分。");

        $("table:eq(2) tr:last").after($("<TR>" +
            "<TD bgcolor=#E0D0B0>计时器</TD>" +
            "<TD bgcolor=#E8E8D0 colspan=3 id='count_up_timer' style='color: red;text-align: right'>-</TD>" +
            "</TR>"));

        const imageHTML = pocket.getNPCImageHTML("花子");
        message2.createFooterMessageStyleA(imageHTML);
        message2.writeFooterMessage("没、没有想到这么快我们又见面了。这、这次我只能把你带到城门口。<br>");
        message2.writeFooterMessage("<input type='button' id='moveToTown' style='color: blue' value='选择想去哪个城门口'><br>");
        message2.writeFooterMessage(town.generateTownSelectionTableStyleB());

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

                const destinationTown = town.getTown(townId);
                message2.publishMessageBoard("你设定移动目标为" + destinationTown.name + "。");

                const credential = page2.generateCredential();
                const request = credential.asRequest();
                request["mode"] = "STATUS";
                network.sendPostRequest("status.cgi", request, function (html) {
                    const plan = map.initializeMovePlan(html);
                    plan.credential = credential;
                    plan.destination = destinationTown.coordinate;
                    map.executeMovePlan(plan).then(() => {
                        message2.publishMessageBoard("已经到达" + destinationTown.name + "城门口，希望下次再见。");
                        $("input:submit[value='返回上个画面']").prop("disabled", false);
                        $("input:submit[value='返回上个画面']").attr("value", destinationTown.name + "门口到了");
                    });
                });
            }
        });
    }
}