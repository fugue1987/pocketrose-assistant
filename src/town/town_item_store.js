import * as page from "../common/common_page";
import * as item from "../pocket/pocket_item";

export class TownItemStore {

    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    const pageHTML = page.currentPageHTML();
    const itemList = item.parseItemStoreItemList(pageHTML);
    const itemMap = itemList.asMap();
    const table = $("input:radio:first").closest("table");
    $(table).find("input:radio").each(function (_idx, radio) {
        const index = parseInt($(radio).val());
        const item = itemMap[index];
        if (item.using) {
            $(radio).prop("disabled", true);
        } else if (item.isProhibitSellingItem) {
            $(radio).prop("disabled", true);
        }
    });
}