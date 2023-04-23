/**
 * ============================================================================
 * [ 商 品 模 块 ]
 * ----------------------------------------------------------------------------
 * 在武器屋、防具屋、饰品屋和物品屋中出售的商品。
 * ============================================================================
 */

import * as util from "../common/common_util";

export class Merchandise {

    id;
    name;
    nameHTML;
    price;
    power;
    weight;
    endure;
    attribute;
    requiredCareer;             // 需要的职业
    requiredAttack;             // 需要的攻击力
    requiredDefense;            // 需要的防御力
    requiredSpecialAttack;      // 需要的智力
    requiredSpecialDefense;     // 需要的精神力
    requiredSpeed;              // 需要的速度
    weaponCategory;             // 武器类型
    gemCount;                   // 可镶嵌宝石数
    speciality;                 // 特产商品

}

export class MerchandiseList {

    #merchandiseList;

    constructor() {
        this.#merchandiseList = [];
    }

    push(merchandise) {
        this.#merchandiseList.push(merchandise)
    }

    get asList() {
        return this.#merchandiseList;
    }

    get asMap() {
        const map = {};
        for (const merchandise of this.#merchandiseList) {
            map[merchandise.id] = merchandise;
        }
        return map;
    }

    get size() {
        return this.#merchandiseList.length;
    }
}

/**
 * Parse merchandise list from weapon store page HTML.
 * @param pageHTML
 * @returns {MerchandiseList}
 */
export function parseWeaponStoreMerchandiseList(pageHTML) {
    const merchandiseList = new MerchandiseList();
    const table = $(pageHTML).find("input:radio:last").closest("table");
    let specialityMatch = false;
    $(table).find("tr").each(function (_idx, tr) {
        const c1 = $(tr).find(":first-child");
        const radio = $(c1).find("input:radio:first");
        if (radio.length > 0) {
            const merchandise = new Merchandise();
            merchandise.id = "WEA_" + $(radio).val();

            const c2 = $(c1).next();
            const c3 = $(c2).next();
            const c4 = $(c3).next();
            const c5 = $(c4).next();
            const c6 = $(c5).next();
            const c7 = $(c6).next();
            const c8 = $(c7).next();
            const c9 = $(c8).next();
            const c10 = $(c9).next();
            const c11 = $(c10).next();
            const c12 = $(c11).next();
            const c13 = $(c12).next();
            const c14 = $(c13).next();
            const c15 = $(c14).next();

            merchandise.name = $(c2).text();
            merchandise.nameHTML = $(c2).html();
            let s = $(c3).text();
            s = util.substringBefore(s, " Gold");
            merchandise.price = parseInt(s);
            merchandise.power = parseInt($(c4).text());
            merchandise.weight = parseInt($(c5).text());
            merchandise.endure = parseInt($(c6).text());
            merchandise.attribute = $(c7).text();
            merchandise.requiredCareer = $(c8).text();
            merchandise.requiredAttack = parseInt($(c9).text());
            merchandise.requiredDefense = parseInt($(c10).text());
            merchandise.requiredSpecialAttack = parseInt($(c11).text());
            merchandise.requiredSpecialDefense = parseInt($(c12).text());
            merchandise.requiredSpeed = parseInt($(c13).text());
            merchandise.weaponCategory = $(c14).text();
            merchandise.gemCount = parseInt($(c15).text());
            merchandise.speciality = specialityMatch;

            merchandiseList.push(merchandise);
        } else if ($(c1).text() === "== 特产武器 ==") {
            specialityMatch = true;
        }
    });
    return merchandiseList;
}

/**
 * Parse merchandise list from armor store page HTML.
 * @param pageHTML
 * @returns {MerchandiseList}
 */
export function parseArmorStoreMerchandiseList(pageHTML) {
    const merchandiseList = new MerchandiseList();
    const table = $(pageHTML).find("input:radio:last").closest("table");
    let specialityMatch = false;
    $(table).find("tr").each(function (_idx, tr) {
        const c1 = $(tr).find(":first-child");
        const radio = $(c1).find("input:radio:first");
        if (radio.length > 0) {
            const merchandise = new Merchandise();
            merchandise.id = "ARM_" + $(radio).val();

            const c2 = $(c1).next();
            const c3 = $(c2).next();
            const c4 = $(c3).next();
            const c5 = $(c4).next();
            const c6 = $(c5).next();
            const c7 = $(c6).next();
            const c8 = $(c7).next();
            const c9 = $(c8).next();
            const c10 = $(c9).next();
            const c11 = $(c10).next();
            const c12 = $(c11).next();
            const c13 = $(c12).next();
            const c14 = $(c13).next();

            merchandise.name = $(c2).text();
            merchandise.nameHTML = $(c2).html();
            let s = $(c3).text();
            s = util.substringBefore(s, " Gold");
            merchandise.price = parseInt(s);
            merchandise.power = parseInt($(c4).text());
            merchandise.weight = parseInt($(c5).text());
            merchandise.endure = parseInt($(c6).text());
            merchandise.attribute = $(c7).text();
            merchandise.requiredCareer = $(c8).text();
            merchandise.requiredAttack = parseInt($(c9).text());
            merchandise.requiredDefense = parseInt($(c10).text());
            merchandise.requiredSpecialAttack = parseInt($(c11).text());
            merchandise.requiredSpecialDefense = parseInt($(c12).text());
            merchandise.requiredSpeed = parseInt($(c13).text());
            merchandise.weaponCategory = "-";
            merchandise.gemCount = parseInt($(c14).text());
            merchandise.speciality = specialityMatch;

            merchandiseList.push(merchandise);
        } else if ($(c1).text() === "== 特产防具 ==") {
            specialityMatch = true;
        }
    });
    return merchandiseList;
}

/**
 * Parse merchandise list from accessory store page HTML.
 * @param pageHTML
 * @returns {MerchandiseList}
 */
export function parseAccessoryStoreMerchandiseList(pageHTML) {
    const merchandiseList = new MerchandiseList();
    const table = $(pageHTML).find("input:radio:last").closest("table");
    let specialityMatch = false;
    $(table).find("tr").each(function (_idx, tr) {
        const c1 = $(tr).find(":first-child");
        const radio = $(c1).find("input:radio:first");
        if (radio.length > 0) {
            const merchandise = new Merchandise();
            merchandise.id = "ACC_" + $(radio).val();

            const c2 = $(c1).next();
            const c3 = $(c2).next();
            const c4 = $(c3).next();
            const c5 = $(c4).next();
            const c6 = $(c5).next();
            const c7 = $(c6).next();
            const c8 = $(c7).next();
            const c9 = $(c8).next();
            const c10 = $(c9).next();
            const c11 = $(c10).next();
            const c12 = $(c11).next();
            const c13 = $(c12).next();
            const c14 = $(c13).next();

            merchandise.name = $(c2).text();
            merchandise.nameHTML = $(c2).html();
            let s = $(c3).text();
            s = util.substringBefore(s, " Gold");
            merchandise.price = parseInt(s);
            merchandise.power = parseInt($(c4).text());
            merchandise.weight = parseInt($(c5).text());
            merchandise.endure = parseInt($(c6).text());
            merchandise.attribute = $(c7).text();
            merchandise.requiredCareer = $(c8).text();
            merchandise.requiredAttack = parseInt($(c9).text());
            merchandise.requiredDefense = parseInt($(c10).text());
            merchandise.requiredSpecialAttack = parseInt($(c11).text());
            merchandise.requiredSpecialDefense = parseInt($(c12).text());
            merchandise.requiredSpeed = parseInt($(c13).text());
            merchandise.weaponCategory = "-";
            merchandise.gemCount = parseInt($(c14).text());
            merchandise.speciality = specialityMatch;

            merchandiseList.push(merchandise);
        } else if ($(c1).text() === "== 特产饰品 ==") {
            specialityMatch = true;
        }
    });
    return merchandiseList;
}

/**
 * Parse merchandise list from item store page HTML.
 * @param pageHTML
 * @returns {MerchandiseList}
 */
export function parseItemStoreMerchandiseList(pageHTML) {
    const merchandiseList = new MerchandiseList();
    const table = $(pageHTML).find("input:radio:last").closest("table");
    $(table).find("input:radio").each(function (_idx, radio) {
        const c1 = $(radio).parent();
        const c2 = $(c1).next();
        const c3 = $(c2).next();
        const c4 = $(c3).next();
        const c5 = $(c4).next();
        const c6 = $(c5).next();
        const c7 = $(c6).next();

        const merchandise = new Merchandise();
        merchandise.id = "ITE_" + $(radio).val();

        merchandise.name = $(c2).text();
        merchandise.nameHTML = $(c2).html();
        let s = $(c3).text();
        s = util.substringBefore(s, " Gold");
        merchandise.price = parseInt(s);
        merchandise.power = parseInt($(c4).text());
        merchandise.weight = parseInt($(c5).text());
        merchandise.endure = parseInt($(c6).text());
        merchandise.attribute = $(c7).text();

        merchandise.requiredCareer = "-";
        merchandise.requiredAttack = 0;
        merchandise.requiredDefense = 0;
        merchandise.requiredSpecialAttack = 0;
        merchandise.requiredSpecialDefense = 0;
        merchandise.requiredSpeed = 0;
        merchandise.weaponCategory = "-";
        merchandise.gemCount = -1;
        merchandise.speciality = false;

        merchandiseList.push(merchandise);
    });
    return merchandiseList;
}