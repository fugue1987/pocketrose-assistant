/**
 * ============================================================================
 * [ 城 市 超 市 模 块 ]
 * ----------------------------------------------------------------------------
 * 基于之前的武器屋页面，综合了武器屋、防具屋、饰品屋和物品屋。
 * ============================================================================
 */

import * as page from "../common/common_page";
import * as util from "../common/common_util";
import * as item from "../pocket/pocket_item";
import * as merchandise from "../pocket/pocket_merchandise";
import * as user from "../pocket/pocket_user";

export class TownSuperMarket {
    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    // 先保存页面上的需要信息
    const pageHTML = page.currentPageHTML();
    const userImage = page.findFirstUserImageHTML(pageHTML);
    const role = doParseRole();
    const personalEquipmentList = item.parseWeaponStoreItemList(pageHTML);
    const weaponStoreMerchandiseList = merchandise.parseWeaponStoreMerchandiseList(pageHTML);
}

function doParseRole() {
    const role = new user.PocketRole();
    const table = $("td:contains('所持金')")
        .filter(function () {
            return $(this).text() === "所持金";
        })
        .closest("table");
    role.name = $(table).find("tr:eq(1) td:first").text();
    role.level = parseInt($(table).find("tr:eq(1) td:eq(1)").text());
    role.attribute = $(table).find("tr:eq(1) td:eq(2)").text();
    role.career = $(table).find("tr:eq(1) td:eq(3)").text();
    let s = $(table).find("tr:eq(2) td:eq(1)").text();
    s = util.substringBefore(s, " GOLD");
    role.cash = parseInt(s);
    return role;
}