import * as page from "../common/common_page";

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
    const lastDivHTML = $("div:last").html();

    // 删除旧的页面
    $("form:first").remove();

    // 重组整个页面
    let html = "";
    html += "<hr style='height:0;width:100%'>";
    html += "<div style='text-align:center'>" + lastDivHTML + "</div>";
    $("body:first").html(html);
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