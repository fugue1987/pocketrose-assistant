/**
 * ============================================================================
 * [ 口 袋 宠 物 通 用 模 块 ]
 * ============================================================================
 */

import * as constant from "../common/common_constant";
import * as util from "../common/common_util";
import * as network from "../common/common_network";

/**
 * 描述宠物的通用数据结构。
 */
export class PocketPet {

    index;                  // 下标（唯一性）
    name;
    gender;
    using;
    level;
    picture;
    health;
    maxHealth;
    spell1;                 // 技能1
    spell2;                 // 技能2
    spell3;                 // 技能3
    spell4;                 // 技能4
    usingSpell1;            // 是否使用技能1
    usingSpell2;            // 是否使用技能2
    usingSpell3;            // 是否使用技能3
    usingSpell4;            // 是否使用技能4
    spell1Description;      // 技能1描述
    spell2Description;      // 技能2描述
    spell3Description;      // 技能3描述
    spell4Description;      // 技能4描述
    attack;
    defense;
    specialAttack;
    specialDefense;
    speed;
    love;
    attribute1;
    attribute2;
    race;
    code;

    get imageHTML() {
        const src = constant.DOMAIN + "/image/pet/" + this.picture;
        return "<img src='" + src + "' width='64' height='64' alt='" + this.race + "' style='border-width:0'>";
    }

}

export class PocketPetList {

    #petList;

    constructor() {
        this.#petList = [];
    }

    push(pet) {
        this.#petList.push(pet);
    }

    /**
     * Return pets as list
     * @returns {PocketPet[]}
     */
    asList() {
        return this.#petList;
    }

    /**
     * Return pets as map.
     * @returns {{number:PocketPet}}
     */
    asMap() {
        const map = {};
        for (const pet of this.#petList) {
            map[pet.index] = pet;
        }
        return map;
    }

    /**
     * Find current using pet.
     * @returns {undefined|PocketPet}
     */
    get usingPet() {
        for (const pet of this.#petList) {
            if (pet.using) {
                return pet;
            }
        }
        return undefined;
    }
}

/**
 * 解析页面上所有宠物的信息
 * @param html HTML
 * @returns {PocketPetList}
 */
export function parsePersonalPetList(html) {
    const petList = new PocketPetList();
    $(html).find("input:radio[name='select']").each(function (_idx, radio) {
        const index = $(radio).val();
        if (index >= 0) {
            // index为-1的意味着“无宠物”那个选项
            const table = $(radio).closest("table");
            // pet index & using
            const pet = new PocketPet();
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
 * 解析页面上反馈的宠物技能学习配置情况
 * @param html HTML
 * @returns {number[]}
 */
export function parsePersonalPetStudyStatus(html) {
    const studyStatus = [];
    $(html).find("input:checkbox:checked").each(function (_idx, checkbox) {
        const name = $(checkbox).attr("name");
        if (name.startsWith("study")) {
            studyStatus.push(parseInt($(checkbox).val()));
        }
    });
    return studyStatus;
}

/**
 * 加载当前身上宠物列表
 * @param credential 用户凭证
 * @returns {Promise<PocketPetList>}
 */
export async function loadPersonalPetList(credential) {
    const doLoadPets = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "PETSTATUS";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const petList = parsePersonalPetList(html);
                resolve(petList);
            });
        });
    };
    return await doLoadPets(credential);
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