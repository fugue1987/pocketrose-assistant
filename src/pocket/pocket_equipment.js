/**
 * ============================================================================
 * [ 口 袋 装 备 通 用 模 块 ]
 * ============================================================================
 */

import * as message from "../common/common_message";
import * as network from "../common/common_network";
import * as util from "../common/common_util";
import * as page from "../common/common_page";
import * as pocket from "../common/common_pocket";
import * as town from "./pocket_town";

// 口袋所有的装备都被分为以下四类：

const CATEGORY_WEAPON = "武器";
const CATEGORY_ARMOR = "防具";
const CATEGORY_ACCESSORY = "饰品";
const CATEGORY_ITEM = "物品";

/**
 * 禁售装备清单定义
 * @type {string[]}
 */
const PROHIBIT_SELLING_ITEM_LIST = [
    "千与千寻",
    "勿忘我",
    "神枪 永恒",
    "霸邪斧 天煌",
    "魔刀 哭杀",
    "神器 苍穹",
    "魔神器 幻空",
    "真·圣剑 苍白的正义",
    "双经斩",
    "千幻碧水猿洛克奇斯",
    "地纹玄甲龟斯特奥特斯",
    "幽冥黑鳞蟒罗尼科斯",
    "火睛混沌兽哈贝达",
    "羽翅圣光虎阿基勒斯",
    "金翅追日鹰庞塔雷斯",
    "风翼三足凤纳托利斯",
    "圣皇铠甲 天威",
    "薄翼甲",
    "魔盔 虚无",
    "神冠 灵通",
    "龙",
    "玉佩",
    "宠物蛋"
];

/**
 * 不计算经验的装备
 * @type {*[]}
 */
const NO_EXPERIENCE_ITEM_LIST = [
    "大师球",
    "宗师球",
    "超力怪兽球",
    "宠物蛋"
];

const NONE_REPAIRABLE_ITEM_LIST = [
    "大师球",
    "宗师球",
    "超力怪兽球",
    "宠物蛋"
];

/**
 * 属性重铠
 * @type {string[]}
 */
const ATTRIBUTE_HEAVY_ARMOR_ITEM_LIST = [
    "千幻碧水猿洛克奇斯",
    "地纹玄甲龟斯特奥特斯",
    "幽冥黑鳞蟒罗尼科斯",
    "火睛混沌兽哈贝达",
    "羽翅圣光虎阿基勒斯",
    "金翅追日鹰庞塔雷斯",
    "风翼三足凤纳托利斯"
];

/**
 * 检查指定的装备是否禁售
 * @param name
 * @returns {boolean}
 */
export function isProhibitSellingItem(name) {
    for (const it of PROHIBIT_SELLING_ITEM_LIST) {
        if (name.endsWith(it)) {
            return true;
        }
    }
    return false;
}

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
    maxEndure;                  // 最大耐久
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
    price;                      // 价格
    priceHTML;                  // 价格HTML代码
    repairPrice;                // 修理费用
    gem;                        // 已经镶嵌的宝石数目
    maxGem;                     // 最大宝石数目

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

    get isTreasureBag() {
        return this.isItem && this.name === "百宝袋";
    }

    get isGoldenCage() {
        return this.isItem && this.name === "黄金笼子";
    }

    get isRepairable() {
        if (this.isItem) {
            return this.name.includes("(自动)");
        } else {
            return !NONE_REPAIRABLE_ITEM_LIST.includes(this.name);
        }
    }

    get fullExperienceRatio() {
        if (this.isItem) {
            return -1;
        }
        if (NO_EXPERIENCE_ITEM_LIST.includes(this.name)) {
            return -1;
        }
        let maxExperience = 0;
        if (__isAttributeHeavyArmor(this.name)) {
            // 属性重铠满级经验为76000
            maxExperience = 76000;
        } else if (this.power !== 0) {
            const powerForUse = Math.abs(this.power);
            maxExperience = Math.floor(powerForUse * 0.2) * 1000;
        }
        if (maxExperience === 0) {
            return -1;
        }
        if (this.experience >= maxExperience) {
            return 1;
        }
        if (this.experience === 0) {
            return 0;
        }
        return this.experience / maxExperience;
    }

    get checkboxHTML() {
        if (this.selectable) {
            return "<input type='checkbox' name='item" + this.index + "' value='" + this.index + "'>";
        } else {
            return "";
        }
    }

    get usingHTML() {
        if (!this.using) {
            return "";
        }
        const ration = this.fullExperienceRatio;
        if (ration === 1) {
            return "<span title='装备中' style='color:red'>★</span>";
        } else {
            return "<span title='装备中'>★</span>";
        }
    }

    get experienceHTML() {
        if (this.isItem) {
            if (this.name === "藏宝图") {
                const coordinate = new util.Coordinate(this.power, this.weight);
                const mapTown = town.getTownByCoordinate(coordinate);
                if (mapTown !== null) {
                    return "<b style='color:red'>" + mapTown.name + "</b>";
                } else {
                    return "-";
                }
            } else {
                return "-";
            }
        }
        const ratio = this.fullExperienceRatio;
        if (ratio < 0) {
            return "-";
        }
        if (ratio === 1) {
            return "<span style='color:red' title='" + this.experience + "'>MAX</span>";
        }
        const progressBar = page.generateProgressBarHTML(ratio);
        return "<span title='" + this.experience + " (" + (ratio * 100).toFixed(2) + "%)'>" + progressBar + "</span>"
    }

    get isProhibitSellingItem() {
        return this.using || pocket.isProhibitSellingItem(this.name);
    }

    get fullName() {
        if (this.star) {
            return "齐心★" + this.name;
        } else {
            return this.name;
        }
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

    size() {
        return this.asList().length;
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

    get treasureBag() {
        for (const item of this.#itemList) {
            if (item.isTreasureBag) {
                return item;
            }
        }
        return undefined;
    }

    get goldenCage() {
        for (const item of this.#itemList) {
            if (item.isGoldenCage) {
                return item;
            }
        }
        return undefined;
    }
}

/**
 * 装备套装的数据结构（不是指口袋里面的套装，而是武器、防具、饰品组成的套装）
 */
export class EquipmentSet {
    weaponName;
    weaponIndex;
    weaponUsing;
    armorName;
    armorIndex;
    armorUsing;
    accessoryName;
    accessoryIndex;
    accessoryUsing;
    treasureBagIndex;

    initialize() {
        this.weaponName = undefined;
        this.weaponIndex = undefined;
        this.weaponUsing = undefined;
        this.armorName = undefined;
        this.armorIndex = undefined;
        this.armorUsing = undefined;
        this.accessoryName = undefined;
        this.accessoryIndex = undefined;
        this.accessoryUsing = undefined;
        this.treasureBagIndex = undefined;
    }

    get isAllFound() {
        if (this.weaponName !== undefined && this.weaponIndex === undefined) {
            return false;
        }
        if (this.armorName !== undefined && this.armorIndex === undefined) {
            return false;
        }
        return !(this.accessoryName !== undefined && this.accessoryIndex === undefined);
    }
}

/**
 * 解析身上的装备
 * @param html
 * @returns {PocketItemList}
 */
export function parsePersonalItemList(html) {
    const itemList = new PocketItemList();
    $(html).find("input:checkbox").each(function (_idx, checkbox) {
        const item = new PocketItem();
        const tr = $(checkbox).parent().parent();

        // index & selectable
        item.index = parseInt($(checkbox).val());
        item.selectable = !$(checkbox).prop("disabled");

        // using
        let s = $(tr).find("th:first").text();
        item.using = (s === "★");

        // name & star
        s = $(tr).find("td:eq(1)").text();
        if (s.startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter(s, "齐心★");
        } else {
            item.star = false;
            item.name = s;
        }
        item.nameHTML = $(tr).find("td:eq(1)").html();

        // category
        s = $(tr).find("td:eq(2)").text();
        item.category = s;

        // power & weight & endure
        s = $(tr).find("td:eq(3)").text();
        item.power = parseInt(s);
        s = $(tr).find("td:eq(4)").text();
        item.weight = parseInt(s);
        s = $(tr).find("td:eq(5)").text();
        item.endure = parseInt(s);

        // required career
        s = $(tr).find("td:eq(6)").text();
        item.requiredCareer = s;

        // required stats
        s = $(tr).find("td:eq(7)").text();
        item.requiredAttack = parseInt(s);
        s = $(tr).find("td:eq(8)").text();
        item.requiredDefense = parseInt(s);
        s = $(tr).find("td:eq(9)").text();
        item.requiredSpecialAttack = parseInt(s);
        s = $(tr).find("td:eq(10)").text();
        item.requiredSpecialDefense = parseInt(s);
        s = $(tr).find("td:eq(11)").text();
        item.requiredSpeed = parseInt(s);

        // additional
        s = $(tr).find("td:eq(12)").text();
        item.additionalPower = parseInt(s);
        s = $(tr).find("td:eq(13)").text();
        item.additionalWeight = parseInt(s);
        s = $(tr).find("td:eq(14)").text();
        item.additionalLuck = parseInt(s);

        // experience
        s = $(tr).find("td:eq(15)").text();
        item.experience = parseInt(s);

        // attribute
        s = $(tr).find("td:eq(16)").text();
        item.attribute = s;

        itemList.push(item);
    });
    return itemList;
}

/**
 * 解析百宝袋的装备
 * @param html
 * @returns {PocketItemList}
 */
export function parseTreasureBagItemList(html) {
    const itemList = new PocketItemList();
    $(html).find("input:checkbox").each(function (_idx, checkbox) {
        const item = new PocketItem();
        const tr = $(checkbox).parent().parent();

        // index & selectable
        item.index = parseInt($(checkbox).val());
        item.selectable = true;

        // name & star
        let s = $(tr).find("td:eq(1)").text();
        if (s.startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter(s, "齐心★");
        } else {
            item.star = false;
            item.name = s;
        }
        item.nameHTML = $(tr).find("td:eq(1)").html();

        // category
        s = $(tr).find("td:eq(2)").text();
        item.category = s;

        // power & weight & endure
        s = $(tr).find("td:eq(3)").text();
        item.power = parseInt(s);
        s = $(tr).find("td:eq(4)").text();
        item.weight = parseInt(s);
        s = $(tr).find("td:eq(5)").text();
        item.endure = parseInt(s);

        // additional
        s = $(tr).find("td:eq(6)").text();
        item.additionalPower = parseInt(s);
        s = $(tr).find("td:eq(7)").text();
        item.additionalWeight = parseInt(s);
        s = $(tr).find("td:eq(8)").text();
        item.additionalLuck = parseInt(s);

        // experience
        s = $(tr).find("td:eq(9)").text();
        item.experience = parseInt(s);

        itemList.push(item);
    });
    return itemList;
}

/**
 * 解析武器店的装备
 * @param html
 * @returns {PocketItemList}
 */
export function parseWeaponStoreItemList(html) {
    const itemList = new PocketItemList();
    $(html).find("table:eq(4) input:radio").each(function (_idx, radio) {
        const item = new PocketItem();
        const tr = $(radio).parent().parent();

        // index & selectable
        item.index = parseInt($(radio).val());
        item.selectable = !$(radio).prop("disabled");

        // using
        let s = $(tr).find("th:first").text();
        item.using = (s === "★");

        // name & star
        s = $(tr).find("th:eq(1)").text();
        if (s.startsWith("齐心★")) {
            item.star = true;
            item.name = util.substringAfter(s, "齐心★");
        } else {
            item.star = false;
            item.name = s;
        }
        item.nameHTML = $(tr).find("th:eq(1)").html();

        // category
        s = $(tr).find("td:eq(1)").text();
        item.category = s;

        // power & weight & endure
        s = $(tr).find("td:eq(2)").text();
        item.power = parseInt(s);
        s = $(tr).find("td:eq(3)").text();
        item.weight = parseInt(s);
        s = $(tr).find("td:eq(4)").text();
        item.endure = parseInt(util.substringBeforeSlash(s));
        item.maxEndure = parseInt(util.substringAfterSlash(s));

        // price
        s = $(tr).find("td:eq(5)").text();
        item.price = parseInt(util.substringBefore(s, " Gold"));
        item.priceHTML = $(tr).find("td:eq(5)").html();

        itemList.push(item);
    });
    return itemList;
}

/**
 * 从城堡仓库页面解析仓库里面的所有装备。
 * @param pageHTML
 * @returns {PocketItemList}
 */
export function parseCastleWarehouseItemList(pageHTML) {
    const itemList = new PocketItemList();
    const table = $(pageHTML).find("input:checkbox:last").closest("table");
    $(table).find("input:checkbox").each(function (_idx, checkbox) {
        const c1 = $(checkbox).parent();
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
        const c16 = $(c15).next();
        const c17 = $(c16).next();
        const c18 = $(c17).next();

        const item = new PocketItem();

        item.index = parseInt($(checkbox).val());
        item.selectable = true;
        item.using = false;
        let s = $(c3).text();
        if (s.startsWith("齐心★")) {
            item.name = util.substringAfter(s, "齐心★");
            item.star = true;
        } else {
            item.name = s;
            item.star = false;
        }
        item.nameHTML = $(c3).html();
        item.category = $(c4).text();
        item.power = parseInt($(c5).text());
        item.weight = parseInt($(c6).text());
        item.endure = parseInt($(c7).text());
        item.requiredCareer = $(c8).text();
        item.requiredAttack = parseInt($(c9).text());
        item.requiredDefense = parseInt($(c10).text());
        item.requiredSpecialAttack = parseInt($(c11).text());
        item.requiredSpecialDefense = parseInt($(c12).text());
        item.requiredSpeed = parseInt($(c13).text());
        item.additionalPower = parseInt($(c14).text());
        item.additionalWeight = parseInt($(c15).text());
        item.additionalLuck = parseInt($(c16).text());
        item.experience = parseInt($(c17).text());
        item.attribute = $(c18).text();

        itemList.push(item);
    });
    return itemList;
}

/**
 * Open treasure bag and return parsed equipments in the bag.
 * @param credential
 * @param treasureBagIndex
 * @returns {Promise<PocketItemList>}
 */
export async function openTreasureBag(credential, treasureBagIndex) {
    const action = (credential, treasureBagIndex) => {
        return new Promise(resolve => {
            const request = credential.asRequest();
            request["chara"] = "1";
            request["item" + treasureBagIndex] = treasureBagIndex;
            request["mode"] = "USE";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const itemList = parseTreasureBagItemList(html);
                message.publishMessageBoard("你打开了百宝袋，并检索到" + itemList.size() + "件装备。")
                resolve(itemList);
            });
        });
    };
    return await action(credential, treasureBagIndex);
}

/**
 * Take out equipments from treasure bag.
 * @param credential
 * @param indexList
 * @returns {Promise<void>}
 */
export async function takeOutFromTreasureBag(credential, indexList) {
    const action = (credential, indexList) => {
        return new Promise(resolve => {
            if (indexList === undefined || indexList === null || indexList.length === 0) {
                resolve();
            } else {
                const request = credential.asRequest();
                request["mode"] = "GETOUTBAG";
                for (const index of indexList) {
                    request["item" + index] = index;
                    network.sendPostRequest("mydata.cgi", request, function (html) {
                        message.processResponseHTML(html);
                        resolve();
                    });
                }
            }
        });
    };
    return await action(credential, indexList);
}

export async function findAndUseEquipmentSet(credential, itemList, set) {
    const action = (credential, itemList, set) => {
        return new Promise(resolve => {
            set = __scanEquipmentSet(itemList, set);
            // 在自身完成了检索
            if (!set.isAllFound && set.treasureBagIndex !== undefined) {
                // 没有找全，有百宝袋，进继续找。
                openTreasureBag(credential, set.treasureBagIndex)
                    .then(bagItemList => {
                        const candidateIndexList = [];
                        if (set.weaponName !== undefined && set.weaponIndex === undefined) {
                            for (const bit of bagItemList.asList()) {
                                if (bit.isWeapon && bit.fullName === set.weaponName) {
                                    message.publishMessageBoard("在百宝袋中找到了武器：" + bit.nameHTML);
                                    candidateIndexList.push(bit.index);
                                }
                            }
                        }
                        if (set.armorName !== undefined && set.armorIndex === undefined) {
                            for (const bit of bagItemList.asList()) {
                                if (bit.isArmor && bit.fullName === set.armorName) {
                                    message.publishMessageBoard("在百宝袋中找到了防具：" + bit.nameHTML);
                                    candidateIndexList.push(bit.index);
                                }
                            }
                        }
                        if (set.accessoryName !== undefined && set.accessoryIndex === undefined) {
                            for (const bit of bagItemList.asList()) {
                                if (bit.isAccessory && bit.fullName === set.accessoryName) {
                                    message.publishMessageBoard("在百宝袋中找到了饰品：" + bit.nameHTML);
                                    candidateIndexList.push(bit.index);
                                }
                            }
                        }
                        if (candidateIndexList.length > 0) {
                            // 在百宝袋中找到了需要的装备，准备拿出来
                            takeOutFromTreasureBag(credential, candidateIndexList)
                                .then(() => {
                                    const request = credential.asRequest();
                                    request["mode"] = "USE_ITEM";
                                    network.sendPostRequest("mydata.cgi", request, function (html) {
                                        const newItemList = parsePersonalItemList(html);
                                        set = __scanEquipmentSet(newItemList, set);
                                        __useEquipmentSet(credential, set, resolve);
                                    });
                                });
                        } else {
                            // 在百宝袋中没有找到需要的装备
                            __useEquipmentSet(credential, set, resolve);
                        }
                    });
            } else {
                __useEquipmentSet(credential, set, resolve);
            }
        });
    };
    return await action(credential, itemList, set);
}

// ----------------------------------------------------------------------------
// P R I V A T E   F U N C T I O N S
// ----------------------------------------------------------------------------

function __useEquipmentSet(credential, set, resolve) {
    const request = credential.asRequest();
    request["chara"] = "1";
    request["mode"] = "USE";
    let count = 0;
    if (set.weaponIndex !== undefined && set.weaponUsing !== undefined && !set.weaponUsing) {
        count++;
        request["item" + set.weaponIndex] = set.weaponIndex;
    }
    if (set.armorIndex !== undefined && set.armorUsing !== undefined && !set.armorUsing) {
        count++;
        request["item" + set.armorIndex] = set.armorIndex;
    }
    if (set.accessoryIndex !== undefined && set.accessoryUsing !== undefined && !set.accessoryUsing) {
        count++;
        request["item" + set.accessoryIndex] = set.accessoryIndex;
    }
    if (count === 0) {
        message.publishMessageBoard("没有找到对应的装备或者正在装备中，忽略。");
        resolve();
    } else {
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            resolve();
        });
    }
}

function __scanEquipmentSet(itemList, set) {
    for (const it of itemList.asList()) {
        if (it.isTreasureBag) {
            set.treasureBagIndex = it.index;
        }
        if (set.weaponName !== undefined) {
            if (it.isWeapon && it.fullName === set.weaponName) {
                message.publishMessageBoard("在身上找到了武器：" + it.nameHTML);
                set.weaponIndex = it.index;
                set.weaponUsing = it.using;
            }
        }
        if (set.armorName !== undefined) {
            if (it.isArmor && it.fullName === set.armorName) {
                message.publishMessageBoard("在身上找到了防具：" + it.nameHTML);
                set.armorIndex = it.index;
                set.armorUsing = it.using;
            }
        }
        if (set.accessoryName !== undefined) {
            if (it.isAccessory && it.fullName === set.accessoryName) {
                message.publishMessageBoard("在身上找到了饰品：" + it.nameHTML);
                set.accessoryIndex = it.index;
                set.accessoryUsing = it.using;
            }
        }
    }
    return set;
}

function __isAttributeHeavyArmor(name) {
    for (const it of ATTRIBUTE_HEAVY_ARMOR_ITEM_LIST) {
        if (name.endsWith(it)) {
            return true;
        }
    }
    return false;
}