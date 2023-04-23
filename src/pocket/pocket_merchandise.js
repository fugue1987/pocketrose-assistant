/**
 * ============================================================================
 * [ 商 品 模 块 ]
 * ----------------------------------------------------------------------------
 * 在武器屋、防具屋、饰品屋和物品屋中出售的商品。
 * ============================================================================
 */

export class Merchandise {

    id;
    name;
    nameHTML;
    price;
    power;
    weight;
    endure;
    attribute;
    requiredCareer;
    requiredAttack;             // 装备需要的攻击力
    requiredDefense;            // 装备需要的防御力
    requiredSpecialAttack;      // 装备需要的智力
    requiredSpecialDefense;     // 装备需要的精神力
    requiredSpeed;              // 装备需要的速度
    category;
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