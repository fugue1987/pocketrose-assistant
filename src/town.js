import * as dashboard from "./dashboard";

/**
 * 用于拦截并处理浏览器访问town.cgi的请求后返回的页面。
 */
export class TownRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body:first").text();
        if (text.includes("城市支配率")) {
            // 城市主页面
            new dashboard.TownDashboardProcessor().process();
        }
    }
}