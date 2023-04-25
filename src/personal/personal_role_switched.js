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
}