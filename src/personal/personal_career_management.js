import * as constant from "../common/common_constant";
import * as message from "../common/common_message";
import * as network from "../common/common_network";
import * as page from "../common/common_page";
import * as user from "../pocket/pocket_user";
import * as util from "../common/common_util";
import * as spell from "../pocket/pocket_spell";

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
    const role = doParseRole(pageHTML);

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

function doParseRole(pageHTML) {
    const role = new user.PocketRole();
    const table = $(pageHTML).find("input:radio").closest("table");
    role.name = $(table).find("tr:eq(1) td:first").text();
    role.level = parseInt($(table).find("tr:eq(1) td:eq(1)").text());
    let s = $(table).find("tr:eq(1) td:eq(2)").text();
    role.health = parseInt(util.substringBeforeSlash(s));
    role.maxHealth = parseInt(util.substringAfterSlash(s));
    s = $(table).find("tr:eq(1) td:eq(3)").text();
    role.mana = parseInt(util.substringBeforeSlash(s));
    role.maxMana = parseInt(util.substringAfterSlash(s));
    role.attribute = $(table).find("tr:eq(1) td:eq(4)").text();
    role.career = $(table).find("tr:eq(1) td:eq(5)").text();
    role.cash = parseInt(util.substringBefore($(table).find("tr:eq(2) td:eq(1)").text(), " GOLD"));
    return role;
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

            spell.loadSpellList(credential)
                .then(spellList => {
                    doRenderSpell(role, spellList);
                    __doBindSpellButton(spellList);

                });
        });
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