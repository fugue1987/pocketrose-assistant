import * as page from "../common/common_page";
import * as dashboard from "../dashboard/dashboard";
import {WildPostHouse} from "./map_post_house";

export class MapRequestInterceptor {

    process() {
        const pageText = page.currentPageText();
        if (pageText.includes("请选择移动的格数")) {
            new dashboard.WildDashboardProcessor().process();
        } else if (pageText.includes("＜＜住所＞＞")) {
            new WildPostHouse().process();
        } else if (pageText.includes("各国资料")) {
            // 查看势力图
            new dashboard.PocketEventProcessor().process2();
        }
    }
}

