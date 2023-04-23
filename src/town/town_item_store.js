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
}