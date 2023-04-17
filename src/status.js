import * as bank from "./bank";
import * as dashboard from "./dashboard";
import * as page from "./page";
import * as pocket from "./pocket";
import {__utilities_checkIfEquipmentFullExperience, isUnavailableTreasureHintMap} from "./pocket";
import * as util from "./util";
import * as user from "./user";

export class StatusRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body:first").text();
        if (location.href.includes("/status.cgi")) {
            if (text.includes("城市支配率")) {
                // 城市主页面
                new dashboard.TownDashboardProcessor().process();
            }
        }
        if (location.href.includes("/mydata.cgi")) {
            if (text.includes("仙人的宝物")) {
                // 个人状态查看
                new PersonalStatus().process();
            } else if (text.includes("领取了") || text.includes("下次领取俸禄还需要等待")) {
                // 领取薪水
                new PersonalSalary().process();
            } else if (text.includes("＜＜　|||　物品使用．装备　|||　＞＞")) {
                // 物品使用．装备
                new PersonalItems().process();
            } else if (text.includes("物品 百宝袋 使用")) {
                // 进入百宝袋
                new PersonalTreasureBag().process();
            }
        }
    }
}

class PersonalStatus {

    constructor() {
    }

    process() {
        this.#renderHTML();
    }

    #renderHTML() {
        let attack = -1;
        let defense = -1;
        let specialAttack = -1;
        let specialDefense = -1;
        let speed = -1;
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "攻击力" && attack < 0) {
                attack = parseInt($(td).next().text());
                if (attack === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "防御力" && defense < 0) {
                defense = parseInt($(td).next().text());
                if (defense === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "智力" && specialAttack < 0) {
                specialAttack = parseInt($(td).next().text());
                if (specialAttack === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "精神力" && specialDefense < 0) {
                specialDefense = parseInt($(td).next().text());
                if (specialDefense === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "速度" && speed < 0) {
                speed = parseInt($(td).next().text());
                if (speed === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "现在位置") {
                const location = $(td).next().text();
                const town = pocket.findTownByName(location);
                if (town !== undefined) {
                    $(td).next().text(location + " " + town.coordinate.longText());
                }
            }
            if (text === "经验值") {
                const experience = parseInt($(td).next().text());
                if (experience >= 14900) {
                    $(td).next().attr("style", "color: blue");
                    $(td).next().text("[MAX]");
                }
            }
            if (text === "所持金") {
                const cash = parseInt(util.substringBefore($(td).next().text(), " G"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text.startsWith("荣誉：")) {
                let honorHtml = $(td).html();
                honorHtml = honorHtml.replace(/<br>/g, '');
                $(td).attr("style", "word-break:break-all");
                $(td).html(honorHtml);
            }
        });
    }
}

class PersonalSalary {
    constructor() {
    }

    process() {
        this.#renderHTML();
        if ($("#deposit").length > 0) {
            $("#deposit").click(function () {
                const credential = page.generateCredential();
                bank.depositIntoTownBank(credential, undefined).then(() => {
                    $("#returnButton").trigger("click");
                });
            });
        }
    }

    #renderHTML() {
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        if ($("body:first").text().includes("下次领取俸禄还需要等待")) {
            $("#ueqtweixin").remove();
            $("body:first").children(":last-child").append("<div></div>");
            const npc = page.createFooterNPC("花子");
            npc.welcome("害我也白跑一趟，晦气！");
        } else {
            const npc = page.createFooterNPC("花子");
            npc.welcome("打、打、打劫。不许笑，我跟这儿打劫呢。IC、IP、IQ卡，通通告诉我密码！");
            npc.message("<a href='javascript:void(0)' id='deposit' style='color: yellow'><b>[溜了溜了]</b></a>");
        }
    }
}

class PersonalItems {
    constructor() {
    }

    process() {
        $("input:submit[value='确定']").attr("id", "confirmButton");
        $("input:submit[value='返回上个画面']").attr("id", "returnButton");

        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.startsWith("烟花贺辞")) {
                $("<td colspan='9' id='extMenu'></td>").appendTo($(td).parent());
            }
        });
        $("#extMenu").append($("<input type='button' id='consecrateButton' style='color:red' value='RP祭奠'>"));
        $("#consecrateButton").prop("disabled", true);

        const credential = page.generateCredential();

        $("#consecrateButton").click(function () {
            const cash = page.getRoleCash();
            const amount = bank.calculateCashDifferenceAmount(cash, 1000000);
            bank.withdrawFromTownBank(credential, amount).then(() => {
                $("option[value='USE']").prop("selected", false);
                $("option[value='CONSECRATE']").prop("selected", true);
                $("option[value='PUTINBAG']").prop("selected", false);
                $("#confirmButton").trigger("click");
            });
        });

        user.loadRoleStatus(credential).then(status => {
            if (status.canConsecrate) {
                $("#consecrateButton").prop("disabled", false);
            }
        });
    }
}

class PersonalTreasureBag {

    constructor() {
    }

    process() {
        $("input[type='checkbox']").each(function (_idx, input) {
            let td = $(input).parent();
            let name = $(td).next().text();
            let category = $(td).next().next().text();
            let power = $(td).next().next().next().text();
            let exp = $(td).next().next().next().next().next().next().next().next().next().text();
            if (category === "武器" || category === "防具" || category === "饰品") {
                if (__utilities_checkIfEquipmentFullExperience(name, power, exp)) {
                    let nameHtml = $(td).next().html();
                    nameHtml = "<b style='color:red'>[满]</b>" + nameHtml;
                    $(td).next().html(nameHtml);
                }
            }
            if (category === "物品" && name === "藏宝图") {
                let x = power;
                let y = $(td).next().next().next().next().text();
                if (isUnavailableTreasureHintMap(parseInt(x), parseInt(y))) {
                    let nameHtml = $(td).next().html();
                    nameHtml = "<b style='color: red'>[城]</b>" + nameHtml;
                    $(td).next().html(nameHtml);
                }
            }
        });
    }
}