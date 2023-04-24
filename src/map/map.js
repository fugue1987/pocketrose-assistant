import * as dashboard from "../dashboard/dashboard";
import {WildPostHouse} from "./map_post_house";

export class WildRequestInterceptor {
    constructor() {
    }

    process() {
        const bodyText = $("body:first").text();
        if (bodyText.includes("请选择移动的格数")) {
            new dashboard.WildDashboardProcessor().process();
        } else if (bodyText.includes("＜＜住所＞＞")) {
            new WildPostHouse().process();
        } else if (bodyText.includes("各国资料")) {
            // 查看势力图
            new dashboard.PocketEventProcessor().process2();
        }
    }
}

