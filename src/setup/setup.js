import * as constant from "../common/common_pocket";
import * as message from "../common/common_message";
import * as page from "../common/common_page";
import * as storage from "../common/common_storage";
import * as s001 from "./setup_001";
import * as s002 from "./setup_002";
import * as s003 from "./setup_003";
import * as s004 from "./setup_004";
import * as s005 from "./setup_005";
import * as s006 from "./setup_006";
import * as s007 from "./setup_007";
import * as s008 from "./setup_008";
import * as s009 from "./setup_009";
import * as s010 from "./setup_010";
import * as s011 from "./setup_011";
import * as s012 from "./setup_012";
import * as s013 from "./setup_013";
import * as s014 from "./setup_014";
import * as s015 from "./setup_015";
import * as s016 from "./setup_016";

export function isPokemonWikiEnabled() {
    return storage.getBoolean("_pa_001");
}

export function getLodgeHealthLostRatio() {
    return storage.getFloat("_pa_002", 0.6);
}

export function getLodgeManaLostPoint() {
    return storage.getInteger("_pa_003", 100);
}

export function getRepairMinLimitation() {
    return storage.getInteger("_pa_004", 100);
}

export function getDepositBattleCount() {
    return storage.getInteger("_pa_005", 10);
}

export function isBattleResultAutoScrollEnabled() {
    return storage.getBoolean("_pa_006");
}

export function isBattleForceRecommendationEnabled() {
    return storage.getBoolean("_pa_007");
}

export function isZodiacFlashBattleEnabled() {
    return storage.getBoolean("_pa_008");
}

export function isPetManagementUIEnabled() {
    return storage.getBoolean("_pa_009");
}

export function isItemManagementUIEnabled() {
    return storage.getBoolean("_pa_010");
}

export function isCareerManagementUIEnabled() {
    return storage.getBoolean("_pa_011");
}

export function getBattlePlacePreference(id) {
    let value;
    const s = storage.get("_pa_012_" + id);
    if (s === undefined || s === null || s === "undefined" || s === "null" || s === "") {
        value = {};
        value["primary"] = false;
        value["junior"] = false;
        value["senior"] = false;
        value["zodiac"] = false;
    } else {
        value = JSON.parse(s);
    }
    return value;
}

export function isPocketSuperMarketEnabled() {
    return storage.getBoolean("_pa_013");
}

export function isDisableCareerEntrance(id) {
    return storage.getBoolean("_pa_014_" + id);
}

export function getBattleReturnButtonText() {
    return storage.getString("_pa_015");
}

export function getBattleLodgeButtonText() {
    return storage.getString("_pa_016");
}

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
        "<input type='button' id='refreshButton' value='刷新助手设置'>" +
        "<input type='button' id='returnButton' value='返回上个画面'>" +
        "</td>";
    html += "       </tr>";
    html += "   </tody>";
    html += "</table>";
    html += "<hr style='height:0;width:100%'>";
    html += "<div style='text-align:center'>" + lastDivHTML + "</div>";
    $("body:first").html(html);

    const imageHTML = constant.getNPCImageHTML("夜九年");
    message.createMessageBoardStyleA(imageHTML, "messageBoardContainer");
    message.initializeMessageBoard("在这里我来协助各位维护本机（浏览器）的口袋相关设置。<br>" +
        (storage.isLocalStorageDisabled() ? "你的浏览器不支持本地存储，继续使用Cookie存储。" : "看起来你的浏览器支持本地存储，很好，我们可以继续了。<br>" +
            "对了，因为存储机制的升级，我推荐删除掉之前废弃的Cookie信息以减轻浏览器的压力：" +
            "<input type='button' id='clearButton' value='清除废弃ＣＯＯＫＩＥ'>" +
            "<br>"));

    $("#refreshButton").click(function () {
        const credential = page.generateCredential();
        doRefresh(credential);
    });
    $("#returnButton").click(function () {
        $("#EdenForm").attr("action", "status.cgi");
        $("#EdenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#EdenFormSubmit").trigger("click");
    });
    $("#clearButton").click(function () {
        $("#clearButton").prop("disabled", true);
        const credential = page.generateCredential();
        const keys = __generateLegacyCookieKeyList(credential.id);
        for (const key of keys) {
            Cookies.remove(key);
        }
        message.publishMessageBoard("属于自己的废弃Cookie已经清理。");
    });
    $("#p_1561").dblclick(function () {
        if ($("#battleFieldSetup").length > 0) {
            $("#battleFieldSetup").toggle();
        }
    });

    doRender(credential);
}

const setupItems = [
    new s001.SetupItem(),
    new s002.SetupItem(),
    new s003.SetupItem(),
    new s004.SetupItem(),
    new s005.SetupItem(),
    new s006.SetupItem(),
    new s007.SetupItem(),
    new s008.SetupItem(),
    new s009.SetupItem(),
    new s010.SetupItem(),
    new s011.SetupItem(),
    new s012.SetupItem(),
    new s013.SetupItem(),
    new s014.SetupItem(),
    new s015.SetupItem(),
    new s016.SetupItem()
];

function doRender(credential) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0' id='SetupItemTable'>";
    html += "       <tr>";
    html += "           <th style='background-color:#E8E8D0'>名字</th>";
    html += "           <th style='background-color:#E8E8D0'>专属</th>";
    html += "           <th style='background-color:#EFE0C0'>设置</th>";
    html += "           <th style='background-color:#E0D0B0'>选择</th>";
    html += "       </tr>";
    html += "    </tbody>";
    html += "</table>";
    $("#SetupUI").html(html);
    for (const setupItem of setupItems) {
        setupItem.render(credential.id);
    }
}

function doRefresh(credential) {
    $("#SetupUI").html("");
    $(".SetupUIButton").unbind("click");
    doRender(credential);
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