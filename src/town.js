/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as bank from "./bank";
import * as dashboard from "./dashboard";
import * as event from "./message";
import * as geo from "./geo";
import * as map from "./map";
import * as page from "./page";
import * as pocket from "./pocket";
import * as user from "./user";
import * as util from "./util";

/**
 * 用于拦截并处理浏览器访问town.cgi的请求后返回的页面。
 */
export class TownRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body:first").text();
        if (text.includes("城市支配率")) {
            // 战斗后返回城市主页面是town.cgi
            new dashboard.TownDashboardProcessor().process();
        } else if (text.includes("* 宿 屋 *")) {
            new TownInnPostHouse().process();
        } else if (text.includes("* 运 送 屋 *")) {
            new TownItemExpress().process();
        } else if (text.includes("*  藏宝图以旧换新业务 *")) {
            new TownAdventurerGuild().process();
        }
    }
}

/**
 * 客栈+驿站
 */
class TownInnPostHouse {

    constructor() {
    }

    process() {
        this.#renderHTML();

        const credential = page.generateCredential();
        user.loadRole(credential).then(role => {
            const town = pocket.findTownByName(role.townName);
            $(".townClass[value='" + town.id + "']").prop("disabled", true);
            $("#player").text(role.name);
            $("#townId").text(town.id);
            $("#moveToTown").prop("disabled", false);

            user.loadCastle(role.name).then(castle => {
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
        page.findAndCreateMessageBoard("每天的战斗让你疲倦了吧? 来休息一下吧");

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

        const npc = page.createFooterNPC("夜九年");
        npc.welcome("驿站试运营中，先把丑话说在前面。<br>");
        npc.message("你选择我们家驿站服务，我们家免费带你飞。开始旅途后切勿关闭当前页面，这样我们才可以一起浪。<br>" +
            "如果你关闭当前页面则意味着你方毁约，你会处于什么样的位置和状态我们家不会负责。开始旅途后<br>" +
            "请耐心等待，到达目的地后欢迎按钮会自动亮起，点击即可进城。<br>");
        npc.message("<input type='button' id='moveToTown' style='color: blue' value='开始旅途'>");
        npc.message("<input type='button' id='moveToCastle' style='color: red' value='回到城堡'>");
        npc.message("<div id='player' style='display: none'></div>");
        npc.message("<div id='townId' style='display: none'></div>");
        npc.message("<div id='castle' style='display: none'></div>");
        npc.message("<br>");
        npc.message(page.generateTownSelectionTable());

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

                page.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
                const townId = $("#townId").text();
                const town = pocket.getTown(townId)
                const source = town.coordinate;

                const destinationTown = pocket.getTown(destinationTownId);
                const destination = destinationTown.coordinate;

                event.publishMessage(event._event_town_target, {"town": destinationTown.name});

                const credential = page.generateCredential();
                let cash = 0;
                $("td:parent").each(function (_idx, td) {
                    const text = $(td).text();
                    if (text === "所持金") {
                        const cashText = $(td).next().text();
                        cash = parseInt(util.substringBefore(cashText, " GOLD"));
                        $(td).next().attr("id", "cash");
                    }
                });
                const amount = bank.calculateCashDifferenceAmount(cash, 100000);
                bank.withdrawFromTownBank(credential, amount).then(() => {
                    event.publishMessage(event._event_town_withdraw, {"amount": amount});
                    map.leaveTown(credential).then(plan => {
                        plan.source = source;
                        plan.destination = destination;
                        event.publishMessage(event._event_move_source, {"source": source});
                        event.publishMessage(event._event_move_destination, {"destination": destination});
                        map.executeMovePlan(plan).then(() => {
                            map.enterTown(credential, destinationTownId).then(() => {
                                map.publishEvent(map._event_enter_town, {"town": destinationTown.name});
                                bank.depositIntoTownBank(credential, undefined).then(() => {
                                    event.publishMessage(event._event_town_deposit);
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

            page.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
            const townId = $("#townId").text();
            const town = pocket.getTown(townId)
            const source = town.coordinate;

            const castleText = $("#castle").text();
            const location = util.substringBefore(castleText, " ");
            const castleName = util.substringAfter(castleText, " ");
            const x = parseInt(util.substringBefore(location, ","));
            const y = parseInt(util.substringAfter(location, ","));
            const destination = new geo.Coordinate(x, y);

            const role = new user.Role();
            role.name = $("#player").text();
            role.townName = town.name;
            role.coordinate = town.coordinate;
            event.publishMessage(event._event_castle_target, {"castle": castleName});

            const credential = page.generateCredential();
            map.leaveTown(credential).then(plan => {
                plan.source = source;
                plan.destination = destination;
                map.executeMovePlan(plan).then(() => {
                    map.enterCastle(credential).then(() => {
                        event.publishMessage(event._event_castle_enter, {"castle": castleName});

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

/**
 * 城市中的运送屋
 */
class TownItemExpress {

    constructor() {
    }

    process() {
        let cash = 0;
        $("td:parent").each(function (_idx, td) {
            if ($(td).text() === "所持金") {
                cash = parseInt(util.substringBefore($(td).next().text(), " GOLD"));
            }
        });
        const amount = bank.calculateCashDifferenceAmount(cash, 100000);

        this.#renderHTML(cash, amount);

        if ($("#withdrawSend").length > 0) {
            $("#withdrawSend").click(function () {
                const credential = page.generateCredential();
                bank.withdrawFromTownBank(credential, amount).then(() => {
                    $("#sendButton").trigger("click");
                });
            });
        }
    }

    #renderHTML(cash, amount) {
        $("input:submit[value='发送']").attr("id", "sendButton");

        const npc = page.createFooterNPC("末末");
        npc.welcome("我来啦！");
        if (amount === 0) {
            npc.message("让我看看你都偷偷给人送些啥。");
        } else {
            let message = "看起来你身上的钱还差" + amount + "万呀，我可以帮你" +
                "<a href='javascript:void(0)' id='withdrawSend'><b style='color:yellow'>取钱发送</b></a>" +
                "。我办事，你放心！";
            npc.message(message);
        }
    }
}

/**
 * 冒险家公会
 */
class TownAdventurerGuild {

    constructor() {
    }

    process() {
        let treasureHintMapCount = 0;
        $("input:checkbox").each(function (_idx, checkbox) {
            const checkboxName = $(checkbox).attr("name");
            if (checkboxName.startsWith("item")) {
                const mapX = parseInt($(checkbox).parent().next().next().next().next().text());
                const mapY = parseInt($(checkbox).parent().next().next().next().next().next().text());
                if (pocket.isUnavailableTreasureHintMap(mapX, mapY)) {
                    let html = $(checkbox).parent().next().next().html();
                    html = "<b style='color: red'>[城]</b>" + html;
                    $(checkbox).parent().next().next().html(html);
                } else {
                    treasureHintMapCount++;
                }
            }
        });

        this.#renderHTML(treasureHintMapCount);

        const credential = page.generateCredential();
        user.loadRole(credential).then(role => {
            $("#player").text(role.name);
            const town = pocket.findTownByName(role.townName);
            $("#townId").text(town.id);
            $("#coach_1").prop("disabled", false);
            $("#coach_2").prop("disabled", false);
            $("#coach_3").prop("disabled", false);
        });

        $("#coach_1").click(function () {
            alert("滚开，也不看看，什么马车都敢随便上！");
            $("#coach_1").prop("disabled", true);
        });
        $("#coach_2").click(function () {
            alert("下去，你要找的马车在隔壁。");
            $("#coach_2").prop("disabled", true);
        });
        this.#processMoveToWild();
    }

    #renderHTML(mapCount) {
        page.findAndCreateMessageBoard("因为手持城市图不能使用而烦恼吗？");

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
            if (text === "　　　　＜＜ *  藏宝图以旧换新业务 *＞＞") {
                let html = $(td).html();
                html = html.replace("藏宝图以旧换新业务", "冒险家公会");
                $(td).html(html);
            }
        });
        $("th").each(function (_idx, th) {
            const text = $(th).text();
            if (text === "选择") {
                $(th).parent().parent().parent().attr("id", "mapTable");
            }
        });

        $("input:submit[value='交换']").attr("id", "exchangeButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        const npc = page.createFooterNPC("花子");
        npc.welcome("欢、欢、欢迎光临冒险家公会，等等，你这、这是什么表情？你肯定是认错人了，前几天你领薪水后碰、碰到的绝对" +
            "不、不、不是我！[漫长的沉默中] 你、你怎么不相信我的话，人与人之间基本的信、信任呢？[再次漫长的沉默] 算了，你这次要去哪里？" +
            "我免费让人带你过去。你出门去上、上、上马车吧。<br>");

        let select = "";
        select += "<select name='x' id='x'>";
        select += "<option value='-1'>X坐标</option>";
        for (let i = 0; i <= 15; i++) {
            select += "<option value='" + i + "'>" + i + "</option>";
        }
        select += "</select>";
        select += "<select name='y' id='y'>";
        select += "<option value='-1'>Y坐标</option>";
        for (let i = 0; i <= 15; i++) {
            select += "<option value='" + i + "'>" + i + "</option>";
        }
        select += "</select>";
        npc.message(select);
        npc.message("<input type='button' id='coach_1' style='color: blue' value='车门上鸢尾兰的纹章熠熠生辉'>");
        npc.message("<input type='button' id='coach_2' style='color: red' value='车身上剑与盾透露出铁血的气息'>");
        npc.message("<input type='button' id='coach_3' style='color: black' value='斑驳的车身上隐约可见半拉兔子骷髅的形状'>");
        npc.message("<div id='player' style='display: none'></div>");
        npc.message("<div id='townId' style='display: none'></div>");

        $("#coach_1").prop("disabled", true);
        $("#coach_2").prop("disabled", true);
        $("#coach_3").prop("disabled", true);
    }

    #processMoveToWild() {
        $("#coach_3").click(function () {
            const x = parseInt($("#x").val());
            const y = parseInt($("#y").val());

            if (x < 0 || y < 0) {
                alert("你知道怎么选择坐标么？");
            } else {
                const townId = $("#townId").text();
                const town = pocket.getTown(townId);
                if (x === town.coordinate.x && y === town.coordinate.y) {
                    alert("有没有一种可能你现在就在这里？坐标(" + x + "," + y + ")");
                } else {
                    $("#mapTable").attr("style", "display:none");
                    $("#x").prop("disabled", true);
                    $("#y").prop("disabled", true);
                    $("#exchangeButton").prop("disabled", true);
                    $("#exchangeButton").attr("style", "display:none");
                    $("#returnButton").prop("disabled", true);
                    $("#returnButton").attr("style", "display:none");
                    $("#coach_1").prop("disabled", true);
                    $("#coach_2").prop("disabled", true);
                    $("#coach_3").prop("disabled", true);

                    const credential = page.generateCredential();
                    map.leaveTown(credential).then(plan => {
                        plan.source = town.coordinate;
                        plan.destination = new geo.Coordinate(x, y);
                        map.executeMovePlan(plan).then(() => {
                            $("#returnButton").attr("value", "摇摇晃晃走下马车");
                            $("#returnButton").prop("disabled", false);
                            $("#returnButton").removeAttr("style");
                        });
                    });
                }
            }
        });
    }
}