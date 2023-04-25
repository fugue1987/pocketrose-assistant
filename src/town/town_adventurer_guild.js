import {isUnavailableTreasureHintMap} from "../common/common_pocket";
import * as page2 from "../common/common_page";
import {_old_createFooterNPC} from "../common/common_page";
import * as user from "../pocket/pocket_user";
import {findTownByName, getTown} from "../pocket/pocket_town";
import * as message2 from "../common/common_message";
import * as map from "../pocket/pocket_map";
import * as util from "../common/common_util";
import {Coordinate} from "../common/common_util";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromTownBank} from "../pocket/pocket_service";

/**
 * 冒险家公会
 */
export class TownAdventurerGuild {

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