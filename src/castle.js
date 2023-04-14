/**
 * ============================================================================
 * [ 城 堡 相 关 功 能 ]
 * ============================================================================
 */

import * as map from "./map";
import * as network from "./network";
import * as util from "./util";

/**
 * 城堡的数据结构
 */
export class Castle {

    #name;              // 城堡名字
    #owner;             // 城堡主人
    #coordinate;        // 城堡坐标

    constructor(name, owner, coordinate) {
        this.#name = name;
        this.#owner = owner;
        this.#coordinate = coordinate;
    }

    /**
     * Get castle name.
     * @returns {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * Get castle owner.
     * @returns {string}
     */
    get owner() {
        return this.#owner;
    }

    /**
     * Get castle _coordinate
     * @returns {map.Coordinate}
     */
    get coordinate() {
        return this.#coordinate;
    }

    longText() {
        return this.#name + "/" + this.#owner + "/" + this.#coordinate.longText();
    }
}

/**
 * 读取所有的城堡信息并回调。
 * @param callback 回调函数
 */
export function getAllCastles(callback) {

    network.sendGetRequest("castle_print.cgi", function (html) {

        const castles = {};

        $(html).find("td").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith(" (自购)")) {
                const name = $(td).prev().text();
                const owner = text.substring(0, text.indexOf(" (自购)"));
                let location = $(td).next().text();
                location = util.substringBetween(location, "(", ")");
                let x = util.substringBefore(location, ",");
                let y = util.substringAfter(location, ",");
                const coordinate = new map.Coordinate(parseInt(x), parseInt(y));
                castles[owner] = new Castle(name, owner, coordinate);
                console.log(castles[owner].longText());
            }
        });

        callback(castles, {"html": html});
    });
}

/**
 * 城堡相关页面的处理入口
 */
export class CastleFunctionalities {

    #text;

    constructor(text) {
        this.#text = text;
    }

    get text() {
        return this.#text;
    }

    process() {
        if (this.#text.includes("在网吧的用户请使用这个退出")) {
            // 根据关键字匹配出城堡首页，重新渲染
            new CastleStatusRenderer().render();
        }

        // 城堡机车建造厂改造成城堡驿站
        // castle.cgi CASTLE_BUILDMACHINE
        if (this.#text.includes("＜＜ * 机车建造厂 *＞＞")) {
            new CastlePostHouseRenderer().render();
        }

        // 城堡有很多中间确认页面，意义不大，平白无故增加了点击的消息
        // 把这些页面修改为自动确认返回，包括以下操作的确认
        // 1. 城堡取钱
        // 2. 城堡存钱
        if (
            this.#text.includes("请善加利用，欢迎您再来！") ||
            this.#text.includes("已经顺利存入您的账户！")
        ) {
            new ConfirmationEliminator().returnToCastle();
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

        $("option[value='CASTLE_BUILDMACHINE']").attr("style", "background: yellow");
        $("option[value='CASTLE_BUILDMACHINE']").text("城堡驿站");
    }
}

/**
 * 城堡驿站渲染器
 */
class CastlePostHouseRenderer {

    render() {
        this.#reformatHTML();
    }

    #reformatHTML() {
        // 把之前的机车建设厂的部分内容隐藏
        const html = $("body:first").html();
        const a1 = util.substringBefore(html, "<center>");
        let left = util.substringAfter(html, "<center>");
        const a2 = util.substringBefore(left, "</center>");
        const a3 = util.substringAfter(left, "</center>");
        const reformat = a1 + "<div style='display: none'>" + a2 + "</div>" + a3;
        console.log(reformat);
        $("body:first").html(reformat);

        // 改名字为“城堡驿站”
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith("＜＜ * 机车建造厂 *＞＞")) {
                const title = "　<font color=#f1f1f1 size=4>　　　＜＜<B> * 城堡驿站 *</B>＞＞</font>";
                $(td).html(title);
            }
        });
    }

}

/**
 * 消除冗余的确认页面，直接点击返回城堡按钮。
 */
class ConfirmationEliminator {

    returnToCastle() {
        $("input:submit[value='返回城堡']").trigger("click");
    }
}