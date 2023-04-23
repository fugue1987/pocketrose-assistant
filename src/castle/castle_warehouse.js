/**
 * ============================================================================
 * [ 城 堡 仓 库 模 块 ]
 * ============================================================================
 */

import * as page from "../common/common_page";
import * as item from "../pocket/pocket_item";

export class CastleWarehouse {

    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    const pageHTML = page.currentPageHTML();
    const itemList = item.parseCastleWarehouseItemList(pageHTML);
    const itemMap = itemList.asMap();

    const table = $("input:checkbox:last").closest("table");
    $(table).find("input:checkbox").each(function (_idx, checkbox) {
        const c1 = $(checkbox).parent();
        const c2 = $(c1).next();
        const c3 = $(c2).next();
        const c4 = $(c3).next();
        const c5 = $(c4).next();
        const c6 = $(c5).next();
        const c7 = $(c6).next();
        const c8 = $(c7).next();
        const c9 = $(c8).next();
        const c10 = $(c9).next();
        const c11 = $(c10).next();
        const c12 = $(c11).next();
        const c13 = $(c12).next();
        const c14 = $(c13).next();
        const c15 = $(c14).next();
        const c16 = $(c15).next();
        const c17 = $(c16).next();

        const index = parseInt($(checkbox).val());
        const item = itemMap[index];
        $(c17).html(item.experienceHTML);
    });

    $("input:submit[value='确定']:last").closest("tr")
        .before($("<tr><td colspan='18' style='color:navy'>城堡仓库目前容量：<b style='color:red'>" + itemList.asList().length + "</b></td></tr>"));

}