import * as constant from "../common/common_constant";
import * as message from "../common/common_message";
import * as page from "../common/common_page";
import * as storage from "../common/common_storage";

export class PersonalSetup {

    process() {
        page.removeGoogleAnalyticsScript();
        page.removeUnusedHyperLinks();
        doProcess();
    }
}

function doProcess() {
    // 这个页面很奇怪，被一个form完全包裹了
    // 我们需要重组整个页面
    const credential = page.generateCredential();
    const lastDivHTML = $("div:last").html();

    // 删除旧的页面
    $("form:first").remove();

    // 重组整个页面
    let html = "";
    html += "<div id='Eden' style='display:none'>";
    html += "    <form action='' method='post' id='EdenForm'>";
    html += "        <input type='hidden' name='id' value='" + credential.id + "'>";
    html += "        <input type='hidden' name='pass' value='" + credential.pass + "'>";
    html += "        <div style='display:none' id='EdenFormPayload'></div>";
    html += "        <input type='submit' id='EdenFormSubmit'>";
    html += "    </form>";
    html += "</div>";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0'>";
    html += "       <tr>";
    html += "           <td style='background-color:navy;color:yellowgreen;font-size:200%;font-weight:bold'>" +
        "＜＜ 口 袋 助 手 设 置 ＞＞" +
        "</td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='messageBoardContainer'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td id='SetupUI'></td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td style='text-align:center'>" +
        "<input type='button' id='returnButton' value='返回上个画面'>" +
        "</td>";
    html += "       </tr>";
    html += "   </tody>";
    html += "</table>";
    html += "<hr style='height:0;width:100%'>";
    html += "<div style='text-align:center'>" + lastDivHTML + "</div>";
    $("body:first").html(html);

    const imageHTML = constant.getNPCImageHTML("夜九年");
    message.createMessageBoard(imageHTML, "messageBoardContainer");
    message.initializeMessageBoard("在这里我来协助各位维护本机（浏览器）的口袋相关设置。<br>" +
        (storage.isLocalStorageDisabled() ? "你的浏览器不支持本地存储，继续使用Cookie存储。" : "看起来你的浏览器支持本地存储，很好，我们可以继续了。"));

    $("#returnButton").click(function () {
        $("#EdenForm").attr("action", "status.cgi");
        $("#EdenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#EdenFormSubmit").trigger("click");
    });
}


// ----------------------------------------------------------------------------
// P R I V A T E   F U N C T I O N S
// ----------------------------------------------------------------------------

function __generateLegacyCookieKeyList(id) {
    const cookieKeyList = [];
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_POKEMON_WIKI");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_SOLD_AUTO_DEPOSIT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__HEALTH_LOSE_AUTO_LODGE_RATIO");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__MANA_LOSE_AUTO_LODGE_POINT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__DEPOSIT_BATTLE_NUMBER");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__RETURN_BUTTON_TEXT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__DEPOSIT_BUTTON_TEXT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__LODGE_BUTTON_TEXT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__REPAIR_BUTTON_TEXT");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_AUTO_SCROLL");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_FORCE_RECOMMENDATION");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__EQUIPMENT_SET_A_" + id);
    cookieKeyList.push("_POCKETROSE_ASSISTANT__EQUIPMENT_SET_B_" + id);
    cookieKeyList.push("_POCKETROSE_ASSISTANT__EQUIPMENT_SET_C_" + id);
    cookieKeyList.push("_POCKETROSE_ASSISTANT__EQUIPMENT_SET_D_" + id);
    cookieKeyList.push("_POCKETROSE_ASSISTANT__EQUIPMENT_SET_E_" + id);
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_ZODIAC_FLASH_BATTLE");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_NEW_PET_UI");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_NEW_ITEM_UI");
    cookieKeyList.push("_POCKETROSE_ASSISTANT__ENABLE_CAREER_MANAGEMENT_UI");
    return cookieKeyList;
}