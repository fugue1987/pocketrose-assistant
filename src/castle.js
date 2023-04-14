/**
 * ============================================================================
 * [ 城 堡 相 关 功 能 ]
 * ============================================================================
 */

import * as map from "./map";
import * as network from "./network";
import * as page from "./page";
import * as pocket from "./pocket";
import * as user from "./user";
import * as util from "./util";
import {generateCredential} from "./credential";
import {Coordinate} from "./geo";
import * as finance from "./finance";

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
                const coordinate = new Coordinate(parseInt(x), parseInt(y));
                castles[owner] = new Castle(name, owner, coordinate);
            }
        });

        callback(castles, {"html": html});
    });
}

/**
 * 城堡相关页面的处理入口
 */
export class CastleRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body").text();
        if (text.includes("在网吧的用户请使用这个退出")) {
            // 根据关键字匹配出城堡首页，重新渲染
            new CastleStatusRenderer().render();
        }

        // 城堡机车建造厂改造成城堡驿站
        // castle.cgi CASTLE_BUILDMACHINE
        if (text.includes("＜＜ * 机车建造厂 *＞＞")) {
            new CastlePostHouse().process();
        }

        // 城堡有很多中间确认页面，意义不大，平白无故增加了点击的消息
        // 把这些页面修改为自动确认返回，包括以下操作的确认
        // 1. 城堡取钱
        // 2. 城堡存钱
        if (
            text.includes("请善加利用，欢迎您再来！") ||
            text.includes("已经顺利存入您的账户！")
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
 * 城堡驿站
 */
class CastlePostHouse {

    process() {
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
        $("body:first").html(reformat);

        $("table:first").removeAttr("height");

        let cash = 0;
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith("＜＜ * 机车建造厂 *＞＞")) {
                // 改名字为“城堡驿站”
                const title = "　<font color=#f1f1f1 size=4>　　　＜＜<B> * 城堡驿站 *</B>＞＞</font>";
                $(td).html(title);
            }
            if (text === "机车建造厂是城堡内最重要的设施之一,在这里建造的机车将用于异世界的行动") {
                // 改说明
                $(td).attr("id", "messageBoard");
                $(td).attr("style", "color: white");
                $(td).html("我们已经将城堡中废弃的机车建造厂改造成为了驿站。<br>");
            }
            if (text === "所持金") {
                cash = parseInt(util.substringBefore($(td).next().text(), " GOLD"));
            }
        });

        const npc = page.createFooterNPC("饭饭");
        npc.welcome("轮到我啦，上镜+RP，+RP，+RP，重要的事情喊三遍！<br>");
        npc.message("快看看你想去哪里？<br>");
        npc.message("<input type='button' id='returnTown' style='color: blue' value='选好后立刻出发'><br>");
        npc.message(generateTownSelectionTable());

        const postHouse = this;
        $("#returnTown").click(function () {
            const townId = $("input:radio[name='townId']:checked").val();
            if (townId === undefined) {
                alert("人可以笨，但是不可以这么笨，好歹你先选个目的地，你觉得呢？");
            } else {
                $("input:radio[name='townId']").prop("disabled", true);
                $("input:submit[value='返回城堡']").prop("disabled", true);
                $("#returnTown").prop("disabled", true);

                page.initializeMessageBoard("开始播报实时动态：<br>");
                const town = pocket.getTown(townId);
                page.publishMessageBoard("目的地设定为‘" + town.name + "’");

                if (cash < 100000) {
                    const credential = generateCredential();
                    finance.castleWithdraw(credential, 10).then();
                    page.publishMessageBoard("从城堡提款机支取了10万现金");
                } else {
                    page.publishMessageBoard("身上现金充裕，准备出发");
                }
                postHouse.#travelTo(town);
            }
        });
    }

    #travelTo(town) {
        const credential = generateCredential();
        const roleLoader = new user.RoleLoader(credential);
        roleLoader.load(function (role) {
            map.leaveCastle(credential, role, function (scope, mode) {
                page.publishMessageBoard(role.name + "已经离开城堡'" + role.castleName + "'");
                page.publishMessageBoard(role.name + "当前所在坐标" + role.coordinate.longText());
                page.publishMessageBoard(role.name + "最大移动范围" + scope + "，移动模式" + mode);

                // 创建行程
                const journey = new map.Journey();
                journey.credential = credential;
                journey.role = role;
                journey.source = role.coordinate;
                journey.destination = town.coordinate;
                journey.scope = scope;
                journey.mode = mode;
                journey.start(function () {
                    map.enterTown(credential, town.id, function () {
                        page.publishMessageBoard(role.name + "已经成功到达" + town.name);
                        $("form[action='castlestatus.cgi']").attr("action", "status.cgi");
                        $("input:hidden[value='CASTLESTATUS']").attr("value", "STATUS");
                        $("input:submit[value='返回城堡']").prop("disabled", false);
                        $("input:submit[value='返回城堡']").attr("value", town.name + "欢迎您");
                    });
                });
            })
        });
    }
}

/**
 * 城堡银行
 */
class CastleBank {

    #credential;

    constructor(credential) {
        this.#credential = credential;
    }

    withdraw(amount, callback) {
        const request = this.#credential.asRequest();
        request["mode"] = "CASTLEBANK_BUY";
        request["dasu"] = amount;
        network.sendPostRequest("castle.cgi", request, function () {
            if (callback !== undefined) {
                callback();
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

function generateTownSelectionTable() {
    let html = "";
    html += "<table border='1'><tbody>";
    html += "<thead><tr>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "<td style='color: white'>选择</td>" +
        "<td style='color: white'>目的地</td>" +
        "<td colspan='2' style='color: white'>坐标</td>" +
        "</tr></thead>";

    const townList = pocket.getTownsAsList();
    for (let i = 0; i < 7; i++) {
        const row = [];
        row.push(townList[i * 4]);
        row.push(townList[i * 4 + 1]);
        row.push(townList[i * 4 + 2]);
        row.push(townList[i * 4 + 3]);

        html += "<tr>";
        for (let j = 0; j < row.length; j++) {
            const town = row[j];
            html += "<td><input type='radio' class='townClass' name='townId' value='" + town.id + "'></td>";
            html += "<td style='color: white'>" + town.name + "</td>";
            html += "<td style='color: white'>" + town.coordinate.x + "</td>";
            html += "<td style='color: white'>" + town.coordinate.y + "</td>";
        }
        html += "</tr>";
    }

    html += "</tbody></table>";
    html += "<br>";

    return html;
}