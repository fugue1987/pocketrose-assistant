import * as pocket from "../common/common_pocket";
import * as page2 from "../common/common_page";
import * as user from "../pocket/pocket_user";
import {findTownByName, generateTownSelectionTableStyleB, getTown} from "../pocket/pocket_town";
import * as castle from "../pocket/pocket_castle";
import * as message2 from "../common/common_message";
import * as util from "../common/common_util";
import {Coordinate} from "../common/common_util";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromTownBank} from "../pocket/pocket_service";
import * as map from "../pocket/pocket_map";

/**
 * 客栈+驿站
 */
export class TownInnPostHouse {

    constructor() {
    }

    process() {
        this.#renderHTML();

        const credential = page2.generateCredential();
        user.loadRole(credential).then(role => {
            const town = findTownByName(role.townName);
            $(".townClass[value='" + town.id + "']").prop("disabled", true);
            $("#player").text(role.name);
            $("#townId").text(town.id);
            $("#moveToTown").prop("disabled", false);

            castle.loadCastle(role.name).then(castle => {
                if (castle !== undefined) {
                    const name = castle.name;
                    const x = castle.coordinate.x;
                    const y = castle.coordinate.y;
                    $("#castle").text(x + "," + y + " " + name);
                    $("#moveToCastle").attr("value", "回到" + name);
                    $("#moveToCastle").prop("disabled", false);
                }
            });
        });

        this.#processMoveToTown();
        this.#processMoveToCastle();
    }

    #renderHTML() {
        const td = $("td:contains('每天的战斗让你疲倦了吧? 来休息一下吧')")
            .filter(function () {
                const t = $(this).text();
                return t.startsWith("欢迎") && t.includes("每天的战斗让你疲倦了吧? 来休息一下吧");
            });
        td.attr("id", "messageBoard");
        td.css("color", "yellow");

        $("input:submit[value='宿泊']").attr("id", "restButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "所持金") {
                let html = $(td).parent().parent().html();
                html += "<tr>" +
                    "<td style='background-color:#E0D0B0'>计时器</td>" +
                    "<td style='background-color:#E0D0B0;text-align:right;color:red' colspan=3 id='count_up_timer'>-</td>" +
                    "</tr>";
                $(td).parent().parent().html(html);
            }
        });

        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.includes("* 宿 屋 *")) {
                let html = $(td).html();
                html = html.replace("* 宿 屋 *", "* 宿 屋 & 驿 站 *");
                $(td).html(html);
            }
        });

        const imageHTML = pocket.getNPCImageHTML("夜九");
        message2.createFooterMessageStyleA(imageHTML);
        message2.writeFooterMessage("驿站试运营中，先把丑话说在前面。<br>");
        message2.writeFooterMessage("你选择我们家驿站服务，我们家免费带你飞。开始旅途后切勿关闭当前页面，这样我们才可以一起浪。<br>" +
            "如果你关闭当前页面则意味着你方毁约，你会处于什么样的位置和状态我们家不会负责。开始旅途后<br>" +
            "请耐心等待，到达目的地后欢迎按钮会自动亮起，点击即可进城。<br>");
        message2.writeFooterMessage("<input type='button' id='moveToTown' style='color: blue' value='开始旅途'>");
        message2.writeFooterMessage("<input type='button' id='moveToCastle' style='color: red' value='回到城堡'>");
        message2.writeFooterMessage("<div id='player' style='display: none'></div>");
        message2.writeFooterMessage("<div id='townId' style='display: none'></div>");
        message2.writeFooterMessage("<div id='castle' style='display: none'></div>");
        message2.writeFooterMessage("<br>");
        message2.writeFooterMessage(generateTownSelectionTableStyleB());

        $("#moveToTown").prop("disabled", true);
        $("#moveToCastle").prop("disabled", true);
    }

    #processMoveToTown() {
        $("#moveToTown").click(function () {
            const destinationTownId = $("input:radio[name='townId']:checked").val();
            if (destinationTownId === undefined) {
                alert("你敢告诉我你到底要去哪里么？");
            } else {
                $("#restButton").prop("disabled", true);
                $("#restButton").attr("style", "display:none");
                $("#returnButton").prop("disabled", true);
                $("#returnButton").attr("style", "display:none");
                $("#moveToTown").prop("disabled", true);
                $("#moveToCastle").prop("disabled", true);
                $(".townClass").prop("disabled", true);

                message2.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
                const townId = $("#townId").text();
                const town = getTown(townId)
                const source = town.coordinate;

                const destinationTown = getTown(destinationTownId);
                const destination = destinationTown.coordinate;

                message2.publishMessageBoard("你设定移动目标为" + destinationTown.name + "。");

                const credential = page2.generateCredential();
                let cash = 0;
                $("td:parent").each(function (_idx, td) {
                    const text = $(td).text();
                    if (text === "所持金") {
                        const cashText = $(td).next().text();
                        cash = parseInt(util.substringBefore(cashText, " GOLD"));
                        $(td).next().attr("id", "cash");
                    }
                });
                const amount = calculateCashDifferenceAmount(cash, 100000);
                withdrawFromTownBank(credential, amount).then(() => {
                    map.leaveTown(credential).then(plan => {
                        plan.source = source;
                        plan.destination = destination;
                        message2.publishMessageBoard("你的目的地坐标" + destination.longText());
                        map.executeMovePlan(plan).then(() => {
                            map.enterTown(credential, destinationTownId).then(() => {
                                depositIntoTownBank(credential, undefined).then(() => {
                                    $("#returnButton").attr("value", destinationTown.name + "欢迎您的到来");
                                    $("#returnButton").removeAttr("style");
                                    $("#returnButton").prop("disabled", false);
                                });
                            });
                        });
                    });
                });
            }
        });
    }

    #processMoveToCastle() {
        $("#moveToCastle").click(function () {
            $("#restButton").prop("disabled", true);
            $("#restButton").attr("style", "display:none");
            $("#returnButton").prop("disabled", true);
            $("#returnButton").attr("style", "display:none");
            $("#moveToTown").prop("disabled", true);
            $("#moveToCastle").prop("disabled", true);
            $(".townClass").prop("disabled", true);

            message2.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
            const townId = $("#townId").text();
            const town = getTown(townId)
            const source = town.coordinate;

            const castleText = $("#castle").text();
            const location = util.substringBefore(castleText, " ");
            const castleName = util.substringAfter(castleText, " ");
            const x = parseInt(util.substringBefore(location, ","));
            const y = parseInt(util.substringAfter(location, ","));
            const destination = new Coordinate(x, y);

            const role = new user.PocketRole();
            role.name = $("#player").text();
            role.townName = town.name;
            role.coordinate = town.coordinate;
            message2.publishMessageBoard("你设定移动目标为" + castleName + "。");

            const credential = page2.generateCredential();
            map.leaveTown(credential).then(plan => {
                plan.source = source;
                plan.destination = destination;
                map.executeMovePlan(plan).then(() => {
                    map.enterCastle(credential).then(() => {
                        message2.publishMessageBoard("你进入了" + castleName + "。");

                        $("form[action='status.cgi']").attr("action", "castlestatus.cgi");
                        $("input:hidden[value='STATUS']").attr("value", "CASTLESTATUS");
                        $("#returnButton").attr("value", castleName + "欢迎您的到来");
                        $("#returnButton").removeAttr("style");
                        $("#returnButton").prop("disabled", false);
                    });
                });
            });
        });
    }
}