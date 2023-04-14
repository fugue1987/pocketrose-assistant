/**
 * ============================================================================
 * [ 战 斗 功 能 模 块 ]
 * ============================================================================
 */

export class BattleRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body").text();
        if (text.includes("＜＜ - 秘宝之岛 - ＞＞") ||
            text.includes("＜＜ - 初级之森 - ＞＞") ||
            text.includes("＜＜ - 中级之塔 - ＞＞") ||
            text.includes("＜＜ - 十二神殿 - ＞＞")) {
            $('a[target="_blank"]').attr('tabIndex', -1);
            this.#doProcess();
        }
    }

    #doProcess() {
    }
}