/**
 * ============================================================================
 * [ 城 堡 仓 库 模 块 ]
 * ============================================================================
 */

import * as page from "../common/common_page";
import * as item from "../pocket/pocket_item";

export class CastleWarehouse {

    process() {
        const pageHTML = page.currentPageHTML();
        const itemList = item.parseCastleWarehouseItemList(pageHTML);
    }
}