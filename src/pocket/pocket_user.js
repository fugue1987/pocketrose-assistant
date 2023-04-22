/**
 * ============================================================================
 * [ 口 袋 用 户 通 用 模 块 ]
 * ============================================================================
 */

import * as network from "../common/common_network";
import * as util from "../common/common_util";
import {Coordinate} from "../common/common_util";
import * as pocket from "../pocket";

export class PocketRole {

    name;               // 姓名
    level;              // 等级
    health;
    maxHealth;
    mana;
    maxMana;
    attack;
    defense;
    specialAttack;
    specialDefense;
    speed;
    attribute;
    location;           // 所在位置(TOWN|CASTLE|WILD)
    coordinate;         // 所在坐标(location=CASTLE)
    castleName;         // 城堡名称(location=CASTLE)
    townName;           // 城市名称(location=TOWN)
    experience;
    cash;
    career;
    masterCareerList;

    asShortText() {
        return this.name + " " + this.level +
            " " + this.health + "/" + this.maxHealth +
            " " + this.mana + "/" + this.maxMana +
            " " + this.attack +
            " " + this.defense +
            " " + this.specialAttack +
            " " + this.specialDefense +
            " " + this.speed;
    }
}

/**
 * 描述角色状态的数据结构
 */
export class PocketRoleStatus {

    canConsecrate;         // 是否可祭奠

}

/**
 * Load role information by specified credential.
 * @param credential User credential.
 * @returns {Promise<PocketRole>}
 */
export async function loadRole(credential) {
    const doParseRole = (html) => {
        const role = new PocketRole();
        role.level = -1;
        role.health = -1;
        role.maxHealth = -1;
        role.mana = -1;
        role.maxMana = -1;
        role.attack = -1;
        role.defense = -1;
        role.specialAttack = -1;
        role.specialDefense = -1;
        role.speed = -1;
        $(html).find("td").each(function (_idx, td) {
            const text = $(td).text();
            if (text.startsWith("姓名 ：")) {
                let s = util.substringAfter(text, "姓名 ： ");
                s = util.substringBefore(s, " (");
                role.name = s;
            }
            if (text.startsWith("Ｌｖ") && role.level < 0) {
                role.level = parseInt(util.substringAfter(text, "Ｌｖ"));
            }
            if (text === "ＨＰ" && role.health < 0) {
                const healthText = $(td).next().text();
                role.health = parseInt(util.substringBefore(healthText, "/"));
                role.maxHealth = parseInt(util.substringAfter(healthText, "/"));
            }
            if (text === "ＭＰ" && role.mana < 0) {
                const manaText = $(td).next().text();
                role.mana = parseInt(util.substringBefore(manaText, "/"));
                role.maxMana = parseInt(util.substringAfter(manaText, "/"));
            }
            if (text === "攻击力" && role.attack < 0) {
                role.attack = parseInt($(td).next().text());
            }
            if (text === "防御力" && role.defense < 0) {
                role.defense = parseInt($(td).next().text());
            }
            if (text === "智力" && role.specialAttack < 0) {
                role.specialAttack = parseInt($(td).next().text());
            }
            if (text === "精神力" && role.specialDefense < 0) {
                role.specialDefense = parseInt($(td).next().text());
            }
            if (text === "速度" && role.speed < 0) {
                role.speed = parseInt($(td).next().text());
            }
            if (text === "属性") {
                role.attribute = $(td).next().text();
            }
            if (text === "现在位置") {
                const locationText = $(td).next().text();
                if (locationText.includes("(") && locationText.includes(")")) {
                    // 在城堡
                    role.location = "CASTLE";
                    const s = util.substringBetween(locationText, "(", ")");
                    const x = util.substringBefore(s, ",");
                    const y = util.substringAfter(s, ",");
                    role.coordinate = new Coordinate(parseInt(x), parseInt(y));
                    role.castleName = util.substringBefore(locationText, " (");
                } else {
                    // 在城市或者野外
                    if (locationText === "野外") {
                        role.location = "WILD";
                    } else {
                        role.location = "TOWN";
                        const town = pocket.findTownByName(locationText);
                        if (town !== undefined) {
                            role.coordinate = town.coordinate;
                            role.townName = town.name;
                        }
                    }
                }
            }
            if (text === "经验值") {
                role.experience = parseInt($(td).next().text());
            }
            if (text === "所持金") {
                const cashText = $(td).next().text();
                role.cash = parseInt(util.substringBefore(cashText, " G"));
            }
            if (text.startsWith("职业：")) {
                role.career = util.substringAfter(text, "职业：");
            }
            if (text.startsWith("掌握职业：")) {
                const masterCareerList = [];
                const careerText = util.substringAfter(text, "掌握职业：");
                for (const it of careerText.split("】【")) {
                    const career = util.substringBetween(it, "【", "】");
                    masterCareerList.push(career);
                }
                role.masterCareerList = masterCareerList;
            }
        });
        return role;
    };

    const doLoadRole = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "STATUS_PRINT";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const role = doParseRole(html);
                resolve(role);
            });
        });
    };
    return await doLoadRole(credential);
}

/**
 * 加载角色的状态，从首页解析
 * @param credential 用户凭证
 * @returns {Promise<PocketRoleStatus>}
 */
export async function loadRoleStatus(credential) {
    const doLoadRoleStatus = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "STATUS";
            network.sendPostRequest("status.cgi", request, function (html) {
                const status = new PocketRoleStatus();
                const text = $(html).text();
                status.canConsecrate = text.includes("可以进行下次祭奠了");
                resolve(status);
            });
        });
    };
    return await doLoadRoleStatus(credential);
}