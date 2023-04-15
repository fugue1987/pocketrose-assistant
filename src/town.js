/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as bank from "./bank";
import * as dashboard from "./dashboard";
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
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.includes("每天的战斗让你疲倦了吧? 来休息一下吧")) {
                if (_idx === 17) {
                    $(td).attr("id", "messageBoard");
                    $(td).attr("style", "color: white");
                }
            }
        });

        $("input:submit[value='宿泊']").attr("id", "restButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        // $("td:parent").each(function (_idx, td) {
        //     const text = $(td).text();
        //     if (text === "所持金") {
        //         let html = $(td).parent().parent().html();
        //         html += "<tr>" +
        //             "<td style='background-color:#E0D0B0'>计时器</td>" +
        //             "<td style='background-color:#E0D0B0;text-align:right;color:red' colspan=3 id='count_up_timer'>-</td>" +
        //             "</tr>";
        //         $(td).parent().parent().html(html);
        //     }
        // });

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
        npc.message("<div id='townId' style='display: none'></div>");
        npc.message("<div id='castle' style='display: none'></div>");
        npc.message("<br>");
        npc.message(page.generateTownSelectionTable());

        $("#moveToTown").prop("disabled", true);
        $("#moveToCastle").prop("disabled", true);
    }

    #processMoveToTown() {

    }

    #processMoveToCastle() {
        $("#moveToCastle").click(function () {
            alert($("#messageBoard").length);
            page.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");

            $("#restButton").prop("disabled", true);
            $("#returnButton").prop("disabled", true);
            $("#moveToTown").prop("disabled", true);
            $("#moveToCastle").prop("disabled", true);
            $(".townClass").prop("disabled", true);

            //page.initializeMessageBoard("我们将实时为你播报旅途的动态：<br>");
            const castleText = $("#castle").text();
            const location = util.substringBefore(castleText, " ");
            const castleName = util.substringAfter(castleText, " ");
            const x = parseInt(util.substringBefore(location, ","));
            const y = parseInt(util.substringAfter(location, ","));
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