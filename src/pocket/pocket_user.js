/**
 * ============================================================================
 * [ 口 袋 用 户 通 用 模 块 ]
 * ============================================================================
 */

export class PocketRole {

    name;               // 姓名
    level;              // 等级
    health;
    maxHealth;
    mana;
    maxMana;
    attack;
    defense;
    specialAttack;
    specialDefense;
    speed;
    attribute;
    location;           // 所在位置(TOWN|CASTLE|WILD)
    coordinate;         // 所在坐标(location=CASTLE)
    castleName;         // 城堡名称(location=CASTLE)
    townName;           // 城市名称(location=TOWN)
    experience;
    cash;
    career;
    masterCareerList;

    asShortText() {
        return this.name + " " + this.level +
            " " + this.health + "/" + this.maxHealth +
            " " + this.mana + "/" + this.maxMana +
            " " + this.attack +
            " " + this.defense +
            " " + this.specialAttack +
            " " + this.specialDefense +
            " " + this.speed;
    }
}