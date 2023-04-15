/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as bank from "./bank";
import * as dashboard from "./dashboard";
import * as page from "./page";
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
        } else if (text.includes("* 运 送 屋 *")) {
            new TownItemExpress().process();
        }
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