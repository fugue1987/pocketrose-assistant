export const _CAREER_DICT = {
    "兵士": {"id": 0},
    "武士": {"id": 1},
    "剑客": {"id": 2},
    "剑侠": {"id": 3},
    "魔法剑士": {"id": 4},
    "暗黑剑士": {"id": 5},
    "奥法剑士": {"id": 6},
    "魔导剑士": {"id": 7},
    "神圣剑士": {"id": 8},
    "圣殿武士": {"id": 9},
    "剑圣": {"id": 10},
    "枪战士": {"id": 11},
    "重战士": {"id": 12},
    "狂战士": {"id": 13},
    "龙战士": {"id": 14},
    "武僧": {"id": 15},
    "决斗家": {"id": 16},
    "拳王": {"id": 17},
    "术士": {"id": 18},
    "魔法师": {"id": 19},
    "咒灵师": {"id": 20},
    "大魔导士": {"id": 21},
    "牧师": {"id": 22},
    "德鲁伊": {"id": 23},
    "贤者": {"id": 24},
    "弓箭士": {"id": 25},
    "魔弓手": {"id": 26},
    "狙击手": {"id": 27},
    "游侠": {"id": 28},
    "巡林客": {"id": 29},
    "吟游诗人": {"id": 30},
    "小天位": {"id": 31},
    "强天位": {"id": 32},
    "斋天位": {"id": 33},
    "太天位": {"id": 34},
    "终极": {"id": 35}
};

/**
 * 解析可以转职的职业名称列表。
 * @param pageHTML
 * @returns {string[]}
 */
export function parseCareerCandidateList(pageHTML) {
    const careerCandidateList = [];
    $(pageHTML)
        .find("select[name='syoku_no']")
        .find("option")
        .each(function (_idx, option) {
            const value = $(option).val();
            if (value !== "") {
                const career = $(option).text().trim();
                careerCandidateList.push(career);
            }
        });
    return careerCandidateList;
}