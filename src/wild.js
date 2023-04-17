import * as dashboard from "./dashboard";

export class WildRequestInterceptor {
    constructor() {
    }

    process() {
        const bodyText = $("body:first").text();
        if (bodyText.includes("请选择移动的格数")) {
            new dashboard.WildDashboardProcessor().process();
        }
    }
}