/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as bank from "./bank";
import * as dashboard from "./dashboard";
import * as message from "./message";
import * as network from "./network";
import * as geo from "./geo";
import * as map from "./map";
import * as page from "./page";
import {generateCredential} from "./page";
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
        } else if (text.includes("＜＜　□　武器屋　□　＞＞")) {
            new TownWeaponStore().process();
        } else if (text.includes("＜＜　□　防具屋　□　＞＞")) {
            new TownArmorStore().process();
        } else if (text.includes("＜＜　□　饰品屋　□　＞＞")) {
            new TownAccessoryStore().process();
        } else if (text.includes("＜＜　□　物品屋　□　＞＞")) {
            new TownItemStore().process();
        } else if (text.includes("* 运 送 屋 *")) {
            new TownItemExpress().process();
        } else if (text.includes("* 宠 物 赠 送 屋 *")) {
            new TownPetExpress().process();
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

                message.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
                const townId = $("#townId").text();
                const town = pocket.getTown(townId)
                const source = town.coordinate;

                const destinationTown = pocket.getTown(destinationTownId);
                const destination = destinationTown.coordinate;

                message.publishMessageBoard(message._message_town_target, {"town": destinationTown.name});

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
                    map.leaveTown(credential).then(plan => {
                        plan.source = source;
                        plan.destination = destination;
                        message.publishMessageBoard(message._message_move_source, {"source": source});
                        message.publishMessageBoard(message._message_move_destination, {"destination": destination});
                        map.executeMovePlan(plan).then(() => {
                            map.enterTown(credential, destinationTownId).then(() => {
                                bank.depositIntoTownBank(credential, undefined).then(() => {
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

            message.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
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
            message.publishMessageBoard(message._message_castle_target, {"castle": castleName});

            const credential = page.generateCredential();
            map.leaveTown(credential).then(plan => {
                plan.source = source;
                plan.destination = destination;
                map.executeMovePlan(plan).then(() => {
                    map.enterCastle(credential).then(() => {
                        message.publishMessageBoard(message._message_castle_enter, {"castle": castleName});

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
 * 武器屋
 */
class TownWeaponStore {
    constructor() {
    }

    process() {
        const npc = page.createFooterNPC("青鸟");
        npc.welcome("武器屋全新改版2.0上线，近期本店进行了升级改造，和银行签署了转账协议，现在所有交易都可以线上完成了。");

        $("input:submit[value='物品卖出']").attr("id", "sellButton");
        $("input:submit[value='买入']").attr("id", "buyButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        page.disableProhibitSellingItems($("table")[5]);

        if ($("select[name='num']").find("option:first").length === 0) {
            $("#buyButton").attr("value", "身上没有富裕空间");
            $("#buyButton").prop("disabled", true);
        }

        $("#sellButton").attr("type", "button");
        $("#sellButton").attr("value", "物品卖出后自动存钱");
        $("#sellButton").click(function () {
            const request = {};
            $("#sellButton").parent().find("input:hidden").each(function (_idx, input) {
                const name = $(input).attr("name");
                request[name] = $(input).val();
            });
            const select = $($("table")[5]).find("input:radio[name='select']:checked").val();
            if (select !== undefined) {
                request["select"] = select;
            }
            if (request["select"] !== undefined) {
                network.sendPostRequest("town.cgi", request, function () {
                    const credential = generateCredential();
                    bank.depositIntoTownBank(credential, undefined).then(() => {
                        const townId = $("input:hidden[name='townid']").val();
                        $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                            "<input type='hidden' name='con_str' value='50'>");
                        $("input:hidden[value='STATUS']").attr("value", "ARM_SHOP");
                        $("form[action='status.cgi']").attr("action", "town.cgi");
                        $("#returnButton").trigger("click");
                    });
                });
            }
        });
        if (!$("#buyButton").prop("disabled")) {
            $("#buyButton").attr("type", "button");
            $("#buyButton").attr("value", "自动取钱购买");
            $("#buyButton").click(function () {
                const radio = $($("table")[7]).find("input:radio[name='select']:checked");
                if (radio.val() !== undefined) {
                    const price = parseInt(util.substringBefore($(radio).parent().next().next().text(), " "));
                    const count = parseInt($("select[name='num']").find("option:selected").val());
                    let totalPrice = price * count;
                    if (totalPrice > 0) {
                        totalPrice = Math.max(10000, totalPrice);
                    }
                    const cash = page.getRoleCash();
                    const amount = bank.calculateCashDifferenceAmount(cash, totalPrice);
                    const credential = page.generateCredential();
                    bank.withdrawFromTownBank(credential, amount).then(() => {
                        const request = {};
                        $($("table")[7]).find("input:hidden").each(function (_idx, input) {
                            const name = $(input).attr("name");
                            request[name] = $(input).val();
                        });
                        request["select"] = radio.val();
                        request["num"] = count;
                        network.sendPostRequest("town.cgi", request, function () {
                            const townId = $("input:hidden[name='townid']").val();
                            $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                                "<input type='hidden' name='con_str' value='50'>");
                            $("input:hidden[value='STATUS']").attr("value", "ARM_SHOP");
                            $("form[action='status.cgi']").attr("action", "town.cgi");
                            $("#returnButton").trigger("click");
                        });
                    });
                }
            });
        }
    }
}

/**
 * 防具屋
 */
class TownArmorStore {
    constructor() {
    }

    process() {
        const npc = page.createFooterNPC("青鸟");
        npc.welcome("防具屋全新改版2.0上线，近期本店进行了升级改造，和银行签署了转账协议，现在所有交易都可以线上完成了。");

        $("input:submit[value='物品卖出']").attr("id", "sellButton");
        $("input:submit[value='买入']").attr("id", "buyButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        page.disableProhibitSellingItems($("table")[5]);

        if ($("select[name='num']").find("option:first").length === 0) {
            $("#buyButton").attr("value", "身上没有富裕空间");
            $("#buyButton").prop("disabled", true);
        }

        $("#sellButton").attr("type", "button");
        $("#sellButton").attr("value", "物品卖出后自动存钱");
        $("#sellButton").click(function () {
            const request = {};
            $("#sellButton").parent().find("input:hidden").each(function (_idx, input) {
                const name = $(input).attr("name");
                request[name] = $(input).val();
            });
            const select = $($("table")[5]).find("input:radio[name='select']:checked").val();
            if (select !== undefined) {
                request["select"] = select;
            }
            if (request["select"] !== undefined) {
                network.sendPostRequest("town.cgi", request, function () {
                    const credential = generateCredential();
                    bank.depositIntoTownBank(credential, undefined).then(() => {
                        const townId = $("input:hidden[name='townid']").val();
                        $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                            "<input type='hidden' name='con_str' value='50'>");
                        $("input:hidden[value='STATUS']").attr("value", "PRO_SHOP");
                        $("form[action='status.cgi']").attr("action", "town.cgi");
                        $("#returnButton").trigger("click");
                    });
                });
            }
        });
        if (!$("#buyButton").prop("disabled")) {
            $("#buyButton").attr("type", "button");
            $("#buyButton").attr("value", "自动取钱购买");
            $("#buyButton").click(function () {
                const radio = $($("table")[7]).find("input:radio[name='select']:checked");
                if (radio.val() !== undefined) {
                    const price = parseInt(util.substringBefore($(radio).parent().next().next().text(), " "));
                    const count = parseInt($("select[name='num']").find("option:selected").val());
                    let totalPrice = price * count;
                    if (totalPrice > 0) {
                        totalPrice = Math.max(10000, totalPrice);
                    }
                    const cash = page.getRoleCash();
                    const amount = bank.calculateCashDifferenceAmount(cash, totalPrice);
                    const credential = page.generateCredential();
                    bank.withdrawFromTownBank(credential, amount).then(() => {
                        const request = {};
                        $($("table")[7]).find("input:hidden").each(function (_idx, input) {
                            const name = $(input).attr("name");
                            request[name] = $(input).val();
                        });
                        request["select"] = radio.val();
                        request["num"] = count;
                        network.sendPostRequest("town.cgi", request, function () {
                            const townId = $("input:hidden[name='townid']").val();
                            $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                                "<input type='hidden' name='con_str' value='50'>");
                            $("input:hidden[value='STATUS']").attr("value", "PRO_SHOP");
                            $("form[action='status.cgi']").attr("action", "town.cgi");
                            $("#returnButton").trigger("click");
                        });
                    });
                }
            });
        }
    }
}

/**
 * 饰品屋
 */
class TownAccessoryStore {
    constructor() {
    }

    process() {
        const npc = page.createFooterNPC("青鸟");
        npc.welcome("饰品屋全新改版2.0上线，近期本店进行了升级改造，和银行签署了转账协议，现在所有交易都可以线上完成了。");

        $("input:submit[value='物品卖出']").attr("id", "sellButton");
        $("input:submit[value='买入']").attr("id", "buyButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        page.disableProhibitSellingItems($("table")[5]);

        if ($("select[name='num']").find("option:first").length === 0) {
            $("#buyButton").attr("value", "身上没有富裕空间");
            $("#buyButton").prop("disabled", true);
        }

        $("#sellButton").attr("type", "button");
        $("#sellButton").attr("value", "物品卖出后自动存钱");
        $("#sellButton").click(function () {
            const request = {};
            $("#sellButton").parent().find("input:hidden").each(function (_idx, input) {
                const name = $(input).attr("name");
                request[name] = $(input).val();
            });
            const select = $($("table")[5]).find("input:radio[name='select']:checked").val();
            if (select !== undefined) {
                request["select"] = select;
            }
            if (request["select"] !== undefined) {
                network.sendPostRequest("town.cgi", request, function () {
                    const credential = generateCredential();
                    bank.depositIntoTownBank(credential, undefined).then(() => {
                        const townId = $("input:hidden[name='townid']").val();
                        $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                            "<input type='hidden' name='con_str' value='50'>");
                        $("input:hidden[value='STATUS']").attr("value", "ACC_SHOP");
                        $("form[action='status.cgi']").attr("action", "town.cgi");
                        $("#returnButton").trigger("click");
                    });
                });
            }
        });
        if (!$("#buyButton").prop("disabled")) {
            $("#buyButton").attr("type", "button");
            $("#buyButton").attr("value", "自动取钱购买");
            $("#buyButton").click(function () {
                const radio = $($("table")[7]).find("input:radio[name='select']:checked");
                if (radio.val() !== undefined) {
                    const price = parseInt(util.substringBefore($(radio).parent().next().next().text(), " "));
                    const count = parseInt($("select[name='num']").find("option:selected").val());
                    let totalPrice = price * count;
                    if (totalPrice > 0) {
                        totalPrice = Math.max(10000, totalPrice);
                    }
                    const cash = page.getRoleCash();
                    const amount = bank.calculateCashDifferenceAmount(cash, totalPrice);
                    const credential = page.generateCredential();
                    bank.withdrawFromTownBank(credential, amount).then(() => {
                        const request = {};
                        $($("table")[7]).find("input:hidden").each(function (_idx, input) {
                            const name = $(input).attr("name");
                            request[name] = $(input).val();
                        });
                        request["select"] = radio.val();
                        request["num"] = count;
                        network.sendPostRequest("town.cgi", request, function () {
                            const townId = $("input:hidden[name='townid']").val();
                            $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                                "<input type='hidden' name='con_str' value='50'>");
                            $("input:hidden[value='STATUS']").attr("value", "ACC_SHOP");
                            $("form[action='status.cgi']").attr("action", "town.cgi");
                            $("#returnButton").trigger("click");
                        });
                    });
                }
            });
        }
    }
}

/**
 * 物品屋
 */
class TownItemStore {
    constructor() {
    }

    process() {
        const npc = page.createFooterNPC("青鸟");
        npc.welcome("物品屋全新改版2.0上线，近期本店进行了升级改造，和银行签署了转账协议，现在所有交易都可以线上完成了。");

        $("input:submit[value='物品卖出']").attr("id", "sellButton");
        $("input:submit[value='买入']").attr("id", "buyButton");
        $("input:submit[value='返回上个画面']").attr("id", "returnButton");

        page.disableProhibitSellingItems($("table")[3]);

        if ($("select[name='num']").find("option:first").length === 0) {
            $("#buyButton").attr("value", "身上没有富裕空间");
            $("#buyButton").prop("disabled", true);
        }

        $("#sellButton").attr("type", "button");
        $("#sellButton").attr("value", "物品卖出后自动存钱");
        $("#sellButton").click(function () {
            const request = {};
            $("#sellButton").parent().find("input:hidden").each(function (_idx, input) {
                const name = $(input).attr("name");
                request[name] = $(input).val();
            });
            const select = $($("table")[3]).find("input:radio[name='select']:checked").val();
            if (select !== undefined) {
                request["select"] = select;
            }
            if (request["select"] !== undefined) {
                network.sendPostRequest("town.cgi", request, function () {
                    const credential = generateCredential();
                    bank.depositIntoTownBank(credential, undefined).then(() => {
                        const townId = $("input:hidden[name='townid']").val();
                        $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                            "<input type='hidden' name='con_str' value='50'>");
                        $("input:hidden[value='STATUS']").attr("value", "ITEM_SHOP");
                        $("form[action='status.cgi']").attr("action", "town.cgi");
                        $("#returnButton").trigger("click");
                    });
                });
            }
        });
        if (!$("#buyButton").prop("disabled")) {
            $("#buyButton").attr("type", "button");
            $("#buyButton").attr("value", "自动取钱购买");
            $("#buyButton").click(function () {
                const radio = $($("table")[5]).find("input:radio[name='select']:checked");
                if (radio.val() !== undefined) {
                    const price = parseInt(util.substringBefore($(radio).parent().next().next().text(), " "));
                    const count = parseInt($("select[name='num']").find("option:selected").val());
                    let totalPrice = price * count;
                    if (totalPrice > 0) {
                        totalPrice = Math.max(10000, totalPrice);
                    }
                    const cash = page.getRoleCash();
                    const amount = bank.calculateCashDifferenceAmount(cash, totalPrice);
                    const credential = page.generateCredential();
                    bank.withdrawFromTownBank(credential, amount).then(() => {
                        const request = {};
                        $($("table")[5]).find("input:hidden").each(function (_idx, input) {
                            const name = $(input).attr("name");
                            request[name] = $(input).val();
                        });
                        request["select"] = radio.val();
                        request["num"] = count;
                        network.sendPostRequest("town.cgi", request, function () {
                            const townId = $("input:hidden[name='townid']").val();
                            $("#returnButton").prepend("<input type='hidden' name='town' value='" + townId + "'>" +
                                "<input type='hidden' name='con_str' value='50'>");
                            $("input:hidden[value='STATUS']").attr("value", "ITEM_SHOP");
                            $("form[action='status.cgi']").attr("action", "town.cgi");
                            $("#returnButton").trigger("click");
                        });
                    });
                }
            });
        }
    }
}

/**
 * 运送屋
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
            const message = "看起来你身上的钱还差" + amount + "万呀，我可以帮你" +
                "<a href='javascript:void(0)' id='withdrawSend'><b style='color:yellow'>取钱发送</b></a>" +
                "。我办事，你放心！";
            npc.message(message);
        }
    }
}

/**
 * 宠物赠送屋
 */
class TownPetExpress {

    constructor() {
    }

    process() {
        $("input[value='发送']").attr("id", "sendButton");

        const npc = page.createFooterNPC("末末");
        npc.welcome("我来啦！");
        npc.message("哈哈，我又来啦！没想到吧？这边还是我。");

        let cash = 0;
        $("td:parent").each(function (_idx, td) {
            if ($(td).text() === "所持金") {
                let goldText = $(td).next().text();
                cash = goldText.substring(0, goldText.indexOf(" "));
            }
        });

        const amount = bank.calculateCashDifferenceAmount(cash, 100000);
        if (amount > 0) {
            const message = "差" + amount + "万，老规矩，还是" +
                "<a href='javascript:void(0)' id='withdrawSend'><b style='color:yellow'>取钱发送</b></a>？";
            npc.message(message);
            $("#withdrawSend").click(function () {
                const credential = page.generateCredential();
                bank.withdrawFromTownBank(credential, amount).then(() => {
                    $("#sendButton").trigger("click");
                });
            });
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
                    if ($("#treasure").length > 0) {
                        $("#treasure").prop("disabled", true);
                    }

                    const player = $("#player").text();
                    message.initializeMessageBoard("放心，实时播报动态我们是专业的，绝对不比隔壁新开张的驿站差：<br>");
                    const credential = page.generateCredential();
                    message.writeMessageBoard(player + "登上了车身斑驳的马车，一股说不出的味道扑鼻而来");
                    message.writeMessageBoard(player + "皱了皱眉头，很不舒服的感觉");
                    message.writeMessageBoard("嘎吱嘎吱声中，马车出发了");

                    map.leaveTown(credential).then(plan => {
                        plan.source = town.coordinate;
                        plan.destination = new geo.Coordinate(x, y);
                        map.executeMovePlan(plan).then(() => {
                            message.writeMessageBoard("\"我们到了\"，车夫粗鲁的喊声惊醒了昏昏欲睡的" + player);
                            message.writeMessageBoard(player + "暗暗发誓再也不乘坐这架马车了");
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
                        if (!pocket.isUnavailableTreasureHintMap(mapX, mapY)) {
                            candidates.push(new geo.Coordinate(mapX, mapY));
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

                    message.initializeMessageBoard("冒险家公会之探险播报：<br>");

                    let cash = 0;
                    $("td:parent").each(function (_idx, td) {
                        const text = $(td).text();
                        if (text === "所持金") {
                            cash = parseInt(util.substringBefore($(td).next().text(), " GOLD"));
                        }
                    });
                    const amount = bank.calculateCashDifferenceAmount(cash, 1100000);
                    const credential = page.generateCredential();
                    bank.withdrawFromTownBank(credential, amount).then(() => {
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
        const town = pocket.getTown(townId);

        // 这个是要探索的完整路线，从本城开始，回到本城。
        const locationList = [];
        locationList.push(town.coordinate);
        locationList.push(...candidates);
        locationList.push(town.coordinate);
        message.publishMessageBoard(message._message_treasure_path, {"pathList": locationList});

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
                message.publishMessageBoard(message._message_treasure_stay_put);
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
            message.publishMessageBoard(message._message_treasure_map_exhausted);
            const plan = new map.MovePlan();
            plan.credential = credential;
            plan.source = from;
            plan.destination = to;
            plan.scope = scope;
            plan.mode = mode;
            map.executeMovePlan(plan).then(() => {
                map.enterTown(credential, town.id).then(() => {
                    bank.depositIntoTownBank(credential, undefined).then(() => {
                        message.publishMessageBoard(message._message_treasure_finish, {
                            "player": player,
                            "foundList": foundList
                        });
                        $("#returnButton").prop("disabled", false);
                        $("#returnButton").attr("value", "欢迎回来");
                        $("#returnButton").removeAttr("style");
                    });
                });
            });
        }
    }
}

