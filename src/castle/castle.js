/**
 * ============================================================================
 * [ 城 堡 相 关 功 能 ]
 * ============================================================================
 */

import * as util from "../common/common_util";
import {CastleWarehouse} from "./castle_warehouse";
import {CastlePostHouse} from "./castle_post_house";

/**
 * 城堡相关页面的处理入口
 */
export class CastleRequestInterceptor {

    constructor() {
    }

    process() {
        const pageText = $("body:first").text();
        if (pageText.includes("在网吧的用户请使用这个退出")) {
            // 根据关键字匹配出城堡首页，重新渲染
            new CastleStatusRenderer().render();
        } else if (pageText.includes("＜＜　|||　城堡仓库　|||　＞＞")) {
            // 城堡仓库
            new CastleWarehouse().process();
        } else if (pageText.includes("＜＜ * 机车建造厂 *＞＞")) {
            // 城堡机车建造厂改造成城堡驿站
            new CastlePostHouse().process();
        } else if (
            pageText.includes("请善加利用，欢迎您再来！") ||
            pageText.includes("已经顺利存入您的账户！") ||
            pageText.includes("从城堡仓库中取出。") ||
            pageText.includes("放入城堡仓库。")
        ) {
            // 城堡有很多中间确认页面，意义不大，平白无故增加了点击的消息
            // 把这些页面修改为自动确认返回
            $("input:submit").trigger("click");
        }
    }
}

/**
 * ----------------------------------------------------------------------------
 * 城堡首页渲染器
 * ----------------------------------------------------------------------------
 * 1. 资金超过100万红色显示。
 * 2. 经验满级时蓝色显示[MAX]。
 * 3. 机车建造(CASTLE_BUILDMACHINE)改造为城堡驿站。
 * ----------------------------------------------------------------------------
 */
class CastleStatusRenderer {

    render() {
        $("td:parent").each(function (_idx, td) {
            const tdText = $(td).text();
            if (tdText === "资金") {
                const cash = parseInt(util.substringBefore($(td).next().text(), " Gold"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color:red");
                }
            }
            if (tdText === "经验值") {
                const exp = parseInt(util.substringBefore($(td).next().text(), " EX"));
                if (exp >= 14900) {
                    $(td).next().attr("style", "color:blue");
                    $(td).next().text("[MAX]");
                }
            }
        });

        $("option[value='CASTLE_BUILDMACHINE']").css("background", "yellow");
        $("option[value='CASTLE_BUILDMACHINE']").text("城堡驿站");
        $("option[value='LETTER']").css("background", "yellow");
        $("option[value='LETTER']").text("口袋助手设置");
    }
}

