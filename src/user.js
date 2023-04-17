/**
 * ============================================================================
 * [ 用 户 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 1. 角色数据结构定义
 * 2. loadRole = 依据凭证加载角色的信息
 * ============================================================================
 */

import * as geo from "./geo";
import {Coordinate} from "./geo";
import * as network from "./network";
import * as pocket from "./pocket";
import * as util from "./util";

export class Role {

    _name;              // 姓名
    _level;             // 等级
    _health;
    _maxHealth;
    _mana;
    _maxMana;
    _attack;
    _defense;
    _specialAttack;
    _specialDefense;
    _speed;
    _attribute;
    _location;          // 所在位置(TOWN|CASTLE|WILD)
    _coordinate;        // 所在坐标(location=CASTLE)
    _castleName;        // 城堡名称(location=CASTLE)
    _townName;          // 城市名称(location=TOWN)
    _experience;
    _cash;
    _career;

    constructor() {
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get level() {
        return this._level;
    }

    set level(value) {
        this._level = value;
    }

    get health() {
        return this._health;
    }

    set health(value) {
        this._health = value;
    }

    get maxHealth() {
        return this._maxHealth;
    }

    set maxHealth(value) {
        this._maxHealth = value;
    }

    get mana() {
        return this._mana;
    }

    set mana(value) {
        this._mana = value;
    }

    get maxMana() {
        return this._maxMana;
    }

    set maxMana(value) {
        this._maxMana = value;
    }

    get attack() {
        return this._attack;
    }

    set attack(value) {
        this._attack = value;
    }

    get defense() {
        return this._defense;
    }

    set defense(value) {
        this._defense = value;
    }

    get specialAttack() {
        return this._specialAttack;
    }

    set specialAttack(value) {
        this._specialAttack = value;
    }

    get specialDefense() {
        return this._specialDefense;
    }

    set specialDefense(value) {
        this._specialDefense = value;
    }

    get speed() {
        return this._speed;
    }

    set speed(value) {
        this._speed = value;
    }

    get attribute() {
        return this._attribute;
    }

    set attribute(value) {
        this._attribute = value;
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get coordinate() {
        return this._coordinate;
    }

    set coordinate(value) {
        this._coordinate = value;
    }

    get castleName() {
        return this._castleName;
    }

    set castleName(value) {
        this._castleName = value;
    }

    get townName() {
        return this._townName;
    }

    set townName(value) {
        this._townName = value;
    }

    get experience() {
        return this._experience;
    }

    set experience(value) {
        this._experience = value;
    }

    get cash() {
        return this._cash;
    }

    set cash(value) {
        this._cash = value;
    }

    get career() {
        return this._career;
    }

    set career(value) {
        this._career = value;
    }

    asShortText() {
        return this._name + " " + this._level +
            " " + this._health + "/" + this._maxHealth +
            " " + this._mana + "/" + this._maxMana +
            " " + this._attack +
            " " + this._defense +
            " " + this._specialAttack +
            " " + this._specialDefense +
            " " + this._speed;
    }
}

/**
 * Load role information by specified credential.
 * @param credential User credential.
 * @returns {Promise<Role>}
 */
export async function loadRole(credential) {
    const doParseRole = (html) => {
        const role = new Role();
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
                    role.coordinate = new geo.Coordinate(parseInt(x), parseInt(y));
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
     * @returns {Coordinate}
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
function getAllCastles(callback) {

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

        callback(castles);
    });
}

/**
 * 根据姓名查找对应的城堡信息
 * @param player 姓名
 * @returns {Promise<Castle>}
 */
export async function loadCastle(player) {
    const doLoadCastle = (player) => {
        return new Promise((resolve) => {
            getAllCastles(function (castles) {
                const castle = castles[player];
                resolve(castle);
            });
        });
    };
    return await doLoadCastle(player);
}