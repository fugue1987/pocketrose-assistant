/**
 * ============================================================================
 * [ 宠 物 功 能 模 块 ]
 * ============================================================================
 */

import * as network from "./network";
import * as pocket from "./pocket";
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
    _picture;
    _health;
    _maxHealth;
    _spell1;
    _spell2;
    _spell3;
    _spell4;
    _usingSpell1;
    _usingSpell2;
    _usingSpell3;
    _usingSpell4;
    _spell1Description;
    _spell2Description;
    _spell3Description;
    _spell4Description;
    _attack;
    _defense;
    _specialAttack;
    _specialDefense;
    _speed;
    _love;
    _attribute1;
    _attribute2;
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

    get picture() {
        return this._picture;
    }

    set picture(value) {
        this._picture = value;
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

    get usingSpell1() {
        return this._usingSpell1;
    }

    set usingSpell1(value) {
        this._usingSpell1 = value;
    }

    get usingSpell2() {
        return this._usingSpell2;
    }

    set usingSpell2(value) {
        this._usingSpell2 = value;
    }

    get usingSpell3() {
        return this._usingSpell3;
    }

    set usingSpell3(value) {
        this._usingSpell3 = value;
    }

    get usingSpell4() {
        return this._usingSpell4;
    }

    set usingSpell4(value) {
        this._usingSpell4 = value;
    }

    get spell1Description() {
        return this._spell1Description;
    }

    set spell1Description(value) {
        this._spell1Description = value;
    }

    get spell2Description() {
        return this._spell2Description;
    }

    set spell2Description(value) {
        this._spell2Description = value;
    }

    get spell3Description() {
        return this._spell3Description;
    }

    set spell3Description(value) {
        this._spell3Description = value;
    }

    get spell4Description() {
        return this._spell4Description;
    }

    set spell4Description(value) {
        this._spell4Description = value;
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

    get attribute1() {
        return this._attribute1;
    }

    set attribute1(value) {
        this._attribute1 = value;
    }

    get attribute2() {
        return this._attribute2;
    }

    set attribute2(value) {
        this._attribute2 = value;
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

    get imageHTML() {
        const src = pocket.DOMAIN + "/image/pet/" + this._picture;
        return "<img src='" + src + "' width='64' height='64' alt='" + this._race + "' style='border-width:0'>";
    }

    get spell1HTML() {
        if (this._usingSpell1 && this._spell1 !== "通常攻击") {
            return "<span title='" + this._spell1Description + "' style='color:red'>" + this.spell1 + "</span>";
        } else {
            return "<span title='" + this._spell1Description + "'>" + this.spell1 + "</span>";
        }
    }

    get spell2HTML() {
        if (this._usingSpell2 && this._spell2 !== "通常攻击") {
            return "<span title='" + this._spell2Description + "' style='color:red'>" + this.spell2 + "</span>";
        } else {
            return "<span title='" + this._spell2Description + "'>" + this.spell2 + "</span>";
        }
    }

    get spell3HTML() {
        if (this._usingSpell3 && this._spell3 !== "通常攻击") {
            return "<span title='" + this._spell3Description + "' style='color:red'>" + this.spell3 + "</span>";
        } else {
            return "<span title='" + this._spell3Description + "'>" + this.spell3 + "</span>";
        }
    }

    get spell4HTML() {
        if (this._usingSpell4 && this._spell4 !== "通常攻击") {
            return "<span title='" + this._spell4Description + "' style='color:red'>" + this.spell4 + "</span>";
        } else {
            return "<span title='" + this._spell4Description + "'>" + this.spell4 + "</span>";
        }
    }
}

/**
 * 寻找正在使用中的宠物
 * @param petList 宠物列表
 * @returns {undefined|Pet}
 */
export function findUsingPet(petList) {
    for (const pet of petList) {
        if (pet.using) {
            return pet;
        }
    }
    return undefined;
}

/**
 * 加载当前身上宠物列表
 * @param credential 用户凭证
 * @returns {Promise<Pet[]>}
 */
export async function loadPets(credential) {
    const doLoadPets = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "PETSTATUS";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const petList = parsePetList(html);
                resolve(petList);
            });
        });
    };
    return await doLoadPets(credential);
}

/**
 * 解析页面上所有宠物的信息
 * @param html HTML
 * @returns {Pet[]}
 */
export function parsePetList(html) {
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

export function petListAsMap(petList) {
    const petMap = {};
    for (const pet of petList) {
        petMap[pet.index] = pet;
    }
    return petMap;
}

// ----------------------------------------------------------------------------
// P R I V A T E   F U N C T I O N S
// ----------------------------------------------------------------------------

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

    // pet picture & health
    s = table.find("tr:eq(2) td:eq(0) img").attr("src");
    pet.picture = s.substring(s.lastIndexOf("/") + 1);
    s = table.find("tr:eq(2) td:eq(2)").text();
    pet.health = parseInt(util.substringBeforeSlash(s));
    pet.maxHealth = parseInt(util.substringAfterSlash(s));

    // pet spells
    s = table.find("tr:eq(3) td:eq(1)").text();
    pet.spell1 = util.substringBefore(s, "(威力：");
    pet.usingSpell1 = s.includes("(使用中)");
    pet.spell1Description = s;
    pet.spell1Description += " " + table.find("tr:eq(4) td:eq(1)").text();
    s = table.find("tr:eq(5) td:eq(1)").text();
    pet.spell2 = util.substringBefore(s, "(威力：");
    pet.usingSpell2 = s.includes("(使用中)");
    pet.spell2Description = s;
    pet.spell2Description += " " + table.find("tr:eq(6) td:eq(1)").text();
    s = table.find("tr:eq(7) td:eq(1)").text();
    pet.spell3 = util.substringBefore(s, "(威力：");
    pet.usingSpell3 = s.includes("(使用中)");
    pet.spell3Description = s;
    pet.spell3Description += " " + table.find("tr:eq(8) td:eq(1)").text();
    s = table.find("tr:eq(9) td:eq(1)").text();
    pet.spell4 = util.substringBefore(s, "(威力：");
    pet.usingSpell4 = s.includes("(使用中)");
    pet.spell4Description = s;
    pet.spell4Description += " " + table.find("tr:eq(10) td:eq(1)").text();

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

    // pet attributes
    pet.attribute1 = table.find("tr:eq(14) td:eq(1)").text();
    pet.attribute2 = table.find("tr:eq(14) td:eq(3)").text();

    // pet race & code
    s = table.find("tr:eq(16) td:eq(3)").text();
    pet.race = s;
    pet.code = util.substringBetween(s, "(", ")");
}