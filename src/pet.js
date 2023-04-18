/**
 * ============================================================================
 * [ 宠 物 功 能 模 块 ]
 * ============================================================================
 */

import * as util from "./util";

/**
 * 描述宠物状态的数据结构
 */
export class Pet {

    _index;
    _name;
    _gender;
    _using;
    _level;
    _health;
    _maxHealth;
    _spell1;
    _spell2;
    _spell3;
    _spell4;
    _attack;
    _defense;
    _specialAttack;
    _specialDefense;
    _speed;
    _love;
    _race;
    _code;

    constructor() {
    }

    get index() {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }


    get gender() {
        return this._gender;
    }

    set gender(value) {
        this._gender = value;
    }

    get using() {
        return this._using;
    }

    set using(value) {
        this._using = value;
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

    get spell1() {
        return this._spell1;
    }

    set spell1(value) {
        this._spell1 = value;
    }

    get spell2() {
        return this._spell2;
    }

    set spell2(value) {
        this._spell2 = value;
    }

    get spell3() {
        return this._spell3;
    }

    set spell3(value) {
        this._spell3 = value;
    }

    get spell4() {
        return this._spell4;
    }

    set spell4(value) {
        this._spell4 = value;
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

    get love() {
        return this._love;
    }

    set love(value) {
        this._love = value;
    }

    get race() {
        return this._race;
    }

    set race(value) {
        this._race = value;
    }

    get code() {
        return this._code;
    }

    set code(value) {
        this._code = value;
    }
}

/**
 * 从指定的页面获取当前身上所有宠物的状态
 * @param html 源页面
 * @returns {Pet[]}
 */
export function getCurrentPetList(html) {
    const petList = [];
    $(html).find("input:radio[name='select']").each(function (_idx, radio) {
        const index = $(radio).val();
        if (index >= 0) {
            // index为-1的意味着“无宠物”那个选项
            const table = $(radio).closest("table");
            // pet index & using
            const pet = new Pet();
            pet.index = parseInt(index);
            const usingText = radio.nextSibling.nodeValue;
            if (usingText === "未使用") {
                pet.using = false;
            }
            if (usingText === "★使用") {
                pet.using = true;
            }
            parsePet(pet, table);
            petList.push(pet);
        }
    });
    return petList;
}

/**
 * 寻找正在使用中的宠物
 * @param petList 宠物列表
 * @returns {undefined|Pet}
 */
export function findUsingPet(petList) {
    for (let i = 0; i < petList.length; i++) {
        const pet = petList[i];
        if (pet.using) {
            return pet;
        }
    }
    return undefined;
}

function parsePet(pet, table) {
    // pet name & gender
    const nameCell = table.find("td:first");
    let petNameText = nameCell.find("b").text();
    petNameText = petNameText.substring(1);
    pet.name = petNameText.substring(0, petNameText.length - 1);
    let fullNameText = nameCell.text();
    if (fullNameText.endsWith("(公)")) {
        pet.gender = "公";
    } else if (fullNameText.endsWith("(母)")) {
        pet.gender = "母";
    } else if (fullNameText.endsWith("(无性)")) {
        pet.gender = "无性";
    }

    // pet level
    let s = table.find("tr:eq(1) td:first").text();
    pet.level = parseInt(util.substringAfter(s, "Ｌｖ"));

    // pet health
    s = table.find("tr:eq(2) td:eq(2)").text();
    pet.health = parseInt(util.substringBeforeSlash(s));
    pet.maxHealth = parseInt(util.substringAfterSlash(s));

    // pet spells
    s = table.find("tr:eq(3) td:eq(1)").text();
    pet.spell1 = util.substringBefore(s, "(威力：");
    s = table.find("tr:eq(5) td:eq(1)").text();
    pet.spell2 = util.substringBefore(s, "(威力：");
    s = table.find("tr:eq(7) td:eq(1)").text();
    pet.spell3 = util.substringBefore(s, "(威力：");
    s = table.find("tr:eq(9) td:eq(1)").text();
    pet.spell4 = util.substringBefore(s, "(威力：");

    // pet attack & defense
    s = table.find("tr:eq(11) td:eq(1)").text();
    pet.attack = parseInt(s);
    s = table.find("tr:eq(11) td:eq(3)").text();
    pet.defense = parseInt(s);

    // pet specialAttack & specialDefense
    s = table.find("tr:eq(12) td:eq(1)").text();
    pet.specialAttack = parseInt(s);
    s = table.find("tr:eq(12) td:eq(3)").text();
    pet.specialDefense = parseInt(s);

    // pet speed & love
    s = table.find("tr:eq(13) td:eq(1)").text();
    pet.speed = parseInt(s);
    s = table.find("tr:eq(13) td:eq(3)").text();
    pet.love = parseFloat(s);

    // pet race & code
    s = table.find("tr:eq(16) td:eq(3)").text();
    pet.race = s;
    pet.code = parseInt(util.substringBetween(s, "(", ")"));
}