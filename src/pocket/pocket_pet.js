/**
 * ============================================================================
 * [ 口 袋 宠 物 通 用 模 块 ]
 * ============================================================================
 */

import * as constant from "../common/common_constant";

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