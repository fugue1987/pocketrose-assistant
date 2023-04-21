import * as bank from "./bank";
import * as dashboard from "./dashboard";
import {WildDashboardProcessor} from "./dashboard";
import * as page from "./page";
import * as pocket from "./pocket";
import * as util from "./util";
import * as item from "./item";
import * as network from "./network";
import * as user from "./user";
import * as pet from "./pet";
import * as message from "./message";
import * as option from "./option";
import * as service from "./service";
import * as personal_item_management from "./personal/personal_item_management";

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
                if (option.__cookie_getEnableNewItemUI()) {
                    new personal_item_management.PersonalItemManagement().process();
                }
            } else if (text.includes("物品 百宝袋 使用")) {
                // 进入百宝袋
                new PersonalTreasureBag().process();
            } else if (text.includes("物品 黄金笼子 使用")) {
                // 进入黄金笼子
                new PersonalGoldenCage().process();
            } else if (text.includes("宠物现在升级时学习新技能情况一览")) {
                // 宠物状态
                if (option.__cookie_getEnableNewPetUI()) {
                    new PersonalPetStatus().process();
                }
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

class PersonalTreasureBag {

    constructor() {
    }

    process() {
        const itemList = item.parseTreasureBagItems($("body:first").html());
        const itemMap = item.itemListAsMap(itemList);

        let itemCount = 0;
        $("input:checkbox").each(function (_idx, checkbox) {
            itemCount++;
            const index = parseInt($(checkbox).val());
            const item = itemMap[index];
            $(checkbox).closest("tr").find("td:eq(9)").html(item.experienceHTML);
        });
        $("input:submit[value='从百宝袋中取出']").attr("id", "takeOutButton");
        $("#takeOutButton").attr("type", "button");
        $("input:submit[value='ＯＫ']").attr("id", "returnButton");


        $("#takeOutButton").closest("tr")
            .before($("<tr><td colspan='10' style='color:navy'>百宝袋中目前剩余空位数：" +
                "<b style='color:red'>" + (Math.max(0, 50 - itemCount)) + "</b></td></tr>"));

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

class PersonalGoldenCage {

    constructor() {
    }

    process() {
        $("input:submit[value='从黄金笼子中取出']").attr("id", "takeOutButton");
        $("#takeOutButton").attr("type", "button");
        $("input:submit[value='ＯＫ']").attr("id", "returnButton");

        $("#takeOutButton").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            const select = $("input:radio:checked").val();
            if (select === undefined) {
                // 没有选择要取出的宠物
                return;
            }
            request["select"] = select;
            request["mode"] = "GETOUTLONGZI";
            network.sendPostRequest("mydata.cgi", request, function () {
                const request = credential.asRequest();
                request["mode"] = "USE_ITEM";
                network.sendPostRequest("mydata.cgi", request, function (html) {
                    const itemList = item.parsePersonalItems(html);
                    const cage = item.findGoldenCage(itemList);
                    if (cage === undefined) {
                        $("#returnButton").trigger("click");
                    } else {
                        $("form[action='status.cgi']").attr("action", "mydata.cgi");
                        $("input:hidden[value='STATUS']").attr("value", "PETSTATUS");
                        $("#returnButton").trigger("click");
                    }
                });
            });
        });
    }
}

class PersonalPetStatus {

    constructor() {
    }

    process() {
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        // 读取当前页面的所有宠物信息
        const htmlText = $("body:first").html();
        const petList = pet.parsePetList(htmlText);
        const petStudyStatus = pet.parsePetStudyStatus(htmlText);

        // 初始化宠物管理页面：删除旧有的内容，用特定的div代替
        const p1 = "<center>";
        const p2 = "<div id='npc_place'></div><div id='PetUI'></div>";
        const p3 = "<center>已登陆宠物联赛的宠物一览";
        const p4 = util.substringAfter(htmlText, "<center>已登陆宠物联赛的宠物一览");
        $("body:first").html(p1 + p2 + p3 + p4);

        // 创建其余页面组件
        page.createHeaderNPC("夜九年", "npc_place");
        message.initializeMessageBoard("全新版宠物管理UI正在建设中，敬请期待。");

        // 彩蛋：双击NPC头像进入黄金笼子
        $("#npc_1561").dblclick(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["mode"] = "USE_ITEM";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const itemList = item.parsePersonalItems(html);
                const cage = item.findGoldenCage(itemList);
                if (cage !== undefined) {
                    $("form[action='status.cgi']").attr("action", "mydata.cgi");
                    $("input:hidden[value='STATUS']").attr("value", "USE");
                    $("#returnButton").prepend("<input type='hidden' name='chara' value='1'>");
                    $("#returnButton").prepend("<input type='hidden' name='item" + cage.index + "' value='" + cage.index + "'>");
                    $("#returnButton").trigger("click");
                }
            });
        });

        // 渲染宠物管理UI
        this.#renderPetUI(petList, petStudyStatus);
        this.#bindPetUIButton(petList);
    }

    #renderPetUI(petList, petStudyStatus) {
        let html = "";
        html += "<table style='border-width:0'><tbody>";
        html += "<tr><td style='text-align:center'>";
        html += "<h2 style='color: navy'>＜＜　宠 物 管 理 (v2.0)　＞＞</h2>";
        html += "</td></tr>";
        html += "<tr><td>";
        html += "<table style='border-width:0;background-color:#888888;text-align:center;width:100%'><tbody style='background-color:#F8F0E0'>";

        html += "<tr>";
        html += "<td style='background-color:#EFE0C0'></td>";
        html += "<td style='background-color:#EFE0C0'>使用</td>";
        html += "<td style='background-color:#E8E8D0'>宠物名</td>";
        html += "<td style='background-color:#E8E8D0'>性别</td>";
        html += "<td style='background-color:#E8E8D0'>Ｌｖ</td>";
        html += "<td style='background-color:#E8E8D0'>ＨＰ</td>";
        html += "<td style='background-color:#E8E8D0'>攻击力</td>";
        html += "<td style='background-color:#E8E8D0'>防御力</td>";
        html += "<td style='background-color:#E8E8D0'>智力</td>";
        html += "<td style='background-color:#E8E8D0'>精神力</td>";
        html += "<td style='background-color:#E8E8D0'>速度</td>";
        html += "<td style='background-color:#E8E8D0'>技1</td>";
        html += "<td style='background-color:#E8E8D0'>技2</td>";
        html += "<td style='background-color:#E8E8D0'>技3</td>";
        html += "<td style='background-color:#E8E8D0'>技4</td>";
        html += "<td style='background-color:#E8E8D0'>亲密度</td>";
        html += "<td style='background-color:#E8E8D0'>种类</td>";
        html += "<td style='background-color:#E8E8D0'>属性1</td>";
        html += "<td style='background-color:#E8E8D0'>属性2</td>";
        html += "</tr>";

        for (const pet of petList) {
            html += "<tr>";
            html += "<td style='background-color:#EFE0C0' rowspan='2'>" +
                pet.imageHTML +
                "</td>";
            html += "<td style='background-color:#EFE0C0' rowspan='2'>" +
                (pet.using ? "★" : "") +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                "<b>" + pet.name + "</b>" +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                pet.gender +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                pet.level +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                pet.health + "/" + pet.maxHealth +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.attack >= 375 ? "<b style='color:red'>" + pet.attack + "</b>" : pet.attack) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.defense >= 375 ? "<b style='color:red'>" + pet.defense + "</b>" : pet.defense) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.specialAttack >= 375 ? "<b style='color:red'>" + pet.specialAttack + "</b>" : pet.specialAttack) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.specialDefense >= 375 ? "<b style='color:red'>" + pet.specialDefense + "</b>" : pet.specialDefense) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.speed >= 375 ? "<b style='color:red'>" + pet.speed + "</b>" : pet.speed) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                "<input type='button' class='PetUIButton' id='pet_" + pet.index + "_spell_1' value='" + pet.spell1 + "' title='" + pet.spell1Description + "'>" +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                "<input type='button' class='PetUIButton' id='pet_" + pet.index + "_spell_2' value='" + pet.spell2 + "' title='" + pet.spell2Description + "'>" +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                "<input type='button' class='PetUIButton' id='pet_" + pet.index + "_spell_3' value='" + pet.spell3 + "' title='" + pet.spell3Description + "'>" +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                "<input type='button' class='PetUIButton' id='pet_" + pet.index + "_spell_4' value='" + pet.spell4 + "' title='" + pet.spell4Description + "'>" +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.love >= 100 ? "<b style='color:red'>" + pet.love + "</b>" : pet.love) +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                pet.race +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                pet.attribute1 +
                "</td>";
            html += "<td style='background-color:#E8E8D0'>" +
                (pet.attribute2 === "无" ? "-" : pet.attribute2) +
                "</td>";
            html += "</tr>";
            html += "<tr>";
            html += "<td colspan='17' style='text-align: left'>";        // 当前宠物的操作位置
            html += "<input type='button' class='PetUIButton' value='卸下' id='pet_" + pet.index + "_uninstall'>";
            html += "<input type='button' class='PetUIButton' value='使用' id='pet_" + pet.index + "_install'>";
            html += "<input type='button' class='PetUIButton' value='入笼' id='pet_" + pet.index + "_cage'>";
            html += "<input type='button' class='PetUIButton' value='亲密' id='pet_" + pet.index + "_love'>";
            html += "<input type='button' class='PetUIButton' value='参赛' id='pet_" + pet.index + "_league'>";
            html += "<input type='button' class='PetUIButton' value='献祭' id='pet_" + pet.index + "_consecrate'>";
            html += "<input type='button' class='PetUIButton' value='发送' id='pet_" + pet.index + "_send'>";
            html += "<input type='button' class='PetUIButton' value='改名' id='pet_" + pet.index + "_rename'>&nbsp;";
            html += "<input type='text' id='pet_" + pet.index + "_name_text' size='15' maxlength='20'>";
            html += "</td>";
            html += "</tr>";
        }

        html += "<tr><td style='background-color:#EFE0C0;text-align:right' colspan='19'>";
        html += "<input type='text' id='receiverName' size='15' maxlength='20'>";
        html += "<input type='button' class='PetUIButton' id='searchReceiverButton' value='找人'>";
        html += "<select name='eid' id='receiverCandidates'><option value=''>选择发送对象</select>";
        html += "</td></tr>";
        html += "<tr><td style='background-color:#EFE0C0;text-align:center' colspan='19'>";
        html += "<b style='color:navy'>设置宠物升级时学习技能情况</b>";
        html += "</td></tr>";
        html += "<tr><td style='background-color:#E8E8D0;text-align:center' colspan='19'>";
        html += "<input type='button' class='PetUIButton' value='第１技能位' id='pet_spell_study_1'>";
        html += "<input type='button' class='PetUIButton' value='第２技能位' id='pet_spell_study_2'>";
        html += "<input type='button' class='PetUIButton' value='第３技能位' id='pet_spell_study_3'>";
        html += "<input type='button' class='PetUIButton' value='第４技能位' id='pet_spell_study_4'>";
        html += "</td></tr>";
        html += "<tr><td style='background-color:#E8E8D0;text-align:center' colspan='19'>";
        html += "<input type='button' class='PetUIButton' value='刷新宠物管理界面' id='refreshButton'>";
        html += "</td></tr>";
        html += "</tbody></table>";
        html += "</td></tr>";
        html += "</tbody></table>";

        // 将新的UI渲染到指定的div
        $("#PetUI").append($(html));

        // 根据宠物状态修改按钮的样式
        for (let i = 0; i < petList.length; i++) {
            const pet = petList[i];

            // 设置卸下宠物按钮的状态
            if (!pet.using) {
                let buttonId = "pet_" + pet.index + "_uninstall";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }

            // 设置使用宠物按钮的状态
            if (pet.using) {
                let buttonId = "pet_" + pet.index + "_install";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");

                buttonId = "pet_" + pet.index + "_cage";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }

            // 设置宠物技能按钮的状态
            let spellButtonId = "pet_" + pet.index + "_spell_1";
            if (pet.usingSpell1) {
                $("#" + spellButtonId).css("color", "blue");
            } else {
                $("#" + spellButtonId).css("color", "grey");
            }
            spellButtonId = "pet_" + pet.index + "_spell_2";
            if (pet.usingSpell2) {
                $("#" + spellButtonId).css("color", "blue");
            } else {
                $("#" + spellButtonId).css("color", "grey");
            }
            spellButtonId = "pet_" + pet.index + "_spell_3";
            if (pet.usingSpell3) {
                $("#" + spellButtonId).css("color", "blue");
            } else {
                $("#" + spellButtonId).css("color", "grey");
            }
            spellButtonId = "pet_" + pet.index + "_spell_4";
            if (pet.usingSpell4) {
                $("#" + spellButtonId).css("color", "blue");
            } else {
                $("#" + spellButtonId).css("color", "grey");
            }

            // 设置宠物亲密度按钮的状态
            if (pet.love >= 100) {
                let buttonId = "pet_" + pet.index + "_love";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }

            // 设置宠物联赛按钮的状态
            if (pet.level < 100) {
                let buttonId = "pet_" + pet.index + "_league";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }

            // 设置宠物献祭按钮的状态
            if (pet.level !== 1) {
                let buttonId = "pet_" + pet.index + "_consecrate";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }

            // 设置宠物发送按钮的状态
            if (pet.using) {
                let buttonId = "pet_" + pet.index + "_send";
                $("#" + buttonId).prop("disabled", true);
                $("#" + buttonId).css("color", "grey");
            }
        }

        // 设置技能学习位的按钮样式
        if (petStudyStatus.includes(1)) {
            $("#pet_spell_study_1").css("color", "blue");
        } else {
            $("#pet_spell_study_1").css("color", "grey");
        }
        if (petStudyStatus.includes(2)) {
            $("#pet_spell_study_2").css("color", "blue");
        } else {
            $("#pet_spell_study_2").css("color", "grey");
        }
        if (petStudyStatus.includes(3)) {
            $("#pet_spell_study_3").css("color", "blue");
        } else {
            $("#pet_spell_study_3").css("color", "grey");
        }
        if (petStudyStatus.includes(4)) {
            $("#pet_spell_study_4").css("color", "blue");
        } else {
            $("#pet_spell_study_4").css("color", "grey");
        }
    }

    #bindPetUIButton(petList) {
        for (let i = 0; i < petList.length; i++) {
            const pet = petList[i];
            let buttonId = "pet_" + pet.index + "_uninstall";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetUninstallClick(buttonId);
            }
            buttonId = "pet_" + pet.index + "_install";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetInstallClick(buttonId, pet);
            }
            buttonId = "pet_" + pet.index + "_cage";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetCageClick(buttonId, pet);
            }

            this.#bindPetSpellClick(pet);

            buttonId = "pet_" + pet.index + "_love";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetLoveClick(buttonId, pet);
            }
            buttonId = "pet_" + pet.index + "_league";
            if (!$("#" + buttonId).prop("disabled")) {
            }
            buttonId = "pet_" + pet.index + "_rename";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetRenameClick(buttonId, pet);
            }
            buttonId = "pet_" + pet.index + "_league";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetLeagueClick(buttonId, pet);
            }

            buttonId = "pet_" + pet.index + "_consecrate";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindPetConsecrateClick(buttonId, pet);
            }

            buttonId = "pet_" + pet.index + "_send";
            if (!$("#" + buttonId).prop("disabled")) {
                this.#bindSendPetClickEventHandler(buttonId, pet);
            }
        }

        // 设置宠物技能学习位的按钮行为
        this.#bindPetStudyClick();

        // 设置查找发送对象按钮行为
        this.#bindSearchReceiverClickEventHandler();

        // 设置更新按钮行为
        this.#bindRefreshClickEventHandler();
    }

    #bindPetUninstallClick(buttonId) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = "-1";
            request["mode"] = "CHOOSEPET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
    }

    #bindPetInstallClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "CHOOSEPET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
    }

    #bindPetCageClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PUTINLONGZI";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
    }

    #bindPetSpellClick(pet) {
        const instance = this;
        $("#" + "pet_" + pet.index + "_spell_1").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PETUSESKILL_SET";
            if (page.isColorGrey("pet_" + pet.index + "_spell_1")) {
                // 启用当前的技能
                request["use1"] = "1";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_2")) {
                request["use2"] = "2";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_3")) {
                request["use3"] = "3";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_4")) {
                request["use4"] = "4";
            }
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(pet.name + "技能" + result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#" + "pet_" + pet.index + "_spell_2").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PETUSESKILL_SET";
            if (page.isColorGrey("pet_" + pet.index + "_spell_2")) {
                // 启用当前的技能
                request["use2"] = "2";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_1")) {
                request["use1"] = "1";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_3")) {
                request["use3"] = "3";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_4")) {
                request["use4"] = "4";
            }
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(pet.name + "技能" + result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#" + "pet_" + pet.index + "_spell_3").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PETUSESKILL_SET";
            if (page.isColorGrey("pet_" + pet.index + "_spell_3")) {
                // 启用当前的技能
                request["use3"] = "3";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_1")) {
                request["use1"] = "1";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_2")) {
                request["use2"] = "2";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_4")) {
                request["use4"] = "4";
            }
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(pet.name + "技能" + result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#" + "pet_" + pet.index + "_spell_4").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PETUSESKILL_SET";
            if (page.isColorGrey("pet_" + pet.index + "_spell_4")) {
                // 启用当前的技能
                request["use4"] = "4";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_1")) {
                request["use1"] = "1";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_2")) {
                request["use2"] = "2";
            }
            if (page.isColorBlue("pet_" + pet.index + "_spell_3")) {
                request["use3"] = "3";
            }
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(pet.name + "技能" + result);
                instance.#finishWithRefresh(credential);
            });
        });
    }

    #bindPetLoveClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const expect = Math.ceil(100 - pet.love) * 10000;
            const credential = page.generateCredential();
            user.loadRole(credential)
                .then(role => {
                    const cash = role.cash;
                    const amount = bank.calculateCashDifferenceAmount(cash, expect);
                    bank.withdrawFromTownBank(credential, amount)
                        .then(() => {
                            const request = credential.asRequest();
                            request["mode"] = "PETADDLOVE";
                            request["select"] = pet.index;
                            network.sendPostRequest("mydata.cgi", request, function (html) {
                                const result = $(html).find("h2:first").text();
                                message.writeMessageBoard(result);
                                instance.#finishWithRefresh(credential);
                            });
                        });
                });
        });
    }

    #bindPetRenameClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const textId = "pet_" + pet.index + "_name_text";
            let newName = $("#" + textId).val();
            if (newName !== "") {
                newName = escape(newName);
                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["select"] = pet.index;
                request["name"] = newName;
                request["mode"] = "PETCHANGENAME";
                network.sendPostRequest("mydata.cgi", request, function (html) {
                    const result = $(html).find("h2:first").text();
                    message.writeMessageBoard(result);
                    instance.#finishWithRefresh(credential);
                });
            }
        });
    }

    #bindPetLeagueClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["select"] = pet.index;
            request["mode"] = "PETGAME";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                if (html.includes("ERROR !")) {
                    const result = $(html).find("font b").text();
                    message.writeMessageBoard(result);
                    instance.#finishWithRefresh(credential);
                } else {
                    // 由于目前登陆宠联的操作不会触发页面刷新，因此直接返回主页面
                    $("#returnButton").trigger("click");
                }
            });
        });
    }

    #bindPetConsecrateClick(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            if (!confirm("你确认要献祭宠物" + pet.name + "吗？")) {
                return;
            }
            const credential = page.generateCredential();
            bank.withdrawFromTownBank(credential, 1000)
                .then(() => {
                    service.consecratePet(credential, pet.index)
                        .then(() => {
                            bank.depositIntoTownBank(credential, undefined)
                                .then(() => {
                                    instance.#finishWithRefresh(credential);
                                });
                        });
                });
        });
    }

    #bindSendPetClickEventHandler(buttonId, pet) {
        const instance = this;
        $("#" + buttonId).click(function () {
            const receiver = $("#receiverCandidates").val();
            if (receiver === undefined || receiver === "") {
                message.writeMessageBoard("没有选择发送对象");
                return;
            }
            const credential = page.generateCredential();
            bank.withdrawFromTownBank(credential, 10)
                .then(() => {
                    const request = credential.asRequest();
                    request["mode"] = "PET_SEND2";
                    request["eid"] = receiver;
                    request["select"] = pet.index;
                    network.sendPostRequest("town.cgi", request, function (html) {
                        const successMessage = $(html).find("h2:first").text();
                        message.writeMessageBoard(successMessage);
                        bank.depositIntoTownBank(credential, undefined)
                            .then(() => {
                                instance.#finishWithRefresh(credential);
                            });
                    });
                });
        });
    }

    #bindPetStudyClick() {
        const instance = this;
        $("#pet_spell_study_1").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            const color = $("#pet_spell_study_1").css("color");
            if (color.toString() === "rgb(128, 128, 128)") {
                request["study1"] = "1";
            }
            if (color.toString() === "rgb(0, 0, 255)") {
                // 当前是已经设置学习状态
            }
            request["mode"] = "STUDY_SET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#pet_spell_study_2").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            const color = $("#pet_spell_study_2").css("color");
            if (color.toString() === "rgb(128, 128, 128)") {
                request["study2"] = "2";
            }
            if (color.toString() === "rgb(0, 0, 255)") {
                // 当前是已经设置学习状态
            }
            request["mode"] = "STUDY_SET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#pet_spell_study_3").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            const color = $("#pet_spell_study_3").css("color");
            if (color.toString() === "rgb(128, 128, 128)") {
                request["study3"] = "3";
            }
            if (color.toString() === "rgb(0, 0, 255)") {
                // 当前是已经设置学习状态
            }
            request["mode"] = "STUDY_SET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
        $("#pet_spell_study_4").click(function () {
            const credential = page.generateCredential();
            const request = credential.asRequest();
            const color = $("#pet_spell_study_4").css("color");
            if (color.toString() === "rgb(128, 128, 128)") {
                request["study4"] = "4";
            }
            if (color.toString() === "rgb(0, 0, 255)") {
                // 当前是已经设置学习状态
            }
            request["mode"] = "STUDY_SET";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const result = $(html).find("h2:first").text();
                message.writeMessageBoard(result);
                instance.#finishWithRefresh(credential);
            });
        });
    }

    #bindSearchReceiverClickEventHandler() {
        $("#searchReceiverButton").click(function () {
            const search = $("#receiverName").val();
            if (search.trim() === "") {
                return;
            }
            const credential = page.generateCredential();
            const request = credential.asRequest();
            request["mode"] = "PET_SEND";
            request["serch"] = escape(search.trim());
            network.sendPostRequest("town.cgi", request, function (html) {
                const optionHTML = $(html).find("select[name='eid']").html();
                $("#receiverCandidates").html(optionHTML);
            });
        });
    }

    #bindRefreshClickEventHandler() {
        const instance = this;
        $("#refreshButton").click(function () {
            const credential = page.generateCredential();
            instance.#finishWithRefresh(credential);
        });
    }

    #finishWithRefresh(credential) {
        const instance = this;
        const request = credential.asRequest();
        request["mode"] = "PETSTATUS";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            // 从新的宠物界面中重新解析宠物状态
            const petList = pet.parsePetList(html);
            const petStudyStatus = pet.parsePetStudyStatus(html);
            // 解除当前所有的按钮
            $(".PetUIButton").unbind("click");
            // 清除PetUI的内容
            $("#PetUI").html("");
            // 使用新的宠物重新渲染PetUI
            instance.#renderPetUI(petList, petStudyStatus);
            instance.#bindPetUIButton(petList);
        });
    }
}