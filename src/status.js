import * as pocket from "./pocket";
import * as util from "./util";

export class StatusRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body").text();
        // 个人状态查看
        if (text.includes("仙人的宝物")) {
            new PersonalStatus().process();
            return;
        }
    }
}

class PersonalStatus {

    constructor() {
    }

    process() {
        this.#renderHTML();
    }

    #renderHTML() {
        let attack = -1;
        let defense = -1;
        let specialAttack = -1;
        let specialDefense = -1;
        let speed = -1;
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "攻击力" && attack < 0) {
                attack = parseInt($(td).next().text());
                if (attack === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "防御力" && defense < 0) {
                defense = parseInt($(td).next().text());
                if (defense === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "智力" && specialAttack < 0) {
                specialAttack = parseInt($(td).next().text());
                if (specialAttack === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "精神力" && specialDefense < 0) {
                specialDefense = parseInt($(td).next().text());
                if (specialDefense === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "速度" && speed < 0) {
                speed = parseInt($(td).next().text());
                if (speed === 375) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text === "现在位置") {
                const location = $(td).next().text();
                const town = pocket.findTownByName(location);
                if (town !== undefined) {
                    $(td).next().text(location + " " + town.coordinate.longText());
                }
            }
            if (text === "经验值") {
                const experience = parseInt($(td).next().text());
                if (experience >= 14900) {
                    $(td).next().attr("style", "color: blue");
                    $(td).next().text("MAX");
                }
            }
            if (text === "所持金") {
                const cash = parseInt(util.substringBefore($(td).next().text(), " G"));
                if (cash >= 1000000) {
                    $(td).next().attr("style", "color: red");
                }
            }
            if (text.startsWith("荣誉：")) {
                let honorHtml = $(td).html();
                honorHtml = honorHtml.replace(/<br>/g, '');
                $(td).attr("style", "word-break:break-all");
                $(td).html(honorHtml);
            }
        });
    }
}