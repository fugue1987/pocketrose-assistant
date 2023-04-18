/**
 * ============================================================================
 * [ 装 备 物 品 功 能 模 块 ]
 * ============================================================================
 */

import * as pocket from "./pocket";
import * as util from "./util";

/**
 * 用于描述物品的基础数据结构
 */
export class Item {

    _index;
    _using;
    _name;
    _star;
    _category;
    _power;
    _weight;
    _endure;
    _experience;

    constructor() {
    }

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
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

    get experience() {
        return this._experience;
    }

    set experience(value) {
        this._experience = value;
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

}

/**
 * 从个人物品装备页面解析
 * @returns {Item[]}
 */
export function parsePersonalItems() {
    const items = [];
    $("input:checkbox").each(function (_idx, checkbox) {
        const item = new Item();
        item.index = _idx;
        let s = $(checkbox).parent().next().text();
        item.using = s === "★";
        s = $(checkbox).parent().next().next().text();
        if (s.startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter(s, "齐心★");
        } else {
            item.star = false;
            item.name = s;
        }
        item.category = $(checkbox).parent().next().next().next().text();
        item.power = parseInt($(checkbox).parent().next().next().next().next().text());
        item.weight = parseInt($(checkbox).parent().next().next().next().next().next().text());
        item.endure = parseInt($(checkbox).parent().next().next().next().next().next().next().text());
        item.experience = parseInt($(checkbox).parent().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().next().text());

        items.push(item);

    });
    return items;
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