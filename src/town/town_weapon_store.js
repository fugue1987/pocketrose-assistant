import * as item from "../pocket/pocket_item";
import * as page from "../common/common_page";

export class TownWeaponStore {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
    const pageHTML = page.currentPageHTML();
    const itemList = item.parseWeaponStoreItemList(pageHTML);
}