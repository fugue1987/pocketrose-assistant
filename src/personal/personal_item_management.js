/**
 * ============================================================================
 * [ 装 备 管 理 模 块 ]
 * ============================================================================
 */

import * as item from "../pocket/pocket_item";

export class PersonalItemManagement {
    process() {
        doProcess();
    }
}

function doProcess() {
    // 首先从老页面上解析所有的装备信息
    const itemList = item.parsePersonalItemList($("body:first").html());
    console.log(JSON.stringify(itemList.asMap()));
}

