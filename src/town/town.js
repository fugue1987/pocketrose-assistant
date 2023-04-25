/**
 * ============================================================================
 * [ 城 市 设 施 模 块 ]
 * ============================================================================
 */

import * as dashboard from "../dashboard/dashboard";
import {TownPetMapHouse} from "./town_pet_map_house";
import {TownSuperMarket} from "./town_super_market";
import {isPocketSuperMarketEnabled} from "../setup/setup";
import {TownGemStore} from "./town_gem_store";
import {TownAdventurerGuild} from "./town_adventurer_guild";
import {TownInnPostHouse} from "./town_inn_post_house";

/**
 * 用于拦截并处理浏览器访问town.cgi的请求后返回的页面。
 */
export class TownRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body:first").text();
        if (text.includes("城市支配率")) {
            // 战斗后返回城市主页面是town.cgi
            new dashboard.TownDashboardProcessor().process();
        } else if (text.includes("* 宿 屋 *")) {
            new TownInnPostHouse().process();
        } else if (text.includes("＜＜　□　武器屋　□　＞＞")) {
            if (isPocketSuperMarketEnabled()) {
                new TownSuperMarket().process();
            }
        } else if (text.includes("＜＜ * 合 成 屋 *＞＞")) {
            new TownGemStore().process();
        } else if (text.includes("*  藏宝图以旧换新业务 *")) {
            new TownAdventurerGuild().process();
        } else if (text.includes("* 宠物图鉴 *")) {
            new TownPetMapHouse().process();
        }
    }
}

