import * as constant from "../common/common_constant";
import * as message from "../common/common_message";
import * as page from "../common/common_page";
import * as user from "../pocket/pocket_user";
import * as util from "../common/common_util";

export class PersonalCareerManagement {
    process() {
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
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
        .after($("<tr><td style='background-color:#F8F0E0;text-align:center'>" +
            "<form action='status.cgi' method='post'>" +
            "<input type='hidden' name='id' value='" + credential.id + "'>" +
            "<input type='hidden' name='pass' value='" + credential.pass + "'>" +
            "<input type='hidden' name='mode' value='STATUS'>" +
            "<input type='submit' value='返回城市'>" +
            "</form>" +
            "</td></tr>"));
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