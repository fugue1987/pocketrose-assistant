import * as constant from "../common/common_pocket";
import * as message from "../common/common_message";
import * as network from "../common/common_network";
import * as page from "../common/common_page";
import * as user from "../pocket/pocket_user";
import * as spell from "../pocket/pocket_spell";
import * as career from "../pocket/pocket_career";
import {transferCareerRequirementDict} from "../pocket/pocket_career";

export class PersonalCareerManagement {
    process() {
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    $("table:first tr:first").next().find("table:first td:first")
        .next().next().next().attr("id", "roleStatus");

    $("img[alt='神官']").parent().prev().attr("id", "messageBoard");
    $("img[alt='神官']").parent().prev().css("color", "white");

    const imageHTML = constant.getNPCImageHTML("白皇");
    message.createFooterMessageStyleA(imageHTML);
    message.writeFooterMessage("是的，你没有看错，换人了，某幕后黑手不愿意出镜。不过请放心，转职方面我是专业的，毕竟我一直制霸钉耙榜。<br>");
    message.writeFooterMessage("蓝色的职业代表你已经掌握了。我会把为你推荐的职业红色加深标识出来，当然，前提是如果有能推荐的。<br>");

    const pageHTML = page.currentPageHTML();
    const careerCandidateList = career.parseCareerCandidateList(pageHTML);

    const credential = page.generateCredential();
    $("table:first").removeAttr("height");
    $("table:first tr:first")
        .next().next().next()
        .html("<td style='background-color:#F8F0E0'>" +
            "<div id='CareerUI'></div><div id='Eden' style='display:none'></div>" +
            "</td>");

    $("#Eden").html("" +
        "<form action='' method='post' id='edenForm'>" +
        "        <input type='hidden' name='id' value='" + credential.id + "'>" +
        "        <input type='hidden' name='pass' value='" + credential.pass + "'>" +
        "        <div id='edenFormPayload' style='display:none'></div>" +
        "        <input type='submit' id='edenSubmit'>" +
        "</form>");

    $("table:first tr:first")
        .next().next().next()
        .after($("<tr><td style='background-color:#F8F0E0;text-align:center'>" +
            "<input type='button' value='返回城市' id='returnButton'>" +
            "<input type='button' value='装备管理' id='itemManagementButton'>" +
            "</td></tr>"));

    $("#returnButton").click(function () {
        $("#edenForm").attr("action", "status.cgi");
        $("#edenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#edenSubmit").trigger("click");
    });
    $("#itemManagementButton").click(function () {
        $("#edenForm").attr("action", "mydata.cgi");
        $("#edenFormPayload").html("<input type='hidden' name='mode' value='USE_ITEM'>");
        $("#edenSubmit").trigger("click");
    });


    doRender(careerCandidateList);
}

function doRender(careerCandidateList) {

    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "<tbody style='background-color:#F8F0E0'>";
    html += "<tr>";
    html += "<td id='spellCell'>";
    html += "</td>";
    html += "</tr>";
    html += "<tr>";
    html += "<td id='careerCell'>";
    html += "</td>";
    html += "</tr>";
    html += "</toby>";
    html += "</table>";
    $("#CareerUI").html(html);

    const credential = page.generateCredential();
    user.loadRole(credential)
        .then(role => {

            doRenderRoleStatus(role);

            if (role.level > 50) {
                doRenderCareer(role, careerCandidateList);
                __doBindCareerButton();
            }

            spell.loadSpellList(credential)
                .then(spellList => {
                    doRenderSpell(role, spellList);
                    __doBindSpellButton(spellList);

                });
        });
}

function doRenderCareer(role, careerCandidateList) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "<tbody style='background-color:#F8F0E0'>";
    html += "<tr>";
    html += "<th colspan='7' style='background-color:#E8E8D0;color:navy;text-align:center;font-weight:bold;font-size:120%'>＜＜ 选 择 新 的 职 业 ＞＞</th>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>战士系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_0' value='兵士'>" +
        "<input type='button' class='CareerUIButton' id='career_1' value='武士'>" +
        "<input type='button' class='CareerUIButton' id='career_2' value='剑客'>" +
        "<input type='button' class='CareerUIButton' id='career_3' value='剑侠'>" +
        "<input type='button' class='CareerUIButton' id='career_4' value='魔法剑士'>" +
        "<input type='button' class='CareerUIButton' id='career_5' value='暗黑剑士'>" +
        "<input type='button' class='CareerUIButton' id='career_6' value='奥法剑士'>" +
        "<input type='button' class='CareerUIButton' id='career_7' value='魔导剑士'>" +
        "<input type='button' class='CareerUIButton' id='career_8' value='神圣剑士'>" +
        "<input type='button' class='CareerUIButton' id='career_9' value='圣殿武士'>" +
        "<input type='button' class='CareerUIButton' id='career_10' value='剑圣'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>枪系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_11' value='枪战士'>" +
        "<input type='button' class='CareerUIButton' id='career_12' value='重战士'>" +
        "<input type='button' class='CareerUIButton' id='career_13' value='狂战士'>" +
        "<input type='button' class='CareerUIButton' id='career_14' value='龙战士'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>格斗系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_15' value='武僧'>" +
        "<input type='button' class='CareerUIButton' id='career_16' value='决斗家'>" +
        "<input type='button' class='CareerUIButton' id='career_17' value='拳王'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>魔术系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_18' value='术士'>" +
        "<input type='button' class='CareerUIButton' id='career_19' value='魔法师'>" +
        "<input type='button' class='CareerUIButton' id='career_20' value='咒灵师'>" +
        "<input type='button' class='CareerUIButton' id='career_21' value='大魔导士'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>祭司系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_22' value='牧师'>" +
        "<input type='button' class='CareerUIButton' id='career_23' value='德鲁伊'>" +
        "<input type='button' class='CareerUIButton' id='career_24' value='贤者'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>弓矢系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_25' value='弓箭士'>" +
        "<input type='button' class='CareerUIButton' id='career_26' value='魔弓手'>" +
        "<input type='button' class='CareerUIButton' id='career_27' value='狙击手'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>游侠系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_28' value='游侠'>" +
        "<input type='button' class='CareerUIButton' id='career_29' value='巡林客'>" +
        "<input type='button' class='CareerUIButton' id='career_30' value='吟游诗人'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>天位系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' class='CareerUIButton' id='career_31' value='小天位'>" +
        "<input type='button' class='CareerUIButton' id='career_32' value='强天位'>" +
        "<input type='button' class='CareerUIButton' id='career_33' value='斋天位'>" +
        "<input type='button' class='CareerUIButton' id='career_34' value='太天位'>" +
        "<input type='button' class='CareerUIButton' id='career_35' value='终极'>" +
        "</td>";
    html += "</tr>";

    html += "</toby>";
    html += "</table>";

    $("#careerCell").html(html);

    // 已经掌握的职业用蓝色标记
    // 没有掌握的职业用红色标记（满级的情况下）
    // 不在转职列表中的按钮删除
    if (role.masterCareerList.includes("小天位")) {
        $("#career_32").css("color", "blue");
        $("#career_33").css("color", "blue");
        $("#career_34").css("color", "blue");
        $("#career_35").css("color", "blue");
    }
    const careerNames = Object.keys(career._CAREER_DICT);
    for (let i = 0; i < careerNames.length; i++) {
        const careerName = careerNames[i];
        const careerId = career._CAREER_DICT[careerName]["id"];
        const buttonId = "career_" + careerId;
        if (role.masterCareerList.includes(careerName)) {
            $("#" + buttonId).css("color", "blue");
        } else {
            if (role.level >= 150) {
                $("#" + buttonId).css("color", "red");
                $("#" + buttonId).css("font-weight", "bold");
            }
        }
        if (!careerCandidateList.includes(careerName)) {
            $("#" + buttonId).prop("disabled", true);
            $("#" + buttonId).css("color", "grey");
            $("#" + buttonId).css("font-weight", "normal");
        }
    }

    // 推荐计算
    const recommendations = __doCalculateRecommendationCareers(role, careerCandidateList);
    if (recommendations.length > 0) {
        for (const recommendation of recommendations) {
            const careerId = career._CAREER_DICT[recommendation]["id"];
            const buttonId = "career_" + careerId;
            $("#" + buttonId).css("color", "red");
            $("#" + buttonId).css("font-weight", "bold");
        }
    }
}

function doRenderSpell(role, spellList) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "<tbody style='background-color:#F8F0E0'>";
    html += "<tr>";
    html += "<th colspan='7' style='background-color:#E8E8D0;color:navy;text-align:center;font-weight:bold;font-size:120%'>＜＜ 设 置 技 能 ＞＞</th>";
    html += "</tr>";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>使用</th>";
    html += "<th style='background-color:#EFE0C0'>技能</th>";
    html += "<th style='background-color:#E0D0B0'>威力</th>";
    html += "<th style='background-color:#EFE0C0'>确率</th>";
    html += "<th style='background-color:#E0D0B0'>ＰＰ</th>";
    html += "<th style='background-color:#EFE0C0'>评分</th>";
    html += "<th style='background-color:#E0D0B0'>设置</th>";
    html += "</tr>";
    for (const spell of spellList.asList()) {
        const using = spell.name === role.spell;
        html += "<tr>";
        html += "<td style='background-color:#E8E8D0'>" + (using ? "★" : "") + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + spell.name + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + spell.power + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + spell.accuracy + "</td>";
        html += "<td style='background-color:#E0D0B0'>" + spell.pp + "</td>";
        html += "<td style='background-color:#EFE0C0'>" + spell.score + "</td>";
        html += "<td style='background-color:#E0D0B0'>" +
            "<input type='button' class='CareerUIButton' id='set_spell_" + spell.id + "' value='选择'>" +
            "</td>";
        html += "</tr>";
    }
    html += "</toby>";
    html += "</table>";

    $("#spellCell").html(html);

    for (const spell of spellList.asList()) {
        const using = spell.name === role.spell;
        if (using) {
            const buttonId = "set_spell_" + spell.id;
            $("#" + buttonId).prop("disabled", true);
        }
    }
}

function doRenderRoleStatus(role) {
    let html = "";
    html += "<table style='background-color:#888888;border-width:0'>";
    html += "<tbody>";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>姓名</th>"
    html += "<th style='background-color:#E0D0B0'>ＬＶ</th>"
    html += "<th style='background-color:#EFE0C0'>ＨＰ</th>"
    html += "<th style='background-color:#E8E8D0'>ＭＰ</th>"
    html += "<th style='background-color:#EFE0C0'>攻击</th>"
    html += "<th style='background-color:#EFE0C0'>防御</th>"
    html += "<th style='background-color:#EFE0C0'>智力</th>"
    html += "<th style='background-color:#EFE0C0'>精神</th>"
    html += "<th style='background-color:#EFE0C0'>速度</th>"
    html += "<th style='background-color:#E0D0B0'>属性</th>"
    html += "<th style='background-color:#E8E8D0'>职业</th>"
    html += "</tr>";
    html += "<tr>";
    html += "<td style='background-color:#E8E8D0'>" + role.name + "</td>"
    html += "<td style='background-color:#E0D0B0'>" + role.level + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.health + "/" + role.maxHealth + "</td>"
    html += "<td style='background-color:#E8E8D0'>" + role.mana + "/" + role.maxMana + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.attack + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.defense + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.specialAttack + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.specialDefense + "</td>"
    html += "<td style='background-color:#EFE0C0'>" + role.speed + "</td>"
    html += "<td style='background-color:#E0D0B0'>" + role.attribute + "</td>"
    html += "<td style='background-color:#E8E8D0'>" + role.career + "</td>"
    html += "</tr>";
    html += "</tbody>";
    html += "</table>";

    $("#roleStatus").html(html);
}

function doRefresh(credential) {
    const request = credential.asRequest();
    request["mode"] = "CHANGE_OCCUPATION";
    network.sendPostRequest("mydata.cgi", request, function (html) {
        const careerCandidateList = career.parseCareerCandidateList(html);
        $(".CareerUIButton").unbind("click");
        $("#CareerUI").html("");
        doRender(careerCandidateList);
    });
}

function __doBindCareerButton() {
    const careerNames = Object.keys(career._CAREER_DICT);
    for (let i = 0; i < careerNames.length; i++) {
        const careerName = careerNames[i];
        const careerId = career._CAREER_DICT[careerName]["id"];
        const buttonId = "career_" + careerId;
        if ($("#" + buttonId).length > 0 && !$("#" + buttonId).prop("disabled")) {
            $("#" + buttonId).click(function () {
                const careerId = parseInt($(this).attr("id").split("_")[1]);
                const careerName = career.findCareerNameById(careerId);
                if (!confirm("请确认要转职到" + careerName + "？")) {
                    return;
                }
                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["chara"] = "1";
                request["mode"] = "JOB_CHANGE";
                request["syoku_no"] = careerId;
                network.sendPostRequest("mydata.cgi", request, function (html) {
                    message.processResponseHTML(html);
                    doRefresh(credential);
                });
            });
        }
    }
}

function __doBindSpellButton(spellList) {
    for (const spell of spellList.asList()) {
        const buttonId = "set_spell_" + spell.id;
        if ($("#" + buttonId).length > 0 && !$("#" + buttonId).prop("disabled")) {
            $("#" + buttonId).click(function () {
                const spellId = $(this).attr("id").split("_")[2];
                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["mode"] = "MAGIC_SET";
                request["ktec_no"] = spellId;
                network.sendPostRequest("mydata.cgi", request, function (html) {
                    message.processResponseHTML(html);
                    doRefresh(credential);
                });
            });
        }
    }
}

function __doCalculateRecommendationCareers(role, careerCandidateList) {
    // 没有满级，不推荐
    if (role.level < 150) {
        return [];
    }
    // 没有掌握全部职业，不推荐
    if (role.masterCareerList.length !== 32) {
        return [];
    }
    const recommendations = [];
    const targetCareerNames = Object.keys(transferCareerRequirementDict);
    for (let i = 0; i < targetCareerNames.length; i++) {
        const name = targetCareerNames[i];
        const requirement = transferCareerRequirementDict[name];
        if (role.maxMana >= requirement[0] &&
            role.attack >= requirement[1] &&
            role.defense >= requirement[2] &&
            role.specialAttack >= requirement[3] &&
            role.specialDefense >= requirement[4] &&
            role.speed >= requirement[5]) {
            // 发现了可以推荐的职业
            recommendations.push(name);
        }
    }
    if (recommendations.length === 0) {
        // 没有推荐出来，那么就推荐转职列表中的最后一个吧
        recommendations.push(careerCandidateList[careerCandidateList.length - 1]);
    }
    return recommendations;
}