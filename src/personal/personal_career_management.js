import * as constant from "../common/common_constant";
import * as message from "../common/common_message";
import * as network from "../common/common_network";
import * as page from "../common/common_page";
import * as user from "../pocket/pocket_user";
import * as spell from "../pocket/pocket_spell";
import * as career from "../pocket/pocket_career";

export class PersonalCareerManagement {
    process() {
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    $("img[alt='神官']").parent().prev().attr("id", "messageBoard");
    $("img[alt='神官']").parent().prev().css("color", "white");

    const imageHTML = constant.getNPCImageHTML("白皇");
    message.createFooterMessage(imageHTML);
    message.writeFooterMessage("是的，你没有看错，换人了，某幕后黑手不愿意出镜。不过请放心，转职方面我是专业的，毕竟我一直制霸钉耙榜。<br>");

    const pageHTML = page.currentPageHTML();
    const careerCandidateList = doParseCareerCandidateList(pageHTML);

    const credential = page.generateCredential();
    $("table:first").removeAttr("height");
    $("table:first tr:first")
        .next().next().next()
        .html("<td style='background-color:#F8F0E0'>" +
            "<div id='CareerUI'></div><div id='Eden' style='display:none'></div>" +
            "</td>");
    $("table:first tr:first")
        .next().next().next()
        .after($("<tr id='lastRow'><td style='background-color:#F8F0E0;text-align:center'>" +
            "<form action='status.cgi' method='post'>" +
            "<input type='hidden' name='id' value='" + credential.id + "'>" +
            "<input type='hidden' name='pass' value='" + credential.pass + "'>" +
            "<input type='hidden' name='mode' value='STATUS'>" +
            "<input type='submit' value='返回城市'>" +
            "</form>" +
            "</td></tr>"));

    doRender(careerCandidateList);
}

function doParseCareerCandidateList(pageHTML) {
    const careerCandidateList = [];
    $(pageHTML)
        .find("select[name='syoku_no']")
        .find("option")
        .each(function (_idx, option) {
            const value = $(option).val();
            if (value !== "") {
                const career = $(option).text().trim();
                careerCandidateList.push(career);
            }
        });
    return careerCandidateList;
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

            if (role.level > 50) {
                doRenderCareer(role, careerCandidateList);
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
        "<input type='button' id='career_0' value='兵士'>" +
        "<input type='button' id='career_1' value='武士'>" +
        "<input type='button' id='career_2' value='剑客'>" +
        "<input type='button' id='career_3' value='剑侠'>" +
        "<input type='button' id='career_4' value='魔法剑士'>" +
        "<input type='button' id='career_5' value='暗黑剑士'>" +
        "<input type='button' id='career_6' value='奥法剑士'>" +
        "<input type='button' id='career_7' value='魔导剑士'>" +
        "<input type='button' id='career_8' value='神圣剑士'>" +
        "<input type='button' id='career_9' value='圣殿武士'>" +
        "<input type='button' id='career_10' value='剑圣'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>枪系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_11' value='枪战士'>" +
        "<input type='button' id='career_12' value='重战士'>" +
        "<input type='button' id='career_13' value='狂战士'>" +
        "<input type='button' id='career_14' value='龙战士'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>格斗系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_15' value='武僧'>" +
        "<input type='button' id='career_16' value='决斗家'>" +
        "<input type='button' id='career_17' value='拳王'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>魔术系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_18' value='术士'>" +
        "<input type='button' id='career_19' value='魔法师'>" +
        "<input type='button' id='career_20' value='咒灵师'>" +
        "<input type='button' id='career_21' value='大魔导士'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>祭司系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_22' value='牧师'>" +
        "<input type='button' id='career_23' value='德鲁伊'>" +
        "<input type='button' id='career_24' value='贤者'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>弓矢系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_25' value='弓箭士'>" +
        "<input type='button' id='career_26' value='魔弓手'>" +
        "<input type='button' id='career_27' value='狙击手'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>游侠系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_28' value='游侠'>" +
        "<input type='button' id='career_29' value='巡林客'>" +
        "<input type='button' id='career_30' value='吟游诗人'>" +
        "</td>";
    html += "</tr>";

    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>天位系</th>";
    html += "<td style='background-color:#EFE0C0;text-align:left'>" +
        "<input type='button' id='career_31' value='小天位'>" +
        "<input type='button' id='career_32' value='强天位'>" +
        "<input type='button' id='career_33' value='斋天位'>" +
        "<input type='button' id='career_34' value='太天位'>" +
        "<input type='button' id='career_35' value='终极'>" +
        "</td>";
    html += "</tr>";

    html += "</toby>";
    html += "</table>";

    $("#careerCell").html(html);

    // 已经掌握的职业用蓝色标记
    // 没有转职的职业用红色标记
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
            $("#" + buttonId).css("color", "red");
            $("#" + buttonId).css("font-weight", "bold");
        }
        if (!careerCandidateList.includes(careerName)) {
            $("#" + buttonId).prop("disabled", true);
            $("#" + buttonId).css("color", "grey");
            $("#" + buttonId).css("font-weight", "normal");
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

function doRefresh(credential) {
    const request = credential.asRequest();
    request["mode"] = "CHANGE_OCCUPATION";
    network.sendPostRequest("mydata.cgi", request, function (html) {
        const careerCandidateList = doParseCareerCandidateList(html);
        $(".CareerUIButton").unbind("click");
        $("#CareerUI").html("");
        doRender(careerCandidateList);
    });
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