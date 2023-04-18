import * as bank from "./bank";
import * as dashboard from "./dashboard";
import {WildDashboardProcessor} from "./dashboard";
import * as page from "./page";
import * as pocket from "./pocket";
import {__utilities_checkIfEquipmentFullExperience, isUnavailableTreasureHintMap} from "./pocket";
import * as util from "./util";
import * as item from "./item";
import * as network from "./network";
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
            if (text.includes("请选择移动的格数")) {
                new WildDashboardProcessor().process();
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
            } else if (text.includes("宠物现在升级时学习新技能情况一览")) {
                // 宠物状态
                new PersonPetStatus().process();
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

        $("table:first").removeAttr("height");
        $("table:first tr:first").after($("<tr><td style='background-color:#E8E8D0' id='header_npc'></td></tr>"));
        page.createHeaderNPC("末末", "header_npc");
        page.initializeMessageBoard("我在这里说明一下，个人物品装备目前正处于升级改造阶段。");

        // 标记ajax动态修改区域
        $("input:checkbox").each(function (_idx, checkbox) {
            $(checkbox).parent().parent().attr("class", "item_class");
        });

        // 增加扩展菜单区域1
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.startsWith("烟花贺辞")) {
                $("<td colspan='9' id='extMenu'></td>").appendTo($(td).parent());
            }
        });
        $("#extMenu").append($("<input type='button' id='treasureBagButton' style='color:blue' value='打开百宝袋'>"));
        $("#extMenu").append($("<input type='button' id='goldenCageButton' style='color:green' value='打开黄金笼子'>"));
        $("#treasureBagButton").prop("disabled", true);
        $("#goldenCageButton").prop("disabled", true);

        // 增加扩展菜单区域2
        $("td:contains('所持金')")
            .filter(function () {
                return $(this).text() === "所持金";
            })
            .closest("table")
            .find("tbody:first")
            .append($("<TR><TD colspan='6' style='background-color:#E0D0B0' id='extMenu2'></TD></TR>"));

        const items = item.parsePersonalItems();
        const treasureBag = item.findTreasureBag(items);
        const goldenCage = item.findGoldenCage(items);
        const itemsMap = {};
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            itemsMap[item.index] = item;
        }
        $("input:checkbox").each(function (_idx, checkbox) {
            const item = itemsMap[_idx];
            if (item !== undefined && item.isFullExperience) {
                let nameHTML = $(checkbox).parent().next().next().html();
                nameHTML = "<b style='color:red'>[满]</b>" + nameHTML;
                $(checkbox).parent().next().next().html(nameHTML);
            }
        });

        if (treasureBag !== undefined) {
            $("#treasureBagButton").prop("disabled", false);
        }
        if (goldenCage !== undefined) {
            $("#goldenCageButton").prop("disabled", false);
        }

        $("#treasureBagButton").click(function () {
            $("input:checkbox").each(function (_idx, checkbox) {
                if (_idx === treasureBag.index) {
                    $(checkbox).prop("checked", true);
                } else {
                    $(checkbox).prop("checked", false);
                }
            });
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("#confirmButton").trigger("click");
        });
        $("#goldenCageButton").click(function () {
            $("input:checkbox").each(function (_idx, checkbox) {
                if (_idx === goldenCage.index) {
                    $(checkbox).prop("checked", true);
                } else {
                    $(checkbox).prop("checked", false);
                }
            });
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("#confirmButton").trigger("click");
        });

        const npc = page.createFooterNPC("饭饭");
        npc.welcome("我就要一键祭奠，就要，就要！");
        npc.message("<input type='button' id='consecrateButton' style='color:darkred' value='祭奠选择的装备'>");
        $("#consecrateButton").prop("disabled", true);

        $("#consecrateButton").click(function () {
            const request = page.generateCredential().asRequest();
            let usingCount = 0;
            const itemNames = [];
            $("input:checkbox:checked").each(function (_idx, checkbox) {
                const name = $(checkbox).attr("name");
                request[name] = $(checkbox).val();
                if ($(checkbox).parent().next().text() === "★") {
                    usingCount++;
                }
                itemNames.push($(checkbox).parent().next().next().text());
            });
            if (itemNames.length === 0) {
                alert("我以为你会知道，至少也要选择一件想要祭奠的装备。");
                return;
            }
            if (usingCount > 0) {
                alert("对不起，出于安全原因，正在使用中的装备不能祭奠！");
                return;
            }
            request["chara"] = "1";
            request["mode"] = "CONSECRATE";

            const ret = confirm("请务必确认你将要祭奠的这些装备：" + itemNames.join());
            if (!ret) {
                return;
            }

            const cashText = $("td:contains('所持金')")
                .filter(function () {
                    return $(this).text() === "所持金";
                })
                .next()
                .text();
            const cash = util.substringBefore(cashText, " GOLD");
            const amount = bank.calculateCashDifferenceAmount(cash, 1000000);
            bank.withdrawFromTownBank(page.generateCredential(), amount)
                .then(() => {
                    network.sendPostRequest("mydata.cgi", request, function (html) {
                        $("#returnButton").trigger("click");
                    });
                });
        });

        user.loadRoleStatus(page.generateCredential())
            .then(status => {
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
        $("input:submit[value='从百宝袋中取出']").attr("id", "takeOutButton");
        $("#takeOutButton").attr("type", "button");
        $("input:submit[value='ＯＫ']").attr("id", "returnButton");

        $("#takeOutButton").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            let checkedCount = 0;
            $("input[type='checkbox']:checked").each(function (_idx, checkbox) {
                checkedCount++;
                const name = $(checkbox).attr("name");
                request[name] = $(checkbox).attr("value");
            });
            if (checkedCount === 0) {
                // 没有选择要取出的物品/装备
                return;
            }
            request["mode"] = "GETOUTBAG";
            network.sendPostRequest("mydata.cgi", request, function () {
                $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                $("form[action='status.cgi']").attr("action", "mydata.cgi");
                $("#returnButton").trigger("click");
            });
        });
    }
}

class PersonPetStatus {

    constructor() {
    }

    process() {
    }
}