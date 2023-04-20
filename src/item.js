/**
 * ============================================================================
 * [ 装 备 物 品 功 能 模 块 ]
 * ============================================================================
 */

import * as page from "./page";
import * as pocket from "./pocket";
import * as util from "./util";

/**
 * 用于描述物品的基础数据结构
 */
export class Item {

    _index;                     // 下标，在物品栏上的顺序
    _selectable;                // 是否可以选择
    _using;                     // 是否装备
    _name;                      // 名字
    _star;                      // 是否齐心
    _nameHTML;                  // 名字完整的HTML
    _category;                  // 种类
    _power;                     // 效果
    _weight;                    // 重量
    _endure;                    // 耐久
    _requiredCareer;            // 装备需要的职业
    _requiredAttack;            // 装备需要的攻击力
    _requiredDefense;           // 装备需要的防御力
    _requiredSpecialAttack;     // 装备需要的智力
    _requiredSpecialDefense;    // 装备需要的精神力
    _requiredSpeed;             // 装备需要的速度
    _experience;                // 经验
    _additionalPower;           // 附加威力
    _additionalWeight;          // 附加重量
    _additionalLuck;            // 附加幸运
    _attribute;                 // 属性

    constructor() {
    }

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get selectable() {
        return this._selectable;
    }

    set selectable(value) {
        this._selectable = value;
    }

    get using() {
        return this._using;
    }

    set using(value) {
        this._using = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get star() {
        return this._star;
    }

    set star(value) {
        this._star = value;
    }

    get nameHTML() {
        return this._nameHTML;
    }

    set nameHTML(value) {
        this._nameHTML = value;
    }

    get category() {
        return this._category;
    }

    set category(value) {
        this._category = value;
    }

    get power() {
        return this._power;
    }

    set power(value) {
        this._power = value;
    }

    get weight() {
        return this._weight;
    }

    set weight(value) {
        this._weight = value;
    }

    get endure() {
        return this._endure;
    }

    set endure(value) {
        this._endure = value;
    }

    get requiredCareer() {
        return this._requiredCareer;
    }

    set requiredCareer(value) {
        this._requiredCareer = value;
    }

    get requiredAttack() {
        return this._requiredAttack;
    }

    set requiredAttack(value) {
        this._requiredAttack = value;
    }

    get requiredDefense() {
        return this._requiredDefense;
    }

    set requiredDefense(value) {
        this._requiredDefense = value;
    }

    get requiredSpecialAttack() {
        return this._requiredSpecialAttack;
    }

    set requiredSpecialAttack(value) {
        this._requiredSpecialAttack = value;
    }

    get requiredSpecialDefense() {
        return this._requiredSpecialDefense;
    }

    set requiredSpecialDefense(value) {
        this._requiredSpecialDefense = value;
    }

    get requiredSpeed() {
        return this._requiredSpeed;
    }

    set requiredSpeed(value) {
        this._requiredSpeed = value;
    }

    get experience() {
        return this._experience;
    }

    set experience(value) {
        this._experience = value;
    }

    get additionalPower() {
        return this._additionalPower;
    }

    set additionalPower(value) {
        this._additionalPower = value;
    }

    get additionalWeight() {
        return this._additionalWeight;
    }

    set additionalWeight(value) {
        this._additionalWeight = value;
    }

    get additionalLuck() {
        return this._additionalLuck;
    }

    set additionalLuck(value) {
        this._additionalLuck = value;
    }

    get attribute() {
        return this._attribute;
    }

    set attribute(value) {
        this._attribute = value;
    }

    get isWeapon() {
        return this._category === "武器";
    }

    get isArmor() {
        return this._category === "防具";
    }

    get isAccessory() {
        return this._category === "饰品";
    }

    get isItem() {
        return this._category === "物品";
    }

    get isFullExperience() {
        return (this.isWeapon || this.isArmor || this.isAccessory) &&
            pocket.__utilities_checkIfEquipmentFullExperience(
                this._name,
                this._power,
                this._experience
            );
    }

    get isTreasureBag() {
        return this.isItem && this._name === "百宝袋";
    }

    get isGoldenCage() {
        return this.isItem && this._name === "黄金笼子";
    }

    get isGem() {
        return this.isItem && this._name.endsWith("宝石");
    }

    get experienceHTML() {
        if (this.isItem) {
            return "-";
        }
        const ratio = pocket.calculateEquipmentFullExperienceRatio(this._name, this._power, this._experience);
        if (ratio < 0) {
            return "-";
        }
        const progressBar = page.generateProgressBarHTML(ratio);
        const title = this.isFullExperience ? "MAX" : this.experience;
        return "<span title='" + title + "'>" + progressBar + "</span>"
    }

}

/**
 * 从个人物品装备页面解析
 * @param html
 * @returns {Item[]}
 */
export function parsePersonalItems(html) {
    const items = [];
    $(html).find("input:checkbox").each(function (_idx, checkbox) {
        const item = new Item();
        item.index = _idx;
        let s = $(checkbox).parent().next().text();
        item.selectable = !$(checkbox).prop("disabled");
        item.using = s === "★";
        s = $(checkbox).parent().next().next().text();
        if (s.startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter(s, "齐心★");
        } else {
            item.star = false;
            item.name = s;
        }
        item.nameHTML = $(checkbox).parent().next().next().html();
        item.category = $(checkbox).parent().next().next().next().text();
        item.power = parseInt($(checkbox).parent().next().next().next().next().text());
        item.weight = parseInt($(checkbox).parent().next().next().next().next().next().text());
        item.endure = parseInt($(checkbox).parent().next().next().next().next().next().next().text());
        item.requiredCareer = $(checkbox).parent().next().next().next().next().next().next().next().text();
        item.requiredAttack = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().text());
        item.requiredDefense = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().text());
        item.requiredSpecialAttack = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().text());
        item.requiredSpecialDefense = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().text());
        item.requiredSpeed = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().text());
        item.additionalPower = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().text());
        item.additionalWeight = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().next().text());
        item.additionalLuck = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().text());
        item.experience = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().text());
        item.attribute = $(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().text();

        items.push(item);

    });
    return items;
}

/**
 * 解析百宝袋中的装备
 * @param html 百宝袋HTML
 * @returns {Item[]}
 */
export function parseTreasureBagItems(html) {
    const itemList = [];
    $(html).find("input:checkbox").each(function (_idx, checkbox) {
        const item = new Item();

        item.index = parseInt($(checkbox).val());
        item.selectable = true;

        const tr = $(checkbox).parent().parent();
        let td = $(tr).find("td:eq(1)");
        item.nameHTML = $(td).html();
        if ($(td).text().startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter($(td).text(), "齐心★");
        } else {
            item.star = false;
            item.name = $(td).text();
        }

        td = $(tr).find("td:eq(2)");
        item.category = $(td).text();

        td = $(tr).find("td:eq(3)");
        item.power = parseInt($(td).text());

        td = $(tr).find("td:eq(4)");
        item.weight = parseInt($(td).text());

        td = $(tr).find("td:eq(5)");
        item.endure = parseInt($(td).text());

        td = $(tr).find("td:eq(6)");
        item.additionalPower = parseInt($(td).text());

        td = $(tr).find("td:eq(7)");
        item.additionalWeight = parseInt($(td).text());

        td = $(tr).find("td:eq(8)");
        item.additionalLuck = parseInt($(td).text());

        td = $(tr).find("td:eq(9)");
        item.experience = parseInt($(td).text());

        itemList.push(item);
    });
    return itemList;
}

export function findTreasureBag(items) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.isTreasureBag) {
            return item;
        }
    }
    return undefined;
}

export function findGoldenCage(items) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.isGoldenCage) {
            return item;
        }
    }
    return undefined;
}

export function itemListAsMap(itemList) {
    const itemMap = {};
    for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];
        itemMap[item.index] = item;
    }
    return itemMap;
}