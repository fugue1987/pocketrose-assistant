/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as page2 from "../common/common_page";
import {_old_createFooterNPC, generateTownSelectionTable} from "../common/common_page";
import * as dashboard from "../dashboard/dashboard";
import * as map from "../pocket/pocket_map";
import * as user from "../pocket/pocket_user";
import * as util from "../common/common_util";
import {Coordinate} from "../common/common_util";
import * as castle from "../pocket/pocket_castle";
import {findTownByName, getTown} from "../pocket/pocket_town";
import {TownPetMapHouse} from "./town_pet_map_house";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromTownBank} from "../pocket/pocket_service";
import * as message2 from "../common/common_message";
import {TownSuperMarket} from "./town_super_market";
import {isPocketSuperMarketEnabled} from "../setup/setup";
import {isUnavailableTreasureHintMap} from "../common/common_pocket";
import {TownGemStore} from "./town_gem_store";

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
        } else if (text.includes("＜＜　□　武器屋　□　＞＞")) {
            if (isPocketSuperMarketEnabled()) {
                new TownSuperMarket().process();
            }
        } else if (text.includes("＜＜ * 合 成 屋 *＞＞")) {
            new TownGemStore().process();
        } else if (text.includes("*  藏宝图以旧换新业务 *")) {
            new TownAdventurerGuild().process();
        } else if (text.includes("* 宠物图鉴 *")) {
            new TownPetMapHouse().process();
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

        const npc = _old_createFooterNPC("夜九年");
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
        npc.message(generateTownSelectionTable());

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
                if (isUnavailableTreasureHintMap(mapX, mapY)) {
                    let html = $(checkbox).parent().next().next().html();
                    html = "<b style='color: red'>[城]</b>" + html;
                    $(checkbox).parent().next().next().html(html);
                } else {
                    treasureHintMapCount++;
                }
            }
        });

        this.#renderHTML(treasureHintMapCount);

        const credential = page2.generateCredential();
        user.loadRole(credential).then(role => {
            $("#player").text(role.name);
            const town = findTownByName(role.townName);
            $("#townId").text(town.id);
            $("#coach_1").prop("disabled", false);
            $("#coach_2").prop("disabled", false);
            $("#coach_3").prop("disabled", false);
            if ($("#treasure").length > 0) {
                $("#treasure").prop("disabled", false);
            }
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
        this.#processTreasure();
    }

    #renderHTML(mapCount) {
        const td = $("td:contains('因为手持城市图不能使用而烦恼吗？')")
            .filter(function () {
                return $(this).text().startsWith("因为手持城市图不能使用而烦恼吗？");
            });
        td.attr("id", "messageBoard");
        td.css("color", "white");

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

        const npc = _old_createFooterNPC("花子");
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
        if (mapCount > 0) {
            npc.message("<br>");
            npc.message("什、什、什么？？你有藏宝图！要不要去试试手气？在上面选好你想探险的藏宝图。<br>");
            npc.message("<input type='button' id='treasure' style='color: red' value='带上藏宝图跟上兔子骷髅的脚步'>");
        }

        $("#coach_1").prop("disabled", true);
        $("#coach_2").prop("disabled", true);
        $("#coach_3").prop("disabled", true);
        if ($("#treasure").length > 0) {
            $("#treasure").prop("disabled", true);
        }
    }

    #processMoveToWild() {
        $("#coach_3").click(function () {
            const x = parseInt($("#x").val());
            const y = parseInt($("#y").val());

            if (x < 0 || y < 0) {
                alert("你知道怎么选择坐标么？");
            } else {
                const townId = $("#townId").text();
                const town = getTown(townId);
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
                    if ($("#treasure").length > 0) {
                        $("#treasure").prop("disabled", true);
                    }

                    const player = $("#player").text();
                    message2.initializeMessageBoard("放心，实时播报动态我们是专业的，绝对不比隔壁新开张的驿站差：<br>");
                    const credential = page2.generateCredential();
                    message2.publishMessageBoard(player + "登上了车身斑驳的马车，一股说不出的味道扑鼻而来");
                    message2.publishMessageBoard(player + "皱了皱眉头，很不舒服的感觉");
                    message2.publishMessageBoard("嘎吱嘎吱声中，马车出发了");

                    map.leaveTown(credential).then(plan => {
                        plan.source = town.coordinate;
                        plan.destination = new Coordinate(x, y);
                        map.executeMovePlan(plan).then(() => {
                            message2.publishMessageBoard("\"我们到了\"，车夫粗鲁的喊声惊醒了昏昏欲睡的" + player);
                            message2.publishMessageBoard(player + "暗暗发誓再也不乘坐这架马车了");
                            $("#returnButton").attr("value", "摇摇晃晃走下马车");
                            $("#returnButton").prop("disabled", false);
                            $("#returnButton").removeAttr("style");
                        });
                    });
                }
            }
        });
    }

    #processTreasure() {
        const inst = this;
        if ($("#treasure").length > 0) {
            $("#treasure").click(function () {
                const candidates = [];
                $("input:checkbox:checked").each(function (_idx, checkbox) {
                    const checkboxName = $(checkbox).attr("name");
                    if (checkboxName.startsWith("item")) {
                        const mapX = parseInt($(checkbox).parent().next().next().next().next().text());
                        const mapY = parseInt($(checkbox).parent().next().next().next().next().next().text());
                        if (!isUnavailableTreasureHintMap(mapX, mapY)) {
                            candidates.push(new Coordinate(mapX, mapY));
                        }
                    }
                });
                if (candidates.length === 0) {
                    alert("咱们就是说你好歹带上一张能用的藏宝图？");
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
                    $("#treasure").prop("disabled", true);

                    message2.initializeMessageBoard("冒险家公会之探险播报：<br>");

                    let cash = 0;
                    $("td:parent").each(function (_idx, td) {
                        const text = $(td).text();
                        if (text === "所持金") {
                            cash = parseInt(util.substringBefore($(td).next().text(), " GOLD"));
                        }
                    });
                    const amount = calculateCashDifferenceAmount(cash, 1100000);
                    const credential = page2.generateCredential();
                    withdrawFromTownBank(credential, amount).then(() => {
                        const player = $("#player").text();
                        const townId = $("#townId").text();
                        inst.#startTreasureSeeking(credential, player, townId, candidates);
                    });
                }
            });
        }
    }

    #startTreasureSeeking(credential, player, townId, candidates) {
        const inst = this;
        candidates.sort((a, b) => {
            let ret = a.x - b.x;
            if (ret === 0) {
                ret = a.y - b.y;
            }
            return ret;
        });
        const town = getTown(townId);

        // 这个是要探索的完整路线，从本城开始，回到本城。
        const locationList = [];
        locationList.push(town.coordinate);
        locationList.push(...candidates);
        locationList.push(town.coordinate);
        if (locationList.length !== 0) {
            let msg = "探险顺序：";
            for (let i = 0; i < locationList.length; i++) {
                const it = locationList[i];
                msg += it.longText();
                if (i !== locationList.length - 1) {
                    msg += "=>";
                }
            }
            message2.publishMessageBoard(msg);
        }

        const foundList = [];
        map.leaveTown(credential).then(plan => {
            const scope = plan.scope;
            const mode = plan.mode;
            inst.#seekTreasure(credential, player, town, scope, mode, locationList, 0, foundList);
        });
    }

    #seekTreasure(credential, player, town, scope, mode, locationList, locationIndex, foundList) {
        const inst = this;

        const from = locationList[locationIndex];
        const to = locationList[locationIndex + 1];

        if (locationIndex !== locationList.length - 2) {
            if (from.x === to.x && from.y === to.y) {
                // 下一张图在原地
                message2.publishMessageBoard("兔子骷髅对你说：运气真好，原地可以继续探险。");
                map.explore(credential).then(found => {
                    foundList.push(found);
                    inst.#seekTreasure(credential, player, town, scope, mode, locationList, locationIndex + 1, foundList);
                });
            } else {
                const plan = new map.MovePlan();
                plan.credential = credential;
                plan.source = from;
                plan.destination = to;
                plan.scope = scope;
                plan.mode = mode;
                map.executeMovePlan(plan).then(() => {
                    map.explore(credential).then(found => {
                        foundList.push(found);
                        inst.#seekTreasure(credential, player, town, scope, mode, locationList, locationIndex + 1, foundList);
                    });
                });
            }
        } else {
            // 最后一个坐标已经完成了探险。现在可以回城了
            message2.publishMessageBoard("你的藏宝图已经用完，准备回城。");
            const plan = new map.MovePlan();
            plan.credential = credential;
            plan.source = from;
            plan.destination = to;
            plan.scope = scope;
            plan.mode = mode;
            map.executeMovePlan(plan).then(() => {
                map.enterTown(credential, town.id).then(() => {
                    depositIntoTownBank(credential, undefined).then(() => {
                        message2.publishMessageBoard("探险完成，在兔子骷髅不怀好意的挥手注视下，你快速离开了。");
                        if (foundList.length > 0) {
                            message2.publishMessageBoard("你回到无人处，悄悄检视了下探险的收入：");
                            for (let i = 0; i < foundList.length; i++) {
                                message2.publishMessageBoard("<b style='color: yellow'>" + foundList[i] + "</b>");
                            }
                        }

                        $("#returnButton").prop("disabled", false);
                        $("#returnButton").attr("value", "欢迎回来");
                        $("#returnButton").removeAttr("style");
                    });
                });
            });
        }
    }
}

