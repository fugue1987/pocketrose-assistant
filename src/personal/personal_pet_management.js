/**
 * ============================================================================
 * [ 宠 物 管 理 模 块 ]
 * ============================================================================
 */

import * as message from "../common/common_message";
import * as page from "../common/common_page";
import * as pet from "../pocket/pocket_pet";
import * as util from "../common/util";
import * as network from "../network";
import * as user from "../pocket/pocket_user";
import * as bank from "../bank";
import * as service from "../service";
import * as item from "../pocket/pocket_item";

export class PersonalPetManagement {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
    $("input:submit[value='返回城市']").attr("id", "returnButton");

    // 读取当前页面的所有宠物信息
    const pageHTML = page.currentPageHTML();
    const petList = pet.parsePersonalPetList(pageHTML);
    const petStudyStatus = pet.parsePersonalPetStudyStatus(pageHTML);

    // 初始化宠物管理页面：删除旧有的内容，用特定的div代替
    const p1 = "<center>";
    const p2 = "<div id='messageBoardContainer'></div><div id='PetUI'></div>";
    const p3 = "<center>已登陆宠物联赛的宠物一览";
    const p4 = util.substringAfter(pageHTML, "<center>已登陆宠物联赛的宠物一览");
    $("body:first").html(p1 + p2 + p3 + p4);

    // 创建其余页面组件
    message.createMessageBoard(undefined, "messageBoardContainer");
    message.initializeMessageBoard("全新宠物管理UI，持续建设中......");
    $("#messageBoardContainer").find("img:first").attr("id", "goldenCage");
    __bindGoldCage();

    // 渲染宠物管理UI
    doRender(petList, petStudyStatus);
}

function doRender(petList, petStudyStatus) {
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

    for (const pet of petList.asList()) {
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
    for (let i = 0; i < petList.asList().length; i++) {
        const pet = petList.asList()[i];

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

    // 绑定按钮点击事件处理
    doBind(petList);
}

function doBind(petList) {
    for (let i = 0; i < petList.asList().length; i++) {
        const pet = petList.asList()[i];
        let buttonId = "pet_" + pet.index + "_uninstall";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetUninstallButton(buttonId);
        }
        buttonId = "pet_" + pet.index + "_install";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetInstallButton(buttonId, pet);
        }
        buttonId = "pet_" + pet.index + "_cage";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetCageButton(buttonId, pet);
        }

        __bindPetSpellButton(pet);

        buttonId = "pet_" + pet.index + "_love";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetLoveButton(buttonId, pet);
        }
        buttonId = "pet_" + pet.index + "_league";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetLeagueButton(buttonId, pet);
        }
        buttonId = "pet_" + pet.index + "_rename";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetRenameButton(buttonId, pet);
        }

        buttonId = "pet_" + pet.index + "_consecrate";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetConsecrateButton(buttonId, pet);
        }

        buttonId = "pet_" + pet.index + "_send";
        if (!$("#" + buttonId).prop("disabled")) {
            __bindPetSendButton(buttonId, pet);
        }
    }

    // 设置宠物技能学习位的按钮行为
    __bindPetStudyButton();

    // 设置查找发送对象按钮行为
    __bindSearchReceiverButton();

    // 设置更新按钮行为
    __bindRefreshButton();
}

function doRefresh(credential) {
    const request = credential.asRequest();
    request["mode"] = "PETSTATUS";
    network.sendPostRequest("mydata.cgi", request, function (html) {
        // 从新的宠物界面中重新解析宠物状态
        const petList = pet.parsePersonalPetList(html);
        const petStudyStatus = pet.parsePersonalPetStudyStatus(html);
        // 解除当前所有的按钮
        $(".PetUIButton").unbind("click");
        // 清除PetUI的内容
        $("#PetUI").html("");
        // 使用新的宠物重新渲染PetUI
        doRender(petList, petStudyStatus);
    });
}

function __bindGoldCage() {
    $("#goldenCage").dblclick(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["mode"] = "USE_ITEM";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            const itemList = item.parsePersonalItemList(html);
            const cage = itemList.goldenCage;
            if (cage !== undefined) {
                $("form[action='status.cgi']").attr("action", "mydata.cgi");
                $("input:hidden[value='STATUS']").attr("value", "USE");
                $("#returnButton").prepend("<input type='hidden' name='chara' value='1'>");
                $("#returnButton").prepend("<input type='hidden' name='item" + cage.index + "' value='" + cage.index + "'>");
                $("#returnButton").trigger("click");
            }
        });
    });
}

function __bindPetUninstallButton(buttonId) {
    $("#" + buttonId).click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["select"] = "-1";
        request["mode"] = "CHOOSEPET";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindPetInstallButton(buttonId, pet) {
    $("#" + buttonId).click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["select"] = pet.index;
        request["mode"] = "CHOOSEPET";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindPetCageButton(buttonId, pet) {
    $("#" + buttonId).click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["select"] = pet.index;
        request["mode"] = "PUTINLONGZI";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindPetSpellButton(pet) {
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindPetLoveButton(buttonId, pet) {
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
                            message.processResponseHTML(html);
                            doRefresh(credential);
                        });
                    });
            });
    });
}

function __bindPetRenameButton(buttonId, pet) {
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
                message.processResponseHTML(html);
                doRefresh(credential);
            });
        }
    });
}

function __bindPetLeagueButton(buttonId, pet) {
    $("#" + buttonId).click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["select"] = pet.index;
        request["mode"] = "PETGAME";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            if (html.includes("ERROR !")) {
                const result = $(html).find("font b").text();
                message.publishMessageBoard(result);
                doRefresh(credential);
            } else {
                // 由于目前登陆宠联的操作不会触发页面刷新，因此直接返回主页面
                $("#returnButton").trigger("click");
            }
        });
    });
}

function __bindPetConsecrateButton(buttonId, pet) {
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
                                doRefresh(credential);
                            });
                    });
            });
    });
}

function __bindPetSendButton(buttonId, pet) {
    $("#" + buttonId).click(function () {
        const receiver = $("#receiverCandidates").val();
        if (receiver === undefined || receiver === "") {
            message.publishMessageBoard("没有选择发送对象");
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
                    message.processResponseHTML(html);
                    bank.depositIntoTownBank(credential, undefined)
                        .then(() => {
                            doRefresh(credential);
                        });
                });
            });
    });
}

function __bindPetStudyButton() {
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
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
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindSearchReceiverButton() {
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

function __bindRefreshButton() {
    $("#refreshButton").click(function () {
        const credential = page.generateCredential();
        doRefresh(credential);
    });
}