/**
 * ============================================================================
 * [ 分 身 切 换 完 成 ]
 * ============================================================================
 */

import * as page from "../common/common_page";

export class PersonalRoleSwitched {
    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }
}

function doProcess() {
    $("input:submit[value='返回城市']").attr("id", "returnButton");
    $("#returnButton").val("返回装备管理");
    $("#returnButton").attr("tabIndex", 1);
    $("form[action='status.cgi']").attr("action", "mydata.cgi");
    $("input:hidden[value='STATUS']").val("USE_ITEM");
}