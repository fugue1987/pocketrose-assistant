/**
 * ============================================================================
 * [ 口 袋 装 备 通 用 模 块 ]
 * ----------------------------------------------------------------------------
 * 装备和物品的通用数据结构
 * ============================================================================
 */

// 口袋所有的装备都被分为以下四类：

const CATEGORY_WEAPON = "武器";
const CATEGORY_ARMOR = "防具";
const CATEGORY_ACCESSORY = "饰品";
const CATEGORY_ITEM = "物品";

/**
 * 描述口袋装备的数据结构定义
 */
export class PocketItem {

    index;                      // 下标（唯一性）
    selectable;                 // 是否可以被选择
    using;                      // 是否装备
    name;                       // 名字
    star;                       // 是否齐心
    nameHTML;                   // 名字HTML代码
    category;                   // 种类
    power;                      // 效果
    weight;                     // 重量
    endure;                     // 耐久
    requiredCareer;             // 装备需要的职业
    requiredAttack;             // 装备需要的攻击力
    requiredDefense;            // 装备需要的防御力
    requiredSpecialAttack;      // 装备需要的智力
    requiredSpecialDefense;     // 装备需要的精神力
    requiredSpeed;              // 装备需要的速度
    experience;                 // 经验
    additionalPower;            // 附加威力
    additionalWeight;           // 附加重量
    additionalLuck;             // 附加幸运
    attribute;                  // 属性

    get isWeapon() {
        return this.category === CATEGORY_WEAPON;
    }

    get isArmor() {
        return this.category === CATEGORY_ARMOR;
    }

    get isAccessory() {
        return this.category === CATEGORY_ACCESSORY;
    }

    get isItem() {
        return this.category === CATEGORY_ITEM;
    }
}

/**
 * 口袋装备的列表集合数据结构
 */
export class PocketItemList {

    #itemList;

    constructor() {
        this.#itemList = [];
    }

    push(item) {
        this.#itemList.push(item);
    }

    /**
     * Return pocket items as array.
     * @returns {PocketItem[]}
     */
    asList() {
        return this.#itemList;
    }

    /**
     * Return pocket items as map.
     * @returns {{number:PocketItem}}
     */
    asMap() {
        const map = {};
        for (const item of this.#itemList) {
            map[item.index] = item;
        }
        return map;
    }
}