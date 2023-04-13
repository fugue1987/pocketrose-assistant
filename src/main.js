// ==UserScript==
// @name         pocketrose assistant
// @namespace    https://pocketrose.itsns.net.cn/
// @description  Intercepts and modifies pocketrose CGI requests
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      mit
// @author       xiaohaiz,fugue
// @version      1.6.0.RC4
// @grant        unsafeWindow
// @match        *://pocketrose.itsns.net.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-cookie/3.0.1/js.cookie.min.js
// @run-at       document-start
// @unwrap
// ==/UserScript==

// ============================================================================
// 口 袋 助 手 郑 重 承 诺
// ----------------------------------------------------------------------------
// 所有验证码破解的相关领域都设立为禁区，我们绝对不触碰验证码破解！
// ============================================================================

import * as castle from "./castle";
import * as constant from "./constant";
import * as map from "./map";
import * as network from "./network";
import * as npc from "./npc";
import * as pokemon from "./pokemon";
import * as user from "./user";

// 转职建议字典，对当前能力的需求，分别是MP，攻击，防御，智力，精神，速度
const transferCareerRequirementDict = {
    '圣殿武士': [900, 225, 225, 325, 225, 275],
    '剑圣': [900, 225, 275, 225, 275, 225],
    '龙战士': [900, 225, 225, 325, 325, 225],
    '拳王': [900, 225, 225, 325, 225, 275],
    '咒灵师': [900, 325, 275, 225, 225, 325],
    '大魔导士': [900, 275, 275, 225, 225, 275],
    '贤者': [900, 275, 225, 225, 275, 325],
    '狙击手': [900, 225, 325, 325, 225, 225],
    '吟游诗人': [900, 225, 325, 225, 325, 225]
};

// 属性重铠的名字
const heavyArmorNameDict = [
    "千幻碧水猿洛克奇斯",
    "地纹玄甲龟斯特奥特斯",
    "幽冥黑鳞蟒罗尼科斯",
    "火睛混沌兽哈贝达",
    "羽翅圣光虎阿基勒斯",
    "金翅追日鹰庞塔雷斯",
    "风翼三足凤纳托利斯"
];

const _PROHIBIT_SELLING_ITEM_DICT = [
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
    "龙"
];

/**
 * 终极隐藏职业天位系的职业名称定义。
 * @type {string[]}
 * @private
 */
const _ROLE_TOP_CAREER_DICT = [
    "小天位",
    "强天位",
    "斋天位",
    "太天位",
    "终极"
];

const _CAREER_DICT = {
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

const _CITY_DICT = {
    "1": {
        "name": "贤者之城",
        "description": "精灵族的王都，在精灵语中意为山谷中的隐居之城，因数位异族出身的贤者都选择在此谢世而得名。种植着珍贵草药的山谷另一端有巨大的水坝，传说曾三次以毁灭性方式成功驱赶妄图入侵的军队。",
        "x": 14,
        "y": 0
    },
    "2": {
        "name": "翡冷翠",
        "description": "大陆西海岸城市， 著名的纺织业都市，也有可耕作的土地以及贸易的港口，农业和商业都比较发达，故而坎德人的事业长存。",
        "x": 1,
        "y": 11
    },
    "3": {
        "name": "诺曼",
        "description": "滨海城市，曾是大陆最大的造船业基地，后因战火而数度覆没，现在虽然仍建造船只，但规模远逊昔日。",
        "x": 2,
        "y": 12
    },
    "4": {
        "name": "潘帕斯",
        "description": "肥沃的土地，丰富的水源，传统型农业都市也一直是粮棉产地和经济发达地区。素有“大陆粮仓”及“天府之国”之称。自古有在二月举行祭拜农神五旬节庆典。而九月举行的大型农牧业交易会也是整个大陆最繁盛的聚会之一。",
        "x": 3,
        "y": 8
    },
    "5": {
        "name": "卡鲁",
        "description": "山顶矮人的重要居城要塞，依山而筑坚固无比，在这里曾掀起过高山矮人和丘陵矮人手足阋墙的矮人门战役。",
        "x": 1,
        "y": 6
    },
    "6": {
        "name": "格林尼治",
        "description": "自称是人类最古老的村落，因临近矮人王国而时常成为斗争的前源，传统上从事护送商队穿越沙漠的工作，但信誉始终是最大问题。",
        "x": 1,
        "y": 3
    },
    "7": {
        "name": "萨拉镇",
        "description": "多种族混居的城市，各种珍稀物品的输入输出地，唯一即使在战争中也会全年都对其他种族开放的城市，尽管如此，仍然能感到某种难以言明的不调合感。",
        "x": 3,
        "y": 5
    },
    "8": {
        "name": "海文",
        "description": "矮人族连接山区和草原的重要中转站，春季会在附近原野举行大型交易会，是无论什么种族也会受到平等接待的地方。",
        "x": 4,
        "y": 11
    },
    "9": {
        "name": "黄昏之都",
        "description": "精灵们称呼此地为“艾本德”精灵语意为“神圣的黄昏”。据说环绕城市的一草一木都是古代精灵的化身，在此地时常可见到上年纪的精灵，足以证明精灵并非不老不死，在精灵族的传说中，此地将是本族最终安睡之地。",
        "x": 5,
        "y": 14
    },
    "10": {
        "name": "圣克鲁斯堡",
        "description": "旧神殿所在之地，新旧城都充满魅力，既是著名观光都市，也是重要的宗教圣地，这里有着全大陆信仰的中心“光之神殿”。",
        "x": 5,
        "y": 6
    },
    "11": {
        "name": "泰法城",
        "description": "精灵所修建的完整灌溉系统的农业城市，重要的粮食蔬果生产地，此地出产的各种水果酒都享有盛名，每年夏末举行的祭典会有限制的邀请其他种族成员参加，这对向来以自傲排他的精灵传统而言已经是相当开放的行为了。",
        "x": 5,
        "y": 8
    },
    "12": {
        "name": "枫丹",
        "description": "原帝国冬都，又名白露城，号称四百年无战之都。大陆联合商会所在地，无数传说的源头，号称大冒险大恋爱的起点。",
        "x": 6,
        "y": 10
    },
    "13": {
        "name": "自由港_赞特",
        "description": "大陆南岸著名的自由城市，也是全大陆最大的贸易港。不属于大陆任何势力，由当地人组成的三级议会管理着城市，拥有绝对的自治。自古就流传着在此能通过各种渠道买到各种你所能想象以及想象不到的东西。",
        "x": 5,
        "y": 0
    },
    "14": {
        "name": "火之都",
        "description": "军事化气氛浓厚的矮人都市，热火朝天的锻造之城，因为临近火山口，故得此名，囤积的兵器充斥山腹改造的仓库。",
        "x": 5,
        "y": 2
    },
    "15": {
        "name": "土之域",
        "description": "山中小都市,露出地面的矮人都市，传说为人类遗留，但地点却远离人类文明影响的范围，接近地精族，故而专攻兵器装饰用宝石的研磨。",
        "x": 10,
        "y": 2
    },
    "16": {
        "name": "瓦伦要塞",
        "description": "边境要塞, 因邻接半兽人土地，军事化气氛浓厚，几乎是全男子编制的要塞都市，但重要的食粮输入也是通 过此地进行，所以时常充满着怪异的紧张气氛。 ",
        "x": 11,
        "y": 11
    },
    "17": {
        "name": "梵",
        "description": "居住着人马族重要长老的小城，洋溢着仿佛时光停滞般悠闲气氛的山中秘境，人马族的贤者之塔也建造在此，因为其中藏着重要的预言书，故而对其他种族严格戒备。",
        "x": 7,
        "y": 3
    },
    "18": {
        "name": "日尔曼尼亚",
        "description": "野蛮人重要的据点，虽然生活着半数以上的平民，同时也是半军事化的壁垒，秋季有长达半个月的狩猎大会。",
        "x": 7,
        "y": 8
    },
    "19": {
        "name": "水之城",
        "description": "又称“废弃的水之城壁”，在与大湖连接的村子里，有着明显是人类遗迹的建筑，被当作是便利的集会场所使用着，传说这里有半兽人唯一的藏书室。",
        "x": 9,
        "y": 5
    },
    "20": {
        "name": "埃达",
        "description": "防备着矮人城市圈的小型要塞，地震曾多次摧毁整个城市，目前的城市建造在矮人族废弃的矿洞之中，大概会因为维持费过高被放弃吧。",
        "x": 11,
        "y": 5
    },
    "21": {
        "name": "柯利亚",
        "description": "和矮人都市圈连接的小城市，农耕传统悠久，盛产香菜之类的烹饪用料，饮食业发达，目前正致力推广清淡素食。",
        "x": 12,
        "y": 4
    },
    "22": {
        "name": "格兰特",
        "description": "人马族密语中伟大的意思，是极为独特的人马族栖息之地，宁静的学问之都，有整个大陆最大的图书馆和第 一代大魔法师爱德华的陵墓，发现温泉后，也逐渐发展起疗养旅游业。",
        "x": 11,
        "y": 7
    },
    "23": {
        "name": "斯坎",
        "description": "最靠近食人魔所在的城市，由纯法师血统者构成的研究者群体建造，为的是就近监视、研究最古老的食人魔 种族，又称\"性格扭曲者之城\"。",
        "x": 10,
        "y": 8
    },
    "24": {
        "name": "龙牙堡",
        "description": "又名龙之牙，野蛮人，人类和其他种族战争中建立的要塞，城市盘踞建造在山岩上，因地势险要，历来在此发生的战斗不计其数。死伤者鲜血早已渗透了要塞附近的土壤，远远望去，裸露的岩石形貌狰狞，周围隐透血色，宛如泣血龙牙。",
        "x": 8,
        "y": 9
    },
    "25": {
        "name": "海布里",
        "description": "半兽人 贝里萨利乌斯族生活的集落，是半兽人中最为勇猛、尚武的一支，如今正遭遇百年不遇的人口锐减，百年前曾和人类共同作战，据信村中仍有混血的后代，出产美酒，被誉为大陆第一的珍酿。",
        "x": 7,
        "y": 11
    },
    "26": {
        "name": "风之谷",
        "description": "又一邻接人马族据点的村落，非常偏僻隐蔽，传说中三族勇者用来存放光明神器的地点，唯有神器仍在，才能镇丄压黑暗势力卷土重来，奇妙的是矮人族却将此地视为不祥之地。",
        "x": 8,
        "y": 12
    },
    "27": {
        "name": "不归森林",
        "description": "传说最初是吞噬无数人性命的黑色森林，又传是埋葬着化身为魔的战败神的坟墓，但是真相已经湮没在历史和频繁发生的地震中，因为设有保护性禁制结界，所以体力系和黑暗系在此地进行战斗会很吃亏。",
        "x": 9,
        "y": 13
    },
    "28": {
        "name": "特罗尔",
        "description": "以神话中的食人巨妖命名的城市，地处沙漠区内最外侧绿州边缘，是唯一非人类占多数的人类都市，又称暗 之都，在食人魔的势力圈里奇妙地存在着，流行着既非人类又非食人魔共存不可思议的生活方式。",
        "x": 13,
        "y": 14
    }
};

const _WEAPON_DICT = [
    "神枪 永恒",
    "霸邪斧 天煌",
    "魔刀 哭杀",
    "神器 苍穹",
    "魔神器 幻空",
    "真·圣剑 苍白的正义",
    "双经斩",
    "1.5倍界王拳套",
    "九齿钉耙",
    "降魔杖",
    "2015.02.14情人节巧克力",
    "2005.5.1-2006.5.1劳动升级版",
    "波斯弯刀",
    "女神之剑",
    "星夜之弓",
    "鲁恩之刀",
    "裂天矛",
    "沉默之剑",
    "破云弓",
    "光之剑",
    "巨魔弓 世界",
    "邪骇灵杖",
    "战魔刀",
    "闪刺枪",
    "妖枪 影",
    "传说之剑",
    "魔杖 霜雪",
    "生存之刀",
    "月牙型剑",
    "白金枪",
    "炙雷之斧",
    "圣纹剑",
    "铭刀长刀",
    "水晶刀",
    "龙鳞铠胄",
    "恶魔锁甲",
    "圣枪 隆基诺斯",
    "飞凤枪",
    "雨之村云",
    "影忍者刀",
    "鸣雷剑",
    "铳剑",
    "刺馈剑",
    "双刃",
    "秘剑 天下",
    "赎罪镇魂剑",
    "虚空之枪",
    "封魔弓",
    "霸枪 龙息",
    "光阴之剑",
    "大马士革钢刀",
    "秘银长剑",
    "流星闪爪",
    "奥利哈钢剑",
    "月牙法杖",
    "冰之拳套",
    "鬼灵之弓",
    "邪双华",
    "震雷匕首",
    "财富之军刀",
    "空斩短刃",
    "白银弓",
    "圣杖 天问",
    "绿玉投枪",
    "世界树之枝",
    "精灵之弓矢",
    "夺魂冰钩",
    "圣使之刺剑",
    "秘刀 走雪",
    "血之剑",
    "寡妇制造器",
    "瓦谕剑",
    "封神剑 天劫",
    "奥利哈钢匕首"
];

const _ARMOR_DICT = [
    "千幻碧水猿洛克奇斯",
    "地纹玄甲龟斯特奥特斯",
    "幽冥黑鳞蟒罗尼科斯",
    "火睛混沌兽哈贝达",
    "羽翅圣光虎阿基勒斯",
    "金翅追日鹰庞塔雷斯",
    "风翼三足凤纳托利斯",
    "圣皇铠甲 天威",
    "薄翼甲",
    "2015.01.29十周年纪念",
    "背德魔铠",
    "月冰石之头巾",
    "斗神铠 狂狱",
    "风之法袍",
    "夜魔披风",
    "飞马头盔",
    "逆魔道袍",
    "星之甲",
    "犰狳铁皮甲",
    "英雄斗篷",
    "修罗轻衣",
    "雷之法袍",
    "锁子鳞甲",
    "纹章盾",
    "霜雪长袍",
    "古代头盔",
    "怨灵邪衣",
    "龙之盔甲",
    "冥铠 幽辉",
    "古代の铠甲",
    "龙鳞铠胄",
    "恶魔锁甲",
    "战士铠甲",
    "塔盾",
    "忍者头巾",
    "武者之铠",
    "镜盾",
    "守鹤之盾",
    "冥雷战甲",
    "金制头盔",
    "圣袍 光明",
    "金制锁甲",
    "软鳞甲",
    "护肩盾",
    "龙鳞长袍",
    "神之法袍",
    "幻衣 夕雾",
    "英雄王冠",
    "圣衣 苍羽",
    "火之法袍",
    "钢岩护甲",
    "火之锁甲",
    "吟游诗人双面上装",
    "勇者斗篷",
    "冰河兽革",
    "暗之法袍",
    "魔铠 血炙",
    "龙盾",
    "枭之甲",
    "螺旋盾",
    "霸铠 吞天",
    "鲁恩头盔",
    "龙铠 牙刃",
    "冰之法袍",
    "紫杉叶长袍",
    "女神之铠",
    "咒袍 孤星",
    "巨人之铠",
    "孔雀袍",
    "羽毛帽"
];

const _ACCESSORY_DICT = [
    "魔盔 虚无",
    "神冠 灵通",
    "龙",
    "千与千寻",
    "勿忘我",
    "魔法使的闪光弹",
    "2015.02.14情人节玫瑰",
    "圣王玉坠",
    "月牙之戒",
    "龙结晶",
    "龙鳞冠",
    "黒影之项链",
    "人面鸟",
    "深红蔷薇",
    "魔金头环",
    "红色羽毛",
    "王者之靴 圣踏",
    "强运之耳饰",
    "头带",
    "陨石之光",
    "魔法头带",
    "雾之项链",
    "独角兽",
    "银制耳饰",
    "司祭头环",
    "战王之证",
    "极光护轮",
    "红月之角笛",
    "鬼面",
    "龙鳞护腕",
    "猫眼",
    "月之水滴",
    "雷鸣指环",
    "黑核晶",
    "铁制头盔",
    "钢制护手",
    "逆十字架",
    "黄金王冠",
    "龙牙冠",
    "鲁恩耳饰",
    "狮鹫兽",
    "沉睡之护符",
    "风之环",
    "冰鱼之勾玉",
    "魔炎战盔",
    "束缚之耳饰",
    "天马",
    "白金指环",
    "魔精玉",
    "蓝色羽毛",
    "圣心符",
    "银制指环",
    "陆行鸟",
    "绿色羽毛",
    "红头巾",
    "天使的羽毛",
    "烈岩头盔",
    "火神的指环",
    "速风之羽",
    "攻击之护符",
    "星盔 闪",
    "水女神的指环",
    "晶之冠",
    "金制胸针",
    "极光之翼",
    "雪的结晶"
];

function __cookie_getEnablePokemonWiki() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_POKEMON_WIKI");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

function __cookie_getEnableSoldAutoDeposit() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_SOLD_AUTO_DEPOSIT");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

function __cookie_getHealthLoseAutoLodgeRatio() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__HEALTH_LOSE_AUTO_LODGE_RATIO");
    if (value === undefined) {
        return 0.6;
    }
    return parseFloat(value);
}

function __cookie_getManaLoseAutoLodgePoint() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__MANA_LOSE_AUTO_LODGE_POINT");
    if (value === undefined) {
        return 100;
    }
    return parseInt(value);
}

function __cookie_getRepairItemThreshold() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD");
    if (value === undefined) {
        return 100;
    }
    return parseInt(value);
}

function __cookie_getDepositBattleNumber() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__DEPOSIT_BATTLE_NUMBER");
    if (value === undefined) {
        return 10;
    }
    return parseInt(value);
}

function __cookie_getReturnButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__RETURN_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "少年輕輕的離開，沒有帶走一片雲彩！";
    }
    return unescape(value);
}

function __cookie_getDepositButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__DEPOSIT_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "順風不浪，逆風不慫，身上不要放太多的錢！";
    }
    return unescape(value);
}

function __cookie_getLodgeButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__LODGE_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "你看起來很疲憊的樣子呀，媽媽喊你回去休息啦！";
    }
    return unescape(value);
}

function __cookie_getRepairButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__REPAIR_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "去修理下裝備吧，等爆掉的時候你就知道痛了！";
    }
    return unescape(value);
}

function __cookie_getEnableBattleAutoScroll() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_AUTO_SCROLL");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

function __cookie_getEnableBattleForceRecommendation() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_FORCE_RECOMMENDATION");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

function __cookie_getEquipmentSet(no, id) {
    const cookieKey = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_" + no + "_" + id;
    return getAndParseCookie(cookieKey, ["NONE", "0", "NONE", "0", "NONE", "0"], function (value) {
        const text = unescape(value);
        return text.split("_");
    });
}

/**
 * 检查是否启用十二宫战斗时的极速模式
 * @returns boolean 默认禁用
 * @private
 */
function __cookie_getEnableZodiacFlashBattle() {
    const cookieKey = "_POCKETROSE_ASSISTANT__ENABLE_ZODIAC_FLASH_BATTLE";
    return getAndParseCookie(cookieKey, false, function (value) {
        return value !== "0";
    });
}

/**
 * 读取指定键值的Cookie内容并调用回调函数解析。
 * @param cookieKey Cookie键值
 * @param defaultValue 如果没有设置此Cookie时的默认返回值
 * @param callback 回调函数用于解析Cookie值
 * @returns {*}
 */
function getAndParseCookie(cookieKey, defaultValue, callback) {
    let value = Cookies.get(cookieKey);
    if (value === undefined || value === "") {
        return defaultValue;
    }
    return callback(value);
}

$(function () {
    replacePkm('pocketrose')
});

function replacePkm(page) {
    if (location.href.includes(page)) {
        $(document).ready(function () {
            if (__cookie_getEnablePokemonWiki()) {
                processPokemonWikiReplacement();
            }
            if (location.href.includes("status.cgi")) {
                postProcessMainStatusFunctionalities($('html').html());
            }
            if (location.href.includes("battle.cgi")) {
                postProcessBattleRelatedFunctionalities($('html').html());
            }
            if (location.href.includes("town.cgi")) {
                postProcessCityRelatedFunctionalities($('html').html());
            }
            if (location.href.includes("mydata.cgi")) {
                postProcessPersonalStatusRelatedFunctionalities($('html').html());
            }
        })
    }
}

// ============================================================================
// 工具功能函数实现
// ============================================================================

/**
 * 取斜杠前的内容，支持斜杠前带一个空格的情况。
 * @param text
 * @private
 */
function __utilities_substringBeforeSlash(text) {
    var index = text.indexOf(" /");
    if (index != -1) {
        return text.substring(0, index);
    }
    index = text.indexOf("/");
    if (index != -1) {
        return text.substring(0, index);
    }
    return text;
}

/**
 * 取斜杠后的内容，支持斜杠后带一个空格的情况。
 * @private
 */
function __utilities_substringAfterSlash(text) {
    var index = text.indexOf("/ ");
    if (index != -1) {
        return text.substring(index + 2);
    }
    index = text.indexOf("/");
    if (index != -1) {
        return text.substring(index + 1);
    }
    return text;
}

function __utilities_trimSpace(text) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        let c = text[i];
        if (c !== ' ') {
            result += c;
        }
    }
    return result;
}

function __utilities_convertEncodingToUtf8(response, fromEncoding) {
    const decoder = new TextDecoder(fromEncoding);
    const uint8Array = new Uint8Array(response.length);

    for (let i = 0; i < response.length; i++) {
        uint8Array[i] = response.charCodeAt(i);
    }

    return decoder.decode(uint8Array);
}

/**
 * 判断指定的名字是否为属性重铠，支持齐心重铠的检查。
 * @private
 */
function __utilities_isHeavyArmor(name) {
    for (var i = 0; i < heavyArmorNameDict.length; i++) {
        if (name.indexOf(heavyArmorNameDict[i]) != -1) {
            return true;
        }
    }
    return false;
}

/**
 * 检查指定的职业是否为天位系隐藏职业
 * @param career 等待检查的职业
 * @private
 */
function __utilities_isRoleTopCareer(career) {
    for (let i = 0; i < _ROLE_TOP_CAREER_DICT.length; i++) {
        if (career === _ROLE_TOP_CAREER_DICT[i]) {
            return true;
        }
    }
    return false;
}

function __utilities_formalizeRoleTopCareer(career) {
    for (let i = 0; i < _ROLE_TOP_CAREER_DICT.length; i++) {
        if (career.indexOf(_ROLE_TOP_CAREER_DICT[i]) != -1) {
            return _ROLE_TOP_CAREER_DICT[i];
        }
    }
    return undefined;
}

/**
 * 检查装备是否已经满经验。
 * @param name 装备名称
 * @param power 装备威力
 * @param experience 装备当前经验
 * @private
 */
function __utilities_checkIfEquipmentFullExperience(name, power, experience) {
    if (name == "大师球" || name == "宗师球" || name == "超力怪兽球" || name == "宠物蛋") {
        return false;
    }
    let maxExperience = 0;
    if (__utilities_isHeavyArmor(name)) {
        // 属性重铠满级经验为76000
        maxExperience = 76000;
    } else if (power != 0) {
        power = Math.abs(power);
        maxExperience = Math.floor(power * 0.2) * 1000;
    }
    return experience >= maxExperience;
}

// ============================================================================
// 通用辅助功能函数实现
// ============================================================================

function __lookupTownIdByName(townName) {
    let cityIds = Object.keys(_CITY_DICT);
    for (let i = 0; i < cityIds.length; i++) {
        let id = cityIds[i];
        let city = _CITY_DICT[id];
        let cityName = city["name"];
        if (townName.indexOf(cityName) !== -1) {
            return id;
        }
    }
    // 人在野外的情况
    return "-1";
}

function __isCityCoordinate(x, y) {
    let cityIds = Object.keys(_CITY_DICT);
    for (let i = 0; i < cityIds.length; i++) {
        let id = cityIds[i];
        let city = _CITY_DICT[id];
        if (x === city["x"] && y === city["y"]) {
            return true;
        }
    }
    return false;
}

/**
 * 检查是否无效的藏宝图
 * @param x X坐标
 * @param y Y坐标
 * @returns {boolean}
 */
function isUnavailableTreasureHintMap(x, y) {
    if (x < 0 || y < 0) {
        return true;
    }
    return __isCityCoordinate(x, y);
}

// ============================================================================
// 通用辅助功能函数实现
// ============================================================================

/**
 * 在页面的最下方构建一个NPC的消息表格。
 * @param npcName NPC名字，对应字典中的预定义
 * @private
 */
function __page_constructNpcMessageTable(npcName) {
    let NPC = npc.getNPC(npcName);
    let image = "<img src='" + NPC["image"] + "' width='64' height='64' alt='" + npcName + "'>";
    $("div:last").prepend("<TABLE WIDTH='100%' bgcolor='#888888' id='npcMessageTable'><tbody><tr>" +
        "<TD id='npcMessageCell' bgcolor='#F8F0E0' height='5'>" +
        "<table bgcolor='#888888' border='0'><tbody><tr>" +
        "<td bgcolor='#F8F0E0'>" + image + "</td>" +
        "<td width='100%' bgcolor='#000000' id='npcMessage'></td></tr></tbody></table>" +
        "</TD>" +
        "</tr></tbody></TABLE>");
}

/**
 * 向NPC消息表格中添加消息，尾加模式。
 * @param message 消息内容。
 * @private
 */
function __page_writeNpcMessage(message) {
    var formattedMessage = "<font color='#FFFFFF'>" + message + "</font>";
    var currentMessage = $("#npcMessage").html();
    $("#npcMessage").html(currentMessage + formattedMessage);
}

/**
 * 从当前页面读出id
 * @returns string
 * @private
 */
function __page_readIdFromCurrentPage() {
    return $("input[name='id']").first().attr("value");
}

/**
 * 从当前页面读出pass
 * @returns string
 * @private
 */
function __page_readPassFromCurrentPage() {
    return $("input[name='pass']").first().attr("value");
}

function convertEncodingToUtf8(response, fromEncoding) {
    const decoder = new TextDecoder(fromEncoding);
    const uint8Array = new Uint8Array(response.length);

    for (let i = 0; i < response.length; i++) {
        uint8Array[i] = response.charCodeAt(i);
    }

    return decoder.decode(uint8Array);
}


function readCastleInformation(id, pass, callback) {
    fetch("castle_print.cgi", {
        method: "GET"
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));

            const castles = {};
            $(html).find("td").each(function (_idx, td) {
                const tdText = $(td).text();
                if (tdText.endsWith(" (自购)")) {
                    const castleName = $(td).prev().text();
                    const castleOwner = tdText.substring(0, tdText.indexOf(" (自购)"));
                    const castleLocationText = $(td).next().text();
                    const coordinate = castleLocationText.substring(1, castleLocationText.length - 1).split(",");
                    const castleLocation = [parseInt(coordinate[0]), parseInt(coordinate[1])];
                    castles[castleOwner] = {
                        "name": castleName,
                        "owner": castleOwner,
                        "coordinate": castleLocation
                    };
                }
            });
            callback({"id": id, "pass": pass, "html": html}, castles);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

/**
 * 异步读取并解析个人状态中的基础信息，完成后回调传入的函数。
 * @param id ID
 * @param pass PASSWORD
 * @param callback 回调函数
 * @private
 */
function __ajax_readPersonalInformation(id, pass, callback) {
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({id: id, pass: pass, mode: "STATUS_PRINT"}),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Posting STATUS_PRINT was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));

            let statusTable = $(html).find('table').first().find('table').first();
            let levelText = $(statusTable.find('td')[1]).text();
            let level = "";
            for (let i = 0; i < levelText.length; i++) {
                if (levelText[i] >= '0' && levelText[i] <= '9') {
                    level += levelText[i];
                }
            }
            let healthText = $(statusTable.find('td')[5]).text();
            let manaText = $(statusTable.find('td')[7]).text();
            let currentHealth = __utilities_substringBeforeSlash(healthText);
            let maxHealth = __utilities_substringAfterSlash(healthText);
            let currentMana = __utilities_substringBeforeSlash(manaText);
            let maxMana = __utilities_substringAfterSlash(manaText);
            let att = $(statusTable.find('td')[13]).text();
            let def = $(statusTable.find('td')[15]).text();
            let int = $(statusTable.find('td')[17]).text();
            let spi = $(statusTable.find('td')[19]).text();
            let spe = $(statusTable.find('td')[21]).text();
            let town = $(statusTable.find('td')[31]).text();
            let townId = __lookupTownIdByName(town);
            let exp = $(statusTable.find('td')[58]).text();
            let goldText = $(statusTable.find('td')[60]).text();
            let gold = goldText.substring(0, goldText.indexOf(" G"));

            // 寻找仙人的宝物那一栏的数据
            let faeryTreasureCount = 0;
            $(html).find("td:parent").each(function (_idx, td) {
                const text = $(td).text();
                if (text.startsWith("仙人的宝物：")) {
                    let faeryTreasureText;
                    if (text.endsWith(" ")) {
                        faeryTreasureText = text.substring(6, text.length - 1);
                    } else {
                        faeryTreasureText = text.substring(6);
                    }
                    faeryTreasureCount = faeryTreasureText.split(" ").length;
                }
            });

            let data = {
                "id": id, "pass": pass,
                "LV": level,
                "HP": currentHealth, "MAX_HP": maxHealth, "MP": currentMana, "MAX_MP": maxMana,
                "AT": att, "DF": def, "SA": int, "SD": spi, "SP": spe,
                "TOWN": town, "TOWN_ID": townId,
                "EXP": exp, "GOLD": gold,
                "FTC": faeryTreasureCount
            };
            callback(data);
        })
        .catch((error) => {
            console.error("Error raised when posting STATUS_PRINT:", error);
        });
}

function __ajax_checkOwnItems(id, pass, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["mode"] = "USE_ITEM";
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(request),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            callback(id, pass, html);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

function __ajax_openTreasureBag(id, pass, treasureBagIndex, callback) {
    let openTreasureBagRequest = {};
    openTreasureBagRequest["id"] = id;
    openTreasureBagRequest["pass"] = pass;
    openTreasureBagRequest["chara"] = "1";
    openTreasureBagRequest["mode"] = "USE";
    openTreasureBagRequest["item" + treasureBagIndex] = treasureBagIndex;
    fetch("mydata.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(openTreasureBagRequest),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Opening treasure bag was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            callback(id, pass, html);
        })
        .catch((error) => {
            console.error("Error raised when opening treasure bag:", error);
        });
}

/**
 * 在客栈住宿恢复
 * @param id ID
 * @param pass PASS
 * @param callback 回调函数，参数{id:x,pass:x}
 * @private
 */
function __ajax_lodgeAtInn(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "town.cgi",
        data: {id: id, pass: pass, mode: "RECOVERY"},
        success: function (html) {
            let data = {id: id, pass: pass};
            callback(data);
        }
    });
}

/**
 * 存储所有的现金到银行
 * @param id ID
 * @param pass PASS
 * @param callback 回调函数，参数{id:x,pass:x}
 * @private
 */
function __ajax_depositAllGolds(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "town.cgi",
        data: {id: id, pass: pass, mode: "BANK_SELL", azukeru: "all"},
        success: function (html) {
            let data = {id: id, pass: pass};
            callback(data);
        }
    });
}

/**
 * 从银行取钱
 * @param id ID
 * @param pass PASS
 * @param amount 单位是万
 * @param callback 回调
 * @private
 */
function __ajax_withdrawGolds(id, pass, amount, callback) {
    if (amount <= 0) {
        let data = {id: id, pass: pass};
        callback(data);
    } else {
        $.ajax({
            type: "POST",
            url: "town.cgi",
            data: {id: id, pass: pass, mode: "BANK_BUY", dasu: amount},
            success: function (html) {
                let data = {id: id, pass: pass};
                callback(data);
            }
        });
    }
}

function __common_item_selectBag(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "百宝袋") {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectCage(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "黄金笼子") {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectAllGems(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name.indexOf("宝石") != -1) {
            $(inputElement).prop('checked', true);
            checkedCount++;
        } else {
            $(inputElement).prop('checked', false);
        }
    });
    return checkedCount;
}

function __common_item_selectAllStorableItems(parentElement) {
    var checkedCount = 0;
    parentElement.find("input[type='checkbox']").each(function (_idx, inputElement) {
        var inputTableCell = $(inputElement).parent();
        var name = $(inputTableCell).next().next().text();
        var category = $(inputTableCell).next().next().next().text();
        if (category == "物品" && name == "百宝袋") {
            $(inputElement).prop('checked', false);
        } else if (category == "物品" && name == "黄金笼子") {
            $(inputElement).prop('checked', false);
        } else if ($(inputElement).attr('disabled') != undefined) {
            // 无法放入袋子的物品，忽略
        } else {
            var using = $(inputTableCell).next().text();
            if (using == "★") {
                $(inputElement).prop('checked', false);
            } else {
                $(inputElement).prop('checked', true);
                checkedCount++;
            }
        }
    });
    return checkedCount;
}

// ============================================================================
// 宝可梦百科扩展功能
// ============================================================================
function processPokemonWikiReplacement() {
    $('body *').each(function () {
        $(this).contents().filter(function () {
            return this.nodeType === 3;
        }).each(function (idx, text) {
            let newText = this.textContent;
            for (let i = 0; i < pokemon.pokemonDictKeys.length; i++) {
                if (newText.includes(pokemon.pokemonDictKeys[i])) {
                    newText = newText.replace(pokemon.pokemonDictKeys[i], pokemon.pokemonDict[pokemon.pokemonDictKeys[i]]);
                }
            }
            if (newText !== this.textContent) {
                const $newContent = $('<span>').html(newText);
                const parentElement = this.parentElement;
                $(this).replaceWith($newContent);
                $(parentElement).children().each(function () {
                    if (this.nodeType === 3) {
                        $(this).replaceWith(this.textContent);
                    }
                });
            }
        })
    });
}

// ============================================================================
// 主状态页辅助功能
// ============================================================================
function postProcessMainStatusFunctionalities(htmlText) {
    if (htmlText.indexOf("在网吧的用户请使用这个退出") !== -1) {
        __status(htmlText);
    }
}

function __status(htmlText) {
    $("option[value='INN']").text("客栈·驿站");
    $("option[value='LETTER']").text("口袋助手设置");
    $("option[value='LETTER']").attr("style", "background:#20c0ff");
    $("option[value='CHANGEMAP']").text("冒险家公会");

    // 主页面如果角色满级则经验(大于等于14900)显示为蓝色
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text === "经验值") {
            const expText = $(td).next().text();
            const exp = expText.substring(0, expText.indexOf(" EX"));
            if (exp >= 14900) {
                let expHtml = $(td).next().html();
                expHtml = "<font color='blue'>" + expHtml + "</font>";
                $(td).next().html(expHtml);
            }
        }
    });

    // 读取角色当前的能力值
    const text = $("#c_001").find("table:last").find("td:first").text();
    let idx = text.indexOf("Lv：");
    let s = text.substring(idx);
    const level = parseInt(s.substring(3, s.indexOf(" ")));
    idx = text.indexOf("攻击力：");
    s = text.substring(idx);
    const attack = parseInt(s.substring(4, s.indexOf(" ")));
    idx = s.indexOf("防御力：");
    s = s.substring(idx);
    const defense = parseInt(s.substring(4, s.indexOf(" ")));
    idx = s.indexOf("智力：");
    s = s.substring(idx);
    const specialAttack = parseInt(s.substring(3, s.indexOf(" ")));
    idx = s.indexOf("精神力：");
    s = s.substring(idx);
    const specialDefense = parseInt(s.substring(4, s.indexOf(" ")));
    idx = s.indexOf("速度：");
    s = s.substring(idx);
    const speed = parseInt(s.substring(3));
    if (level !== 150 && (attack === 375 || defense === 375 || specialAttack === 375 || specialDefense === 375 || speed === 375)) {
        $("td:parent").each(function (_idx, td) {
            const text = $(td).text();
            if (text === "身份") {
                let titleHtml = $(td).next().html();
                titleHtml = "<font color='red'>" + titleHtml + "</font>";
                $(td).next().html(titleHtml);
            }
        });
    }

    // 主页面如果角色现金超过100万显示为红色
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text === "资金") {
            const cashText = $(td).next().text();
            const cash = cashText.substring(0, cashText.indexOf(" Gold"));
            if (cash >= 1000000) {
                let cashHtml = $(td).next().html();
                cashHtml = "<font color='red'>" + cashHtml + "</font>";
                $(td).next().html(cashHtml);
            }
        }
    });
}

// ============================================================================
// 战斗后续辅助功能
// ============================================================================
function postProcessBattleRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("＜＜ - 秘宝之岛 - ＞＞") != -1 ||
        htmlText.indexOf("＜＜ - 初级之森 - ＞＞") != -1 ||
        htmlText.indexOf("＜＜ - 中级之塔 - ＞＞") != -1 ||
        htmlText.indexOf("＜＜ - 上级之洞窟 - ＞＞") != -1 ||
        htmlText.indexOf("＜＜ - 十二神殿 - ＞＞") != -1) {
        $('a[target="_blank"]').attr('tabIndex', -1);
        __battle(htmlText);
    }
}

function __battle(htmlText) {
    $('input[value="返回住宿"]').attr('id', 'innButton');
    $('input[value="返回修理"]').attr('id', 'blacksmithButton');
    $('input[value="返回城市"]').attr('id', 'returnButton');
    $('input[value="返回更新"]').attr('id', 'updateButton');
    $('input[value="返回银行"]').attr('id', 'bankButton');

    // 返回更新按钮不再需要
    $('#updateButton').parent().remove();

    // 修改返回修理按钮的行为，直接变成全部修理
    $('#blacksmithButton').parent().prepend('<input type="hidden" name="arm_mode" value="all">');
    $('#blacksmithButton').attr('value', __cookie_getRepairButtonText());
    $('input[value="MY_ARM"]').attr('value', 'MY_ARM2');

    // 修改返回银行按钮的行为，直接变成全部存入
    $('#bankButton').parent().prepend('<input type="hidden" name="azukeru" value="all">');
    $('#bankButton').attr('value', __cookie_getDepositButtonText());
    $('input[value="BANK"]').attr('value', 'BANK_SELL');

    // 修改返回住宿按钮
    $('#innButton').attr('value', __cookie_getLodgeButtonText());

    // 修改返回按钮
    $('#returnButton').attr('value', __cookie_getReturnButtonText());

    var resultText = $('#ueqtweixin').text();
    // 耐久度初始值10000以下的最大的质数，表示没有发现回血道具
    var endure = 9973;
    var start = resultText.indexOf("(自动)使用。(剩余");
    if (start != -1) {
        // 找到了回血道具
        endure = resultText.substring(start + 10, start + 13);
    }

    if (__battle_checkIfShouldGoToBlacksmith(resultText, endure)) {
        // 只保留修理按钮
        $("#blacksmithButton").attr('tabIndex', 1);
        $('#innButton').parent().remove();
        $('#bankButton').parent().remove();
        $('#returnButton').parent().remove();
        if (__cookie_getEnableBattleForceRecommendation()) {
            $("#blacksmithButton").focus();
        }
        if (__cookie_getEnableBattleAutoScroll()) {
            document.getElementById("blacksmithButton").scrollIntoView();
        }
    } else {
        // 不需要修理按钮
        $('#blacksmithButton').parent().remove();
        const zodiacBattle = htmlText.indexOf("＜＜ - 十二神殿 - ＞＞") !== -1;

        let returnCode = __battle_checkIfShouldGoToInn(htmlText, endure);
        if (returnCode === 1) {
            // 住宿优先
            $("#innButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
            if (__cookie_getEnableBattleForceRecommendation()) {
                $('#bankButton').parent().remove();
                $("#innButton").focus();
            }
            if (__cookie_getEnableBattleAutoScroll()) {
                document.getElementById("innButton").scrollIntoView();
            }
            if (zodiacBattle && __cookie_getEnableZodiacFlashBattle()) {
                $("#innButton").trigger("click");
            }
        }
        if (returnCode === 2) {
            // 存钱优先
            $("#bankButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
            if (__cookie_getEnableBattleForceRecommendation()) {
                $('#innButton').parent().remove();
                $("#bankButton").focus();
            }
            if (__cookie_getEnableBattleAutoScroll()) {
                document.getElementById("bankButton").scrollIntoView();
            }
            if (zodiacBattle && __cookie_getEnableZodiacFlashBattle()) {
                $("#bankButton").trigger("click");
            }
        }
        if (returnCode === 3) {
            // 返回优先
            $("#returnButton").attr('tabIndex', 1);
            if (__cookie_getEnableBattleForceRecommendation()) {
                $('#innButton').parent().remove();
                $('#bankButton').parent().remove();
                $("#returnButton").focus();
            }
            if (__cookie_getEnableBattleAutoScroll()) {
                document.getElementById("returnButton").scrollIntoView();
            }
            if (zodiacBattle && __cookie_getEnableZodiacFlashBattle()) {
                $("#returnButton").trigger("click");
            }
        }
    }
}

// 分析是否需要去修理
function __battle_checkIfShouldGoToBlacksmith(resultText, recoverItemEndure) {
    if (recoverItemEndure % 100 == 0) {
        // 当无忧之果的耐久度掉到100整倍数时触发修理装备。
        return true;
    }

    // 然后判断剩余的所有装备的耐久，只要有任意一件装备的耐久低于100，
    // 也触发修理装备。这里需要注意的是要排除掉大师球、宗师球、怪兽球
    // 和宠物蛋。。因此判断耐久在10~99区间吧，可以排除掉大师球和宗师球。
    var sourceText = resultText;
    var lowEndures = [];
    for (var i = 0; i < 4; i++) {
        // 最多查四次耐久度剩余
        var startIndex = sourceText.indexOf("剩余");
        if (startIndex != -1) {
            sourceText = sourceText.substring(startIndex + 2);
            var numbers = [];
            for (var j = 0; j < sourceText.length; j++) {
                if (sourceText[j] >= '0' && sourceText[j] <= '9') {
                    numbers.push(sourceText[j]);
                } else {
                    var number = "";
                    for (var k = 0; k < numbers.length; k++) {
                        number += numbers[k];
                    }
                    numbers = [];
                    if (number < __cookie_getRepairItemThreshold()) {
                        lowEndures.push(number);
                    }
                    break;
                }
            }
        }
    }
    if (lowEndures.length == 0) {
        // 没有装备耐久掉到阈值之下，忽略
        return false;
    }
    for (var idx = 0; idx < lowEndures.length; idx++) {
        var currentEndure = lowEndures[idx];
        if (resultText.indexOf("大师球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("宗师球球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("超力怪兽球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("宠物蛋剩余" + currentEndure + "耐久度") == -1) {
            // 这个低耐久的装备不是上述需要排除的，说明真的有装备耐久低了，需要修理
            return true;
        }
    }

    return false;
}

// 检查是否需要住宿：
// 1. 战败需要住宿
// 2. 十二宫战斗胜利不需要住宿，直接存钱更好
// 3. 战胜/平手情况下，检查生命力是否低于某个阈值
// 返回值：
// 1 - 表示住宿
// 2 - 表示存钱
// 3 - 表示返回
function __battle_checkIfShouldGoToInn(htmlText, recoverItemEndure) {
    if (htmlText.indexOf("将 怪物 全灭！") == -1) {
        // 战败了，直接去住宿吧
        return 1;
    }
    if (htmlText.indexOf("＜＜ - 十二神殿 - ＞＞") != -1 || htmlText.indexOf("＜＜ - 秘宝之岛 - ＞＞") != -1) {
        // 十二宫和秘宝之岛战斗胜利不需要住宿，直接存钱更好
        return 2;
    }
    let depositBattleNumber = __cookie_getDepositBattleNumber();
    if (depositBattleNumber > 0 && recoverItemEndure % depositBattleNumber == 0) {
        // 存钱战数到了
        return 2;
    }
    let playerName = "";
    let health = 0;
    let maxHealth = 0;
    let mana = 0;
    let maxMana = 0;
    $("td:parent").each(function (index, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf("https://pocketrose.itsns.net.cn/pocketrose/") != -1) {
            // 通过第一个头像找到玩家的名字
            if (playerName == "") {
                playerName = img.attr("alt");
            }
        }
        if (playerName === $(element).text()) {
            let healthText = $(element).next().text();
            health = __utilities_substringBeforeSlash(healthText);
            maxHealth = __utilities_substringAfterSlash(healthText);

            let manaText = $(element).next().next().text();
            mana = __utilities_substringBeforeSlash(manaText);
            maxMana = __utilities_substringAfterSlash(manaText);
        }
    });
    // 生命力低于最大值的配置比例，住宿推荐
    if (health <= maxHealth * __cookie_getHealthLoseAutoLodgeRatio()) {
        return 1;
    }
    // 如果MANA小于50%并且小于配置点数，住宿推荐
    if (mana <= maxMana * 0.5 && mana <= __cookie_getManaLoseAutoLodgePoint()) {
        return 1;
    }
    if (__cookie_getDepositBattleNumber() > 0) {
        // 设置了定期存钱，但是没有到战数，那么就直接返回吧
        return 3;
    } else {
        // 没有设置定期存钱，那就表示每战都存钱
        return 2;
    }
}

// ============================================================================
// 城市点击后续辅助功能
// ============================================================================
function postProcessCityRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("在网吧的用户请使用这个退出") !== -1) {
        // 战斗后的主页是通过town.cgi返回的
        __status(htmlText);
    }
    if (htmlText.indexOf("* 宿 屋 *") !== -1) {
        __town_inn(htmlText);
    }
    if (htmlText.indexOf("* 宠物图鉴 *") !== -1) {
        // 宠物图鉴
        __town_petMap(htmlText);
    }
    if (htmlText.indexOf("* 运 送 屋 *") !== -1) {
        __town_houseForSendingItems(htmlText);
    }
    if (htmlText.indexOf("* 宠 物 赠 送 屋 *") !== -1) {
        __town_houseForSendingPets(htmlText);
    }
    if (htmlText.indexOf("＜＜　□　<B>武器屋</B>　□　＞＞") !== -1 ||
        htmlText.indexOf("＜＜　□　<b>武器屋</b>　□　＞＞") !== -1) {
        __town_weaponStore(htmlText);
    }
    if (htmlText.indexOf("＜＜　□　<B>防具屋</B>　□　＞＞") !== -1 ||
        htmlText.indexOf("＜＜　□　<b>防具屋</b>　□　＞＞") !== -1) {
        __town_armorStore(htmlText);
    }
    if (htmlText.indexOf("＜＜　□　<B>饰品屋</B>　□　＞＞") !== -1 ||
        htmlText.indexOf("＜＜　□　<b>饰品屋</b>　□　＞＞") !== -1) {
        __town_accessoryStore(htmlText);
    }
    if (htmlText.indexOf("＜＜　□　<B>物品屋</B>　□　＞＞") !== -1 ||
        htmlText.indexOf("＜＜　□　<b>物品屋</b>　□　＞＞") !== -1) {
        __town_itemStore(htmlText);
    }
    if (htmlText.indexOf(" Gold卖出。") !== -1) {
        // 物品卖出完成
        __city_itemSold(htmlText);
    }
    if (htmlText.indexOf("*  藏宝图以旧换新业务 *") !== -1) {
        enhanceTownAdventurerGuild(htmlText);
    }
}

function __town_inn(htmlText) {
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text.indexOf("每天的战斗让你疲倦了吧? 来休息一下吧") !== -1) {
            if (_idx === 17) {
                $(td).attr("id", "messageBoard");
                $(td).attr("style", "color: white");
            }
        }
    });

    $("input:submit[value='返回城市']").attr("id", "returnButton");

    let playerName = "";
    let cash = 0;
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text === "姓名") {
            playerName = $(td).parent().next().find("td:first").text();
        }
        if (text === "所持金") {
            const cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_constructNpcMessageTable("夜九年");
    __page_writeNpcMessage("驿站试运营中，先把丑话说在前面。<br>");
    __page_writeNpcMessage("你选择我们家驿站服务，我们家免费带你飞。开始旅途后切勿关闭当前页面，这样我们才可以一起浪。<br>" +
        "如果你关闭当前页面则意味着你方毁约，你会处于什么样的位置和状态我们家不会负责。开始旅途后<br>" +
        "请耐心等待，到达目的地后欢迎按钮会自动亮起，点击即可进城。<br>");
    __page_writeNpcMessage("<input type='button' id='travel' style='color: blue' value='开始旅途'>");
    __page_writeNpcMessage("<input type='button' id='moveToCastle' style='color: red' value='移动到城堡'>");
    __page_writeNpcMessage("<div id='currentLocation' style='display: none'></div>");
    __page_writeNpcMessage("<div id='faeryTreasureCount' style='display: none'></div>");
    __page_writeNpcMessage("<div id='castleInformation' style='display: none'></div>");
    __page_writeNpcMessage("<br>");

    const cityIds = Object.keys(_CITY_DICT);
    let html = "";
    html += "<table border='1'><tbody>";
    html += "<thead><tr><td style='color: white'>选择</td><td style='color: white'>目的地</td><td colspan='2' style='color: white'>坐标</td></tr></thead>";

    for (let i = 0; i < cityIds.length; i++) {
        const cityId = cityIds[i];
        const city = _CITY_DICT[cityId];
        html += "<tr>";
        html += "<td><input type='radio' class='cityClass' name='cityId' value='" + cityId + "'></td>";
        html += "<td style='color: white'>" + city["name"] + "</td>";
        html += "<td style='color: white'>" + city["x"] + "</td>";
        html += "<td style='color: white'>" + city["y"] + "</td>";
        html += "</tr>";
    }

    html += "</tbody></table>";
    html += "<br>";
    __page_writeNpcMessage(html);

    $("#travel").prop("disabled", true);
    $("#moveToCastle").prop("disabled", true);

    const id = __page_readIdFromCurrentPage();
    const pass = __page_readPassFromCurrentPage();

    $("#travel").click(function () {
        $("#travel").prop("disabled", true);
        $("#moveToCastle").prop("disabled", true);
        $("#returnButton").prop("disabled", true);
        $("input:submit[value='宿泊']").prop("disabled", true);
        const currentTownId = $("#currentLocation").text();
        const faeryTreasureCount = $("#faeryTreasureCount").text();
        const destinationTownId = $("input:radio[name='cityId']:checked").val();
        if (destinationTownId !== undefined) {
            $("#messageBoard").html("我们将实时为你播报旅途的动态：<br>");
            const sourceTown = _CITY_DICT[currentTownId];
            const destinationTown = _CITY_DICT[destinationTownId];

            const sourceLocation = [parseInt(sourceTown["x"]), parseInt(sourceTown["y"])];
            const destinationLocation = [parseInt(destinationTown["x"]), parseInt(destinationTown["y"])];

            let msg = playerName + "的起点位于'" + sourceTown["name"] + "'，坐标（" + sourceTown["x"] + "," + sourceTown["y"] + "）。";
            __update_travel_message_board(msg);
            msg = playerName + "的目标设定为'" + destinationTown["name"] + "'，坐标位于(" + destinationTown["x"] + "," + destinationTown["y"] + ")。";
            __update_travel_message_board(msg);

            let amount = 0;
            if (parseInt(faeryTreasureCount) === 28) {
                __update_travel_message_board(playerName + "拥有完整的仙人宝物。");
            } else {
                // 为了确保能安全进入目的地，需要提前为你取钱
                amount = Math.ceil((100000 - cash) / 10000);
            }

            if (amount > 0) {
                __ajax_withdrawGolds(id, pass, amount, function (data) {
                    __update_travel_message_board("我们替你从银行取款10万以备可能需要的入城税。");
                    __update_travel_message_board("别担心，如果不需要的话到达目的地后会帮你存起来。");
                    moveToTown(id, pass, playerName, currentTownId, destinationTownId);
                });
            } else {
                moveToTown(id, pass, playerName, currentTownId, destinationTownId);
            }
        }
    });

    $("#moveToCastle").click(function () {
        $("#travel").prop("disabled", true);
        $("#moveToCastle").prop("disabled", true);
        $("#returnButton").prop("disabled", true);
        $("input:submit[value='宿泊']").prop("disabled", true);

        $("#messageBoard").html("我们将实时为你播报旅途的动态：<br>");
        const ss = $("#castleInformation").text().split("_");
        const castleName = ss[0];
        const castleLocation = [parseInt(ss[1]), parseInt(ss[2])];
        const currentTownId = $("#currentLocation").text();
        __update_travel_message_board(playerName + "的目标设定为城堡'" + castleName + "'，坐标位于(" + castleLocation[0] + "," + castleLocation[1] + ")。");

        leaveTown(id, pass, playerName, currentTownId, function (data) {
            const id = data["id"];
            const pass = data["pass"];
            const player = data["player"];
            const sourceLocation = data["location"];
            const moveScope = data["moveScope"];
            const moveMode = data["moveMode"];
            moveFromTo(id, pass, player, sourceLocation, castleLocation, moveScope, moveMode, function (data) {
                const id = data["id"];
                const pass = data["pass"];
                const player = data["player"];
                $.post("map.cgi", {"id": id, "pass": pass, "mode": "CASTLE_ENTRY"}, function (html) {
                    __update_travel_message_board(player + "成功到达城堡'" + castleName + "'。");
                    __update_travel_message_board("期待下次旅途与您再见。");

                    $("form[action='status.cgi']").attr("action", "castlestatus.cgi");
                    $("input:hidden[value='STATUS']").attr("value", "CASTLESTATUS");
                    $("#returnButton").attr("value", castleName + "欢迎您的到来");
                    $("#returnButton").prop("disabled", false);
                });
            });
        });
    });

    readCastleInformation(id, pass, function (ctx, castles) {
        const castle = castles[playerName];
        if (castle !== undefined) {
            const s1 = castle["name"];
            const s2 = castle["coordinate"][0];
            const s3 = castle["coordinate"][1];
            $("#castleInformation").text(s1 + "_" + s2 + "_" + s3);
            $("#moveToCastle").attr("value", "移动到" + s1);
            $("#moveToCastle").prop("disabled", false);
        }

        __ajax_readPersonalInformation(ctx["id"], ctx["pass"], function (data) {
            const currentTownId = data["TOWN_ID"];
            const faeryTreasureCount = data["FTC"];
            $(".cityClass[value='" + currentTownId + "']").prop("disabled", true);
            $("#currentLocation").text(currentTownId);
            $("#faeryTreasureCount").text(faeryTreasureCount);
            $("#travel").prop("disabled", false);
        });
    });
}

function __update_travel_message_board(message) {
    const messageBoard = $("#messageBoard").html();
    const now = new Date();
    $("#messageBoard").html(messageBoard + "<li>(" + now.toLocaleString() + ") " + message + "</li>");
}

function moveToTown(id, pass, player, sourceTownId, destinationTownId) {
    leaveTown(id, pass, player, sourceTownId, function (data) {
        const sourceLocation = data["location"];
        const moveScope = data["moveScope"];
        const moveMode = data["moveMode"];
        const destinationTown = _CITY_DICT[destinationTownId];
        const destinationLocation = [parseInt(destinationTown["x"]), parseInt(destinationTown["y"])];

        moveFromTo(id, pass, player, sourceLocation, destinationLocation, moveScope, moveMode, function (data) {
            // 到达目的地了，准备执行进城操作
            __update_travel_message_board(player + "准备进城，等待行动冷却中...... (约55秒)");
            setTimeout(function () {
                enterTown(id, pass, destinationTownId, function (data) {
                    const html = data["html"];
                    if ($(html).text().indexOf("战胜门卫。") !== -1) {
                        // 到达了其他国家的城市，并且没有仙人宝物。。无法直接进入，选择交钱吧。。打打杀杀挺不好的
                        __update_travel_message_board("与门卫交涉中......");
                        const request = {};
                        request["id"] = id;
                        request["pass"] = pass;
                        request["townid"] = destinationTownId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        $.post("status.cgi", request, function (html) {
                            __update_travel_message_board("门卫通情达理的收取了合理的入城税。");
                            __ajax_depositAllGolds(id, pass, function () {
                                __update_travel_message_board("我们贴心为您把剩余的现金存入了银行。");
                                $("#returnButton").prop("disabled", false);
                                $("#returnButton").attr("value", destinationTown["name"] + "欢迎您的到来");
                                __update_travel_message_board(player + "成功到达" + destinationTown["name"] + "。");
                                __update_travel_message_board("期待下次旅途与您再见。");
                            });
                        });
                    } else {
                        __ajax_depositAllGolds(id, pass, function () {
                            __update_travel_message_board("我们贴心为您把剩余的现金存入了银行。");
                            $("#returnButton").prop("disabled", false);
                            $("#returnButton").attr("value", destinationTown["name"] + "欢迎您的到来");
                            __update_travel_message_board(player + "成功到达" + destinationTown["name"] + "。");
                            __update_travel_message_board("期待下次旅途与您再见。");
                        });
                    }
                });
            }, 55000);
        });
    });
}

function moveFromTo(id, pass, player, from, to, scope, mode, callback) {
    const pathList = __travel_calculate_path_locations(from, to, scope, mode);
    moveThePathList(id, pass, player, pathList, 0, callback);
}

function moveThePathList(id, pass, player, pathList, index, callback) {
    __update_travel_message_board(player + "等待行动冷却中...... (约55秒)");
    setTimeout(function () {
        const from = pathList[index];
        const to = pathList[index + 1];

        const x1 = from[0];
        const y1 = from[1];
        const x2 = to[0];
        const y2 = to[1];

        let direction;
        if (x1 === x2) {
            // 上或者下
            if (y2 > y1) {
                direction = ["%u2191", "↑"];
            } else {
                direction = ["%u2193", "↓"];
            }
        } else if (y1 === y2) {
            // 左或者右
            if (x2 > x1) {
                direction = ["%u2192", "→"];
            } else {
                direction = ["%u2190", "←"];
            }
        } else {
            // 4种斜向移动
            if (x2 > x1 && y2 > y1) {
                direction = ["%u2197", "↗"];
            }
            if (x2 > x1 && y2 < y1) {
                direction = ["%u2198", "↘"];
            }
            if (x2 < x1 && y2 > y1) {
                direction = ["%u2196", "↖"];
            }
            if (x2 < x1 && y2 < y1) {
                direction = ["%u2199", "↙"];
            }
        }

        const distance = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
        __update_travel_message_board("准备" + direction[1] + "移动" + distance + "格。");

        const request = {};
        request["id"] = id;
        request["pass"] = pass;
        request["con"] = "2";
        request["navi"] = "on";
        request["mode"] = "CHARA_MOVE";
        request["direct"] = direction[0];
        request["chara_m"] = distance;
        $.post("map.cgi", request, function (html) {
            const nextIndex = index + 1;
            if (nextIndex === pathList.length - 1) {
                __update_travel_message_board(player + "到达目的地(" + to[0] + "," + to[1] + ")。");
                callback({"id": id, "pass": pass, "player": player, "html": html});
            } else {
                __update_travel_message_board(player + "到达坐标(" + to[0] + "," + to[1] + ")。");
                moveThePathList(id, pass, player, pathList, nextIndex, callback);
            }
        });

    }, 55000);
}

function enterTown(id, pass, townId, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["townid"] = townId;
    request["mode"] = "MOVE";
    fetch("status.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(request),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            const data = {};
            data["id"] = id;
            data["pass"] = pass;
            data["townId"] = townId;
            data["html"] = html;
            callback(data);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

/**
 * 出城，离开当前所在的城市。
 * @param id ID
 * @param pass PASS
 @param player PLAYER NAME
 * @param townId TOWN ID
 * @param callback 后续动作
 */
function leaveTown(id, pass, player, townId, callback) {
    const request = {};
    request["id"] = id;
    request["pass"] = pass;
    request["navi"] = "on";
    request["out"] = "1";
    request["mode"] = "MAP_MOVE";
    fetch("map.cgi", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(request),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));

            const moveScope = $(html).find("select[name='chara_m']").find("option:last").attr("value");
            let moveMode = "ROOK";
            $(html).find("input:submit").each(function (_idx, input) {
                const v = $(input).attr("value");
                const d = $(input).attr("disabled");
                if (v === "↖" && d === undefined) {
                    moveMode = "QUEEN";
                }
            });

            const town = _CITY_DICT[townId];
            __update_travel_message_board(player + "已经离开了" + town["name"] + "。");
            __update_travel_message_board(player + "已经确认最大行动力" + moveScope + "，行动采用" + moveMode + "模式。");

            const data = {};
            data["id"] = id;
            data["pass"] = pass;
            data["html"] = html;
            data["player"] = player;
            data["townId"] = townId;
            data["location"] = [town["x"], town["y"]];
            data["moveScope"] = moveScope;
            data["moveMode"] = moveMode;

            callback(data);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

function __travel_calculate_path_locations(sourceLocation, destinationLocation, moveScope, moveMode) {
    const nodeList = [];

    if (sourceLocation[0] === destinationLocation[0] && sourceLocation[1] === destinationLocation[1]) {
        nodeList.push(sourceLocation);
        return nodeList;
    }

    const milestone = __travel_lookup_milestone_node(sourceLocation, destinationLocation, moveMode);
    if (milestone !== undefined) {
        const p1 = __travel_move_from_to(sourceLocation, milestone, moveScope);
        const p2 = __travel_move_from_to(milestone, destinationLocation, moveScope);
        nodeList.push(...p1);
        nodeList.push(...p2);
        nodeList.push(destinationLocation);
    } else {
        const p = __travel_move_from_to(sourceLocation, destinationLocation, moveScope);
        nodeList.push(...p);
        nodeList.push(destinationLocation);
    }

    __update_travel_message_board("旅途路径已经计算完毕，总共需要次移动" + (nodeList.length - 1) + "次。");

    let msg = "旅途路径规划：";
    for (let i = 0; i < nodeList.length; i++) {
        let node = nodeList[i];
        msg += "(" + node[0] + "," + node[1] + ")";
        if (i !== nodeList.length - 1) {
            msg += " -> ";
        }
    }
    __update_travel_message_board(msg);

    return nodeList;
}

/**
 * 根据移动模式寻找两个坐标之间的里程碑坐标，返回undefined表示源和目的地在一条线上
 * @param from 源坐标
 * @param to 目的坐标
 * @param moveMode 移动模式，ROOK或者QUEEN
 * @returns {number[]|undefined|*[]}
 * @private
 */
function __travel_lookup_milestone_node(from, to, moveMode) {
    if (moveMode === "ROOK") {
        if (from[0] === to[0] || from[1] === to[1]) {
            return undefined;
        }
        return [from[0], to[1]];
    }
    if (moveMode === "QUEEN") {
        if (from[0] === to[0] || from[1] === to[1]) {
            return undefined;
        }
        const xDelta = Math.abs(from[0] - to[0]);
        const yDelta = Math.abs(from[1] - to[1]);
        if (xDelta === yDelta) {
            return undefined;
        }
        const delta = Math.min(xDelta, yDelta);
        let x = from[0];
        let y = from[1];
        if (to[0] > from[0]) {
            x = x + delta;
        } else {
            x = x - delta;
        }
        if (to[1] > from[1]) {
            y = y + delta;
        } else {
            y = y - delta;
        }
        return [x, y];
    }
    return undefined;
}

/**
 * 根据移动范围计算两个坐标之间的移动节点，已经确保两个坐标在同一条线上
 * @param from 源坐标
 * @param to 目的坐标
 * @param moveScope 移动范围
 * @returns {*[]} [from, ..., to)
 * @private
 */
function __travel_move_from_to(from, to, moveScope) {
    const nodeList = [];
    nodeList.push(from);
    if (from[0] === to[0]) {
        // 一条竖线上
        const step = Math.ceil(Math.abs(from[1] - to[1]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            if (to[1] > from[1]) {
                nodeList.push([from[0], from[1] + (i * moveScope)]);
            } else {
                nodeList.push([from[0], from[1] - (i * moveScope)]);
            }
        }
    } else if (from[1] === to[1]) {
        // 一条横线上
        const step = Math.ceil(Math.abs(from[0] - to[0]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            if (to[0] > from[0]) {
                nodeList.push([from[0] + (i * moveScope), from[1]]);
            } else {
                nodeList.push([from[0] - (i * moveScope), from[1]]);
            }
        }
    } else {
        // 一条斜线上
        const step = Math.ceil(Math.abs(from[0] - to[0]) / moveScope);
        for (let i = 1; i <= step - 1; i++) {
            let x = from[0];
            if (to[0] > from[0]) {
                x = x + (i * moveScope);
            } else {
                x = x - (i * moveScope);
            }
            let y = from[1];
            if (to[1] > from[1]) {
                y = y + (i * moveScope);
            } else {
                y = y - (i * moveScope);
            }
            nodeList.push([x, y]);
        }
    }
    return nodeList;
}

// 城市 -> 宠物图鉴
function __town_petMap(htmlText) {
    __page_constructNpcMessageTable("七七");
    __page_writeNpcMessage("我打小数学就是体育老师教的，学的特别好。数一数图鉴数量这种事，交给我完全没有问题。");

    var petIdText = "";             // 宠物图鉴编号及数量的文本
    $("td:parent").each(function (_i, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf(constant.POCKETROSE_DOMAIN + "/image/386/") != -1) {
            var code = img.attr("alt");
            var count = $(element).next();

            petIdText += code;
            petIdText += "/";
            petIdText += count.text();
            petIdText += "  ";
        }
    });
    if (petIdText != "") {
        __page_writeNpcMessage("<br>" + petIdText);
        __page_writeNpcMessage("<br>要不要现在就去宠物进化退化那里<b><a href='javascript:void(0)' id='petBorn'>看一眼</a></b>？");
        $("#petBorn").click(function () {
            $("input[name='mode']").attr("value", "PETBORN");
            $("form[action='status.cgi']").attr("action", "mydata.cgi");
            $("input[value='返回城市']").trigger("click");
        });
    }
}

/**
 * 城市送物屋增强实现。
 * @param htmlText HTML文本
 * @private
 */
function __town_houseForSendingItems(htmlText) {
    __page_constructNpcMessageTable("末末");
    __page_writeNpcMessage("我来啦！");

    $("input[value='发送']").attr("id", "sendItemSubmit");

    // 读取当前身上的Gold数量
    let gold = 0;
    $("td:parent").each(function (_idx, td) {
        if ($(td).text() == "所持金") {
            let goldText = $(td).next().text();
            let spaceIdx = goldText.indexOf(" ");
            gold = goldText.substring(0, spaceIdx);
        }
    });
    if (gold >= 100000) {
        __page_writeNpcMessage("让我看看你都偷偷给人送些啥。");
    } else {
        let delta = Math.ceil((100000 - gold) / 10000);
        let message = "看起来你身上的钱还差" + delta + "万呀，我可以帮你" +
            "<a href='javascript:void(0)' id='safeSendItem'><b>取钱发送</b></a>" +
            "。我办事，你放心！";
        __page_writeNpcMessage(message);

        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        $("#safeSendItem").click(function () {
            __ajax_withdrawGolds(id, pass, delta, function (data) {
                $("#sendItemSubmit").trigger("click");
            });
        });
    }
}

/**
 * 城市送宠屋增强实现。
 * @param htmlText HTML文本
 * @private
 */
function __town_houseForSendingPets(htmlText) {
    __page_constructNpcMessageTable("末末");
    __page_writeNpcMessage("哈哈，我又来啦！没想到吧？这边还是我。");

    $("input[value='发送']").attr("id", "sendPetSubmit");

    let gold = 0;
    $("td:parent").each(function (_idx, td) {
        if ($(td).text() === "所持金") {
            let goldText = $(td).next().text();
            gold = goldText.substring(0, goldText.indexOf(" "));
        }
    });

    if (gold < 100000) {
        let delta = Math.ceil((100000 - gold) / 10000);
        let message = "差" + delta + "万，老规矩，还是<a href='javascript:void(0)' id='safeSendPet'><b>取钱发送</b></a>？";
        __page_writeNpcMessage(message);

        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        $("#safeSendPet").click(function () {
            __ajax_withdrawGolds(id, pass, delta, function (data) {
                $("#sendPetSubmit").trigger("click");
            });
        });
    }
}

/**
 * 武器屋：增强实现。
 * @param htmlText HTML
 * @private
 */
function __town_weaponStore(htmlText) {
    __page_constructNpcMessageTable("青鸟");
    __town_common_disableProhibitSellingItems($("table")[5]);
    $("input:submit[value='买入']").attr("id", "buyButton");

    // 检查是否身上还有富裕的购物空间？
    if ($("select[name='num']").find("option:first").length === 0) {
        $("#buyButton").prop("disabled", true);
        __page_writeNpcMessage("咱们就是说买东西之前至少身上腾点空间出来。");
        return;
    }

    // 获取当前身上现金的数量
    let cash = 0;
    $("td:parent").each(function (idx, td) {
        if ($(td).text() === "所持金") {
            let cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_writeNpcMessage("为了回馈新老客户，本店特推出直接通过<b><a href='javascript:void(0)' id='bankBuy'>银行转账购买</a></b>的方式。");
    $("#bankBuy").click(function () {
        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        __town_common_prepareForShopping(id, pass, cash, $("table")[7], $("#buyButton"));
    });
}

/**
 * 防具屋：增强实现。
 * @param htmlText HTML
 * @private
 */
function __town_armorStore(htmlText) {
    __page_constructNpcMessageTable("青鸟");
    __town_common_disableProhibitSellingItems($("table")[5]);
    $("input:submit[value='买入']").attr("id", "buyButton");

    // 检查是否身上还有富裕的购物空间？
    if ($("select[name='num']").find("option:first").length === 0) {
        $("#buyButton").prop("disabled", true);
        __page_writeNpcMessage("咱们就是说买东西之前至少身上腾点空间出来。");
        return;
    }

    // 获取当前身上现金的数量
    let cash = 0;
    $("td:parent").each(function (idx, td) {
        if ($(td).text() === "所持金") {
            let cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_writeNpcMessage("为了回馈新老客户，本店特推出直接通过<b><a href='javascript:void(0)' id='bankBuy'>银行转账购买</a></b>的方式。");
    $("#bankBuy").click(function () {
        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        __town_common_prepareForShopping(id, pass, cash, $("table")[7], $("#buyButton"));
    });
}

/**
 * 饰品屋：增强实现。
 * @param htmlText HTML
 * @private
 */
function __town_accessoryStore(htmlText) {
    __page_constructNpcMessageTable("青鸟");
    __town_common_disableProhibitSellingItems($("table")[5]);
    $("input:submit[value='买入']").attr("id", "buyButton");

    // 检查是否身上还有富裕的购物空间？
    if ($("select[name='num']").find("option:first").length === 0) {
        $("#buyButton").prop("disabled", true);
        __page_writeNpcMessage("咱们就是说买东西之前至少身上腾点空间出来。");
        return;
    }

    // 获取当前身上现金的数量
    let cash = 0;
    $("td:parent").each(function (idx, td) {
        if ($(td).text() === "所持金") {
            let cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_writeNpcMessage("为了回馈新老客户，本店特推出直接通过<b><a href='javascript:void(0)' id='bankBuy'>银行转账购买</a></b>的方式。");
    $("#bankBuy").click(function () {
        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        __town_common_prepareForShopping(id, pass, cash, $("table")[7], $("#buyButton"));
    });
}

/**
 * 物品屋：增强实现。
 * @param htmlText HTML
 * @private
 */
function __town_itemStore(htmlText) {
    __page_constructNpcMessageTable("青鸟");
    __town_common_disableProhibitSellingItems($("table")[3]);
    $("input:submit[value='买入']").attr("id", "buyButton");

    // 检查是否身上还有富裕的购物空间？
    if ($("select[name='num']").find("option:first").length === 0) {
        $("#buyButton").prop("disabled", true);
        __page_writeNpcMessage("咱们就是说买东西之前至少身上腾点空间出来。");
        return;
    }

    // 获取当前身上现金的数量
    let cash = 0;
    $("td:parent").each(function (idx, td) {
        if ($(td).text() === "所持金") {
            let cashText = $(td).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
        }
    });

    __page_writeNpcMessage("为了回馈新老客户，本店特推出直接通过<b><a href='javascript:void(0)' id='bankBuy'>银行转账购买</a></b>的方式。");
    $("#bankBuy").click(function () {
        let id = __page_readIdFromCurrentPage();
        let pass = __page_readPassFromCurrentPage();
        __town_common_prepareForShopping(id, pass, cash, $("table")[5], $("#buyButton"));
    });
}

/**
 * 正在装备中和禁售名单上的物品不再提供选择。
 * @param table 身上物品所在表格的DOM
 * @private
 */
function __town_common_disableProhibitSellingItems(table) {
    $(table).find("input:radio[name='select']").each(function (idx, radio) {
        let name = $(radio).parent().next().next().text();
        if ($(radio).parent().next().text() === "★") {
            // 已经装备上的禁止售卖
            $(radio).prop("disabled", true);
        } else {
            for (let i = 0; i < _PROHIBIT_SELLING_ITEM_DICT.length; i++) {
                if (name === _PROHIBIT_SELLING_ITEM_DICT[i]) {
                    // 禁售名单里面
                    $(radio).prop("disabled", true);
                }
            }
        }
    });
}

function __town_common_prepareForShopping(id, pass, cash, table, submit) {
    let name = "";
    let price = 0;
    $(table).find("input:radio[name='select']").each(function (idx, radio) {
        if ($(radio).prop("checked")) {
            name = $(radio).parent().next().text();
            let priceText = $(radio).parent().next().next().text();
            price = priceText.substring(0, priceText.indexOf(" "));
        }
    });
    if (name !== "") {
        let count = 0;
        $("select[name='num']").find("option").each(function (idx, option) {
            if ($(option).prop("selected")) {
                count = $(option).val();
            }
        });

        let totalPrice = price * count;
        if (totalPrice > 0) {
            totalPrice = Math.max(10000, totalPrice);   // 如果总价不到1万，按照1万来计算
        }
        if (cash >= totalPrice) {
            $(submit).trigger("click");
        } else {
            let delta = Math.ceil((totalPrice - cash) / 10000);
            __ajax_withdrawGolds(id, pass, delta, function (data) {
                $(submit).trigger("click");
            });
        }
    }
}

/**
 * 卖出物品后，自动存入银行
 */
function __city_itemSold(htmlText) {
    __page_constructNpcMessageTable("青鸟");

    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();

    // 获取到卖出的金钱数
    var messageElement = $('h2:first');
    var price = messageElement.find('b:first').text();

    let returnMessage = "";
    returnMessage += "另外，要不要我带你回";
    returnMessage += "<b><a href='javascript:void(0)' id='returnARM'>武器屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnPRO'>防具屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnACC'>饰品屋</a></b>？";
    returnMessage += "<b><a href='javascript:void(0)' id='returnITM'>物品屋</a></b>？";

    if (price < 10000) {
        // 卖的钱太少了，不值得为你做点啥
        var lowPriceMessage = "虫吃鼠咬,光板没毛,破面烂袄一件儿~";
        __page_writeNpcMessage(lowPriceMessage);
        __page_writeNpcMessage(returnMessage);
        __city_itemSold_buildReturnFunction(id, pass);
    } else if (!__cookie_getEnableSoldAutoDeposit()) {
        // 卖的钱倒是够了，奈何自动存钱功能被禁用了
        var noDepositMessage = "破家值万贯，能换多少算多少吧！";
        __page_writeNpcMessage(noDepositMessage);
        __page_writeNpcMessage(returnMessage);
        __city_itemSold_buildReturnFunction(id, pass);
    } else {
        __ajax_depositAllGolds(id, pass, function (data) {
            let messageHtml = messageElement.html() + "已经自动存入银行。";
            messageElement.html(messageHtml);
            let autoDepositMessage = "呦嚯嚯。。这个全口袋也只有我能收下！钱已经存到银行了，我是雷锋。";
            __page_writeNpcMessage(autoDepositMessage);
            __page_writeNpcMessage(returnMessage);
            __city_itemSold_buildReturnFunction(data["id"], data["pass"]);
        });
    }
}

function __city_itemSold_buildReturnFunction(id, pass) {
    $("#returnARM").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ARM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回武器屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnPRO").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "PRO_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回防具屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnACC").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ACC_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回饰品屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnITM").click(function () {
        __ajax_readPersonalInformation(id, pass, function (data) {
            let townId = data["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ITEM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回物品屋");
            $("input[type='submit']").trigger("click");
        });
    });
}

function enhanceTownAdventurerGuild(htmlText) {
    $("input:submit[value='交换']").attr("id", "exchangeButton");
    $("input:submit[value='返回城市']").attr("id", "returnButton");

    let player = "";
    let cash = 0;
    $("td:parent").each(function (_idx, td) {
        const text = $(td).text();
        if (text.indexOf("因为手持城市图不能使用而烦恼吗？") !== -1) {
            if (_idx === 16) {
                $(td).attr("id", "messageBoard");
                $(td).attr("style", "color: white");
            }
        }
        if (text === "姓名") {
            player = $(td).parent().next().find("td:first").text();
        }
        if (text === "所持金") {
            const cashText = $(td).next().text();
            cash = parseInt(cashText.substring(0, cashText.indexOf(" GOLD")));
        }
    });

    let treasureHintMapCount = 0;
    $("input:checkbox").each(function (_idx, checkbox) {
        const checkboxName = $(checkbox).attr("name");
        if (checkboxName.startsWith("item")) {
            const mapX = parseInt($(checkbox).parent().next().next().next().next().text());
            const mapY = parseInt($(checkbox).parent().next().next().next().next().next().text());
            if (isUnavailableTreasureHintMap(mapX, mapY)) {
                let html = $(checkbox).parent().next().next().html();
                html = "<font color='red'><b>[城]</b></font>" + html;
                $(checkbox).parent().next().next().html(html);
            } else {
                treasureHintMapCount++;
            }
        }
    });

    __page_constructNpcMessageTable("花子");
    __page_writeNpcMessage("欢、欢、欢迎光临冒险家公会，等等，你这、这是什么表情？你肯定是认错人了，前几天你领薪水后碰、碰到的绝对" +
        "不、不、不是我！[漫长的沉默中] 你、你怎么不相信我的话，人与人之间基本的信、信任呢？[再次漫长的沉默] 算了，你这次要去哪里？" +
        "我免费让人带你过去。你出门去上、上、上马车吧。<br>");
    let select = "";
    select += "<select name='x' id='x'>";
    for (let i = 0; i <= 15; i++) {
        select += "<option value='" + i + "'>" + i + "</option>";
    }
    select += "</select>";
    select += "<select name='y' id='y'>";
    for (let i = 0; i <= 15; i++) {
        select += "<option value='" + i + "'>" + i + "</option>";
    }
    select += "</select>";
    __page_writeNpcMessage(select);
    __page_writeNpcMessage("<input type='button' id='coach_1' style='color: blue' value='车门上鸢尾兰的纹章熠熠生辉'>");
    __page_writeNpcMessage("<input type='button' id='coach_2' style='color: red' value='车身上剑与盾透露出铁血的气息'>");
    __page_writeNpcMessage("<input type='button' id='coach_3' style='color: black' value='斑驳的车身上隐约可见半拉兔子骷髅的形状'>");
    if (treasureHintMapCount > 0) {
        __page_writeNpcMessage("<br>");
        __page_writeNpcMessage("什、什、什么？？你有藏宝图！要不要去试试手气？在上面选好你想探险的藏宝图。<br>");
        __page_writeNpcMessage("<input type='button' id='treasure' style='color: red' value='带上藏宝图跟上兔子骷髅的脚步'>");
    }

    __page_writeNpcMessage("<div id='townId' style='display: none'></div>");

    $("#coach_1").prop("disabled", true);
    $("#coach_2").prop("disabled", true);
    $("#coach_3").prop("disabled", true);
    if (treasureHintMapCount > 0) {
        $("#treasure").prop("disabled", true);
    }

    const id = __page_readIdFromCurrentPage();
    const pass = __page_readPassFromCurrentPage();

    $("#coach_1").click(function () {
        alert("滚开，也不看看，什么马车都敢随便上！");
        $("#coach_1").prop("disabled", true);
    });
    $("#coach_2").click(function () {
        alert("下去，你要找的马车在隔壁。");
        $("#coach_2").prop("disabled", true);
    });
    $("#coach_3").click(function () {
        const x = parseInt($("#x").val());
        const y = parseInt($("#y").val());

        const townId = $("#townId").text();
        const town = _CITY_DICT[townId];
        const townLocation = [parseInt(town["x"]), parseInt(town["y"])];

        if (x === townLocation[0] && y === townLocation[1]) {
            alert("有没有一种可能你现在就在这里？坐标(" + x + "," + y + ")");
        } else {
            $("#x").prop("disabled", true);
            $("#y").prop("disabled", true);
            $("#exchangeButton").prop("disabled", true);
            $("#returnButton").prop("disabled", true);
            $("#coach_1").prop("disabled", true);
            $("#coach_2").prop("disabled", true);
            $("#coach_3").prop("disabled", true);
            if (treasureHintMapCount > 0) {
                $("#treasure").prop("disabled", true);
            }

            $("#messageBoard").html("放心，实时播报动态我们是专业的，绝对不比隔壁新开张的驿站差：<br>");
            __update_travel_message_board(player + "登上了车身斑驳的马车，一股说不出的味道扑鼻而来。");
            __update_travel_message_board(player + "皱了皱眉头，很不舒服的感觉。");
            __update_travel_message_board("嘎吱嘎吱声中，马车出发了。");

            leaveTown(id, pass, player, townId, function (data) {
                const moveScope = data["moveScope"];
                const moveMode = data["moveMode"];
                moveFromTo(id, pass, player, townLocation, [x, y], moveScope, moveMode, function (data) {
                    __update_travel_message_board("\"我们到了\"，车夫粗鲁的喊声惊醒了昏昏欲睡的" + player + "。");
                    __update_travel_message_board(player + "暗暗发誓再也不乘坐这架马车了！");
                    $("#returnButton").attr("value", "摇摇晃晃走下马车");
                    $("#returnButton").prop("disabled", false);
                });
            });
        }
    });

    if (treasureHintMapCount > 0) {
        $("#treasure").click(function () {
            const candidates = [];
            $("input:checkbox:checked").each(function (_idx, checkbox) {
                const checkboxName = $(checkbox).attr("name");
                if (checkboxName.startsWith("item")) {
                    const mapX = parseInt($(checkbox).parent().next().next().next().next().text());
                    const mapY = parseInt($(checkbox).parent().next().next().next().next().next().text());
                    if (!isUnavailableTreasureHintMap(mapX, mapY)) {
                        candidates.push([mapX, mapY]);
                    }
                }
            });
            if (candidates.length === 0) {
                alert("咱们就是说你好歹带上一张能用的藏宝图？");
            } else {
                $("#x").prop("disabled", true);
                $("#y").prop("disabled", true);
                $("#exchangeButton").prop("disabled", true);
                $("#returnButton").prop("disabled", true);
                $("#coach_1").prop("disabled", true);
                $("#coach_2").prop("disabled", true);
                $("#coach_3").prop("disabled", true);
                $("#treasure").prop("disabled", true);

                const townId = $("#townId").text();
                const town = _CITY_DICT[townId];
                const townLocation = [parseInt(town["x"]), parseInt(town["y"])];


                $("#messageBoard").html("冒险家公会之探险播报：<br>");

                let amount = 0;
                if (cash < 1100000) {
                    amount = Math.ceil((1100000 - cash) / 10000);
                }
                if (amount > 0) {
                    __ajax_withdrawGolds(id, pass, amount, function () {
                        __update_travel_message_board(player + "取出了" + amount + "万探险保证金。");
                        startTreasureHintMapSearchJournal(id, pass, player, townId, townLocation, candidates);
                    });
                } else {
                    startTreasureHintMapSearchJournal(id, pass, player, townId, townLocation, candidates);
                }
            }
        });
    }

    __ajax_readPersonalInformation(id, pass, function (data) {
        const townId = data["TOWN_ID"];
        $("#townId").text(townId);
        $("#coach_1").prop("disabled", false);
        $("#coach_2").prop("disabled", false);
        $("#coach_3").prop("disabled", false);
        $("#treasure").prop("disabled", false);
    });
}

function startTreasureHintMapSearchJournal(id, pass, player, townId, townLocation, candidates) {
    candidates.sort((a, b) => {
        let ret = a[0] - b[0];
        if (ret === 0) {
            ret = a[1] - b[1];
        }
        return ret;
    });

    const locationList = [];
    locationList.push(townLocation);
    locationList.push(...candidates);
    locationList.push(townLocation);

    __update_travel_message_board("兔子骷髅帮忙整理了" + player + "手中的藏宝图，说道：");
    let msg = "就按这个顺序走：";
    for (let i = 0; i < candidates.length; i++) {
        const it = candidates[i];
        msg += "(" + it[0] + "," + it[1] + ")";
        if (i !== candidates.length - 1) {
            msg += "=>";
        }
    }
    __update_travel_message_board(msg);
    __update_travel_message_board("完事儿后最后我们还回这儿来。");

    const foundList = [];

    leaveTown(id, pass, player, townId, function (data) {
        const scope = data["moveScope"];
        const mode = data["moveMode"];
        moveToAndSearch(id, pass, player, townId, scope, mode, locationList, 0, foundList);
    });
}

function moveToAndSearch(id, pass, player, townId, scope, mode, locationList, locationIndex, foundList) {
    const from = locationList[locationIndex];
    const to = locationList[locationIndex + 1];

    if (locationIndex !== locationList.length - 2) {
        if (from[0] === to[0] && from[1] === to[1]) {
            // 下一张图在原地
            __update_travel_message_board("兔子骷髅说：运气真好，原地可以继续探险。");
            __update_travel_message_board("等待探险冷却中......(约55秒)");
            setTimeout(function () {
                const request = {"id": id, "pass": pass, "mode": "MAP_SEARCH"};
                network.sendPostRequest("map.cgi", request, function (html) {
                    __update_travel_message_board(player + "在(" + to[0] + "," + to[1] + ")完成探险！");
                    if (html.indexOf("所持金超过1000000。请先存入银行。") !== -1) {
                        __update_travel_message_board("<font color='yellow'>" + player + "惨被3BT袭击，兔子骷髅开心看着完全没有搭把手的意思。</font>");
                        foundList.push("被3BT殴打！");
                    } else {
                        const found = $(html).find("h2:first").text();
                        foundList.push(found);
                        __update_travel_message_board("<font color='red'>" + player + found + "</font>");
                    }
                    moveToAndSearch(id, pass, player, townId, scope, mode, locationList, locationIndex + 1, foundList);
                });
            }, 55000);
        } else {
            moveFromTo(id, pass, player, from, to, scope, mode, function (data) {
                __update_travel_message_board("等待探险冷却中......(约55秒)");
                setTimeout(function () {
                    const request = {"id": id, "pass": pass, "mode": "MAP_SEARCH"};
                    network.sendPostRequest("map.cgi", request, function (html) {
                        __update_travel_message_board(player + "在(" + to[0] + "," + to[1] + ")完成探险！");
                        if (html.indexOf("所持金超过1000000。请先存入银行。") !== -1) {
                            __update_travel_message_board("<font color='yellow'>" + player + "惨被3BT袭击，兔子骷髅开心看着完全没有搭把手的意思。</font>");
                            foundList.push("被3BT殴打！");
                        } else {
                            const found = $(html).find("h2:first").text();
                            foundList.push(found);
                            __update_travel_message_board("<font color='red'>" + player + found + "</font>");
                        }
                        moveToAndSearch(id, pass, player, townId, scope, mode, locationList, locationIndex + 1, foundList);
                    });
                }, 55000);
            });
        }
    } else {
        // 最后一个坐标已经完成了探险。现在可以回城了
        __update_travel_message_board("藏宝图都用完了，回城吧。");
        moveFromTo(id, pass, player, from, to, scope, mode, function (data) {
            __update_travel_message_board("等待进城冷却中......(约55秒)");
            setTimeout(function () {
                enterTown(id, pass, townId, function (data) {
                    const html = data["html"];
                    if ($(html).text().indexOf("战胜门卫。") !== -1) {
                        __update_travel_message_board("与门卫交涉中......");
                        const request = {};
                        request["id"] = id;
                        request["pass"] = pass;
                        request["townid"] = townId;
                        request["givemoney"] = "1";
                        request["mode"] = "MOVE";
                        $.post("status.cgi", request, function (html) {
                            __update_travel_message_board("门卫通情达理的收取了合理的入城税。");
                            __ajax_depositAllGolds(id, pass, function () {
                                __update_travel_message_board(player + "吧剩余的现金存入了银行。");
                                $("#returnButton").prop("disabled", false);
                                $("#returnButton").attr("value", "欢迎回来");
                                __update_travel_message_board("探险完成，在兔子骷髅不怀好意的挥手注视下，" + player + "快速离开了。");
                                if (foundList.length > 0) {
                                    __update_travel_message_board(player + "回到无人处，悄悄检视了下探险的收入：");
                                    for (let i = 0; i < foundList.length; i++) {
                                        __update_travel_message_board("<font color='blue'>" + foundList[i] + "</font>");
                                    }
                                }
                            });
                        });
                    } else {
                        __ajax_depositAllGolds(id, pass, function () {
                            __update_travel_message_board(player + "吧剩余的现金存入了银行。");
                            $("#returnButton").prop("disabled", false);
                            $("#returnButton").attr("value", "欢迎回来");
                            __update_travel_message_board("探险完成，在兔子骷髅不怀好意的挥手注视下，" + player + "快速离开了。");
                            if (foundList.length > 0) {
                                __update_travel_message_board(player + "回到无人处，悄悄检视了下探险的收入：");
                                for (let i = 0; i < foundList.length; i++) {
                                    __update_travel_message_board("<font color='blue'>" + foundList[i] + "</font>");
                                }
                            }
                        });
                    }
                })
            }, 55000);
        });
    }
}

// ============================================================================
// 个人状态后续辅助功能
// ============================================================================
function postProcessPersonalStatusRelatedFunctionalities(htmlText) {
    if (htmlText.indexOf("给其他人发送消息") !== -1) {
        // 复用个人接收的信作为Cookie管理的页面
        __personalStatus_cookieManagement(htmlText);
    }
    if (htmlText.indexOf("仙人的宝物") != -1) {
        __personalStatus_view(htmlText);
    }
    if (htmlText.indexOf("领取了") !== -1) {
        __personalStatus_salary(htmlText);
    }
    if (htmlText.indexOf("物品使用．装备") != -1) {
        __personalStatus_equipment(htmlText);
    }
    if (htmlText.indexOf("物品 百宝袋 使用。") != -1) {
        __personalStatus_treasureBag(htmlText);
    }
    if (htmlText.indexOf("* 转职神殿 *") != -1) {
        __personalStatus_transferCareer(htmlText);
    }
}

function __personalStatus_cookieManagement(htmlText) {
    const originalBodyHtml = $("body:first").html();
    const startLocation = originalBodyHtml.indexOf("<form action=\"status.cgi\" method=\"post\">");
    let reformatBodyHtml = originalBodyHtml.substring(startLocation);
    reformatBodyHtml = "<hr size=0><h2>口袋助手设置<BR></h2><hr size=0><CENTER>" + reformatBodyHtml;
    $("body:first").html(reformatBodyHtml);

    $("input:submit[value='返回城市']").attr("id", "returnButton");
    __page_constructNpcMessageTable("夜九年");
    __page_writeNpcMessage("在这里我来协助各位维护本机（浏览器）的口袋相关设置：&nbsp;" +
        "<a href='javascript:void(0)' id='listAllEquipment' style='color: gold'><b>选择所有装备</b></a>&nbsp;&nbsp;&nbsp;" +
        "<a href='javascript:void(0)' id='listOwnEquipment' style='color: gold'><b>选择自有装备</b></a>" +
        "<br>");

    const id = __page_readIdFromCurrentPage();
    const pass = __page_readPassFromCurrentPage();

    let b1 = __cookie_getEnablePokemonWiki();
    let s1 = "<select name='s1' id='s1'>";
    s1 += "<option class='o1' value='1'>启用</option>";
    s1 += "<option class='o1' value='0'>禁用</option>";
    s1 += "</select>";
    __page_writeNpcMessage("<li>宝可梦百科超链 " + s1 + " <a href='javascript:void(0)' id='a1' style='color: yellow'>设置</a></li>");


    let b2 = __cookie_getEnableSoldAutoDeposit();
    let s2 = "<select name='s2' id='s2'>";
    s2 += "<option class='o2' value='1'>启用</option>";
    s2 += "<option class='o2' value='0'>禁用</option>";
    s2 += "</select>";
    __page_writeNpcMessage("<li>售卖后自动存钱 " + s2 + " <a href='javascript:void(0)' id='a2' style='color: yellow'>设置</a></li>");


    let b3 = __cookie_getHealthLoseAutoLodgeRatio();
    let s3 = "<select name='s3' id='s3'>";
    s3 += "<option class='o3' value='0.1'>10%</option>";
    s3 += "<option class='o3' value='0.2'>20%</option>";
    s3 += "<option class='o3' value='0.3'>30%</option>";
    s3 += "<option class='o3' value='0.4'>40%</option>";
    s3 += "<option class='o3' value='0.5'>50%</option>";
    s3 += "<option class='o3' value='0.6'>60%</option>";
    s3 += "<option class='o3' value='0.7'>70%</option>";
    s3 += "<option class='o3' value='0.8'>80%</option>";
    s3 += "<option class='o3' value='0.9'>90%</option>";
    s3 += "</select>";
    __page_writeNpcMessage("<li>掉血后自动住宿 " + s3 + " <a href='javascript:void(0)' id='a3' style='color: yellow'>设置</a></li>");

    let b10 = __cookie_getManaLoseAutoLodgePoint();
    let s10 = "<select name='s10' id='s10'>";
    s10 += "<option class='o10' value='10'>10PP</option>";
    s10 += "<option class='o10' value='20'>20PP</option>";
    s10 += "<option class='o10' value='50'>50PP</option>";
    s10 += "<option class='o10' value='100'>100PP</option>";
    s10 += "<option class='o10' value='200'>200PP</option>";
    s10 += "<option class='o10' value='500'>500PP</option>";
    s10 += "</select>";
    __page_writeNpcMessage("<li>掉魔后自动住宿 " + s10 + " <a href='javascript:void(0)' id='a10' style='color: yellow'>设置</a></li>");

    let b4 = __cookie_getRepairItemThreshold();
    let s4 = "<select name='s4' id='s4'>";
    s4 += "<option class='o4' value='10'>耐久10</option>";
    s4 += "<option class='o4' value='20'>耐久20</option>";
    s4 += "<option class='o4' value='50'>耐久50</option>";
    s4 += "<option class='o4' value='100'>耐久100</option>";
    s4 += "</select>";
    __page_writeNpcMessage("<li>修理装备耐久限 " + s4 + " <a href='javascript:void(0)' id='a4' style='color: yellow'>设置</a></li>");

    let b5 = __cookie_getDepositBattleNumber();
    let s5 = "<select name='s5' id='s5'>";
    s5 += "<option class='o5' value='0'>每战存钱</option>";
    s5 += "<option class='o5' value='2'>2战一存</option>";
    s5 += "<option class='o5' value='5'>5战一存</option>";
    s5 += "<option class='o5' value='10'>10战一存</option>";
    s5 += "</select>";
    __page_writeNpcMessage("<li>触发存钱的战数 " + s5 + " <a href='javascript:void(0)' id='a5' style='color: yellow'>设置</a></li>");

    let b6 = __cookie_getReturnButtonText();
    let s6 = "<input type='text' class='o6' name='s6' id='s6' size='48' placeholder='" + b6 + "'>";
    __page_writeNpcMessage("<li>战斗返回的台词 " + s6 + " <a href='javascript:void(0)' id='a6' style='color: yellow'>设置</a></li>");

    let b7 = __cookie_getDepositButtonText();
    let s7 = "<input type='text' class='o7' name='s7' id='s7' size='48' placeholder='" + b7 + "'>";
    __page_writeNpcMessage("<li>战斗存钱的台词 " + s7 + " <a href='javascript:void(0)' id='a7' style='color: yellow'>设置</a></li>");

    let b8 = __cookie_getLodgeButtonText();
    let s8 = "<input type='text' class='o8' name='s8' id='s8' size='48' placeholder='" + b8 + "'>";
    __page_writeNpcMessage("<li>战斗住宿的台词 " + s8 + " <a href='javascript:void(0)' id='a8' style='color: yellow'>设置</a></li>");

    let b9 = __cookie_getRepairButtonText();
    let s9 = "<input type='text' class='o9' name='s9' id='s9' size='48' placeholder='" + b9 + "'>";
    __page_writeNpcMessage("<li>战斗修理的台词 " + s9 + " <a href='javascript:void(0)' id='a9' style='color: yellow'>设置</a></li>");

    let b11 = __cookie_getEnableBattleAutoScroll();
    let s11 = "<select name='s11' id='s11'>";
    s11 += "<option class='o11' value='1'>启用</option>";
    s11 += "<option class='o11' value='0'>禁用</option>";
    s11 += "</select>";
    __page_writeNpcMessage("<li>战斗页自动触底 " + s11 + " <a href='javascript:void(0)' id='a11' style='color: yellow'>设置</a></li>");

    let b12 = __cookie_getEnableBattleForceRecommendation();
    let s12 = "<select name='s12' id='s12'>";
    s12 += "<option class='o12' value='1'>启用</option>";
    s12 += "<option class='o12' value='0'>禁用</option>";
    s12 += "</select>";
    __page_writeNpcMessage("<li>战斗后强制推荐 " + s12 + " <a href='javascript:void(0)' id='a12' style='color: yellow'>设置</a></li>");

    let set1 = __cookie_getEquipmentSet("A", id);
    let h1 = "";
    h1 += "<select name='set1_weapon_star' id='set1_weapon_star'>";
    h1 += "<option class='set1_weapon_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_weapon_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_weapon' id='set1_weapon'>";
    h1 += "</select>";
    h1 += "<select name='set1_armor_star' id='set1_armor_star'>";
    h1 += "<option class='set1_armor_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_armor_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_armor' id='set1_armor'>";
    h1 += "</select>";
    h1 += "<select name='set1_accessory_star' id='set1_accessory_star'>";
    h1 += "<option class='set1_accessory_star_class' value='0'>正常</option>";
    h1 += "<option class='set1_accessory_star_class' value='1'>齐心</option>";
    h1 += "</select>";
    h1 += "<select name='set1_accessory' id='set1_accessory'>";
    h1 += "</select>";
    __page_writeNpcMessage("<li>第一类自定套装 " + h1 + " <a href='javascript:void(0)' id='set1' style='color: yellow'>设置</a></li>");

    let set2 = __cookie_getEquipmentSet("B", id);
    let h2 = "";
    h2 += "<select name='set2_weapon_star' id='set2_weapon_star'>";
    h2 += "<option class='set2_weapon_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_weapon_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_weapon' id='set2_weapon'>";
    h2 += "</select>";
    h2 += "<select name='set2_armor_star' id='set2_armor_star'>";
    h2 += "<option class='set2_armor_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_armor_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_armor' id='set2_armor'>";
    h2 += "</select>";
    h2 += "<select name='set2_accessory_star' id='set2_accessory_star'>";
    h2 += "<option class='set2_accessory_star_class' value='0'>正常</option>";
    h2 += "<option class='set2_accessory_star_class' value='1'>齐心</option>";
    h2 += "</select>";
    h2 += "<select name='set2_accessory' id='set2_accessory'>";
    h2 += "</select>";
    __page_writeNpcMessage("<li>第二类自定套装 " + h2 + " <a href='javascript:void(0)' id='set2' style='color: yellow'>设置</a></li>");

    let set3 = __cookie_getEquipmentSet("C", id);
    let h3 = "";
    h3 += "<select name='set3_weapon_star' id='set3_weapon_star'>";
    h3 += "<option class='set3_weapon_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_weapon_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_weapon' id='set3_weapon'>";
    h3 += "</select>";
    h3 += "<select name='set3_armor_star' id='set3_armor_star'>";
    h3 += "<option class='set3_armor_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_armor_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_armor' id='set3_armor'>";
    h3 += "</select>";
    h3 += "<select name='set3_accessory_star' id='set3_accessory_star'>";
    h3 += "<option class='set3_accessory_star_class' value='0'>正常</option>";
    h3 += "<option class='set3_accessory_star_class' value='1'>齐心</option>";
    h3 += "</select>";
    h3 += "<select name='set3_accessory' id='set3_accessory'>";
    h3 += "</select>";
    __page_writeNpcMessage("<li>第三类自定套装 " + h3 + " <a href='javascript:void(0)' id='set3' style='color: yellow'>设置</a></li>");

    let set4 = __cookie_getEquipmentSet("D", id);
    let h4 = "";
    h4 += "<select name='set4_weapon_star' id='set4_weapon_star'>";
    h4 += "<option class='set4_weapon_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_weapon_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_weapon' id='set4_weapon'>";
    h4 += "</select>";
    h4 += "<select name='set4_armor_star' id='set4_armor_star'>";
    h4 += "<option class='set4_armor_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_armor_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_armor' id='set4_armor'>";
    h4 += "</select>";
    h4 += "<select name='set4_accessory_star' id='set4_accessory_star'>";
    h4 += "<option class='set4_accessory_star_class' value='0'>正常</option>";
    h4 += "<option class='set4_accessory_star_class' value='1'>齐心</option>";
    h4 += "</select>";
    h4 += "<select name='set4_accessory' id='set4_accessory'>";
    h4 += "</select>";
    __page_writeNpcMessage("<li>第四类自定套装 " + h4 + " <a href='javascript:void(0)' id='set4' style='color: yellow'>设置</a></li>");

    let set5 = __cookie_getEquipmentSet("E", id);
    let h5 = "";
    h5 += "<select name='set5_weapon_star' id='set5_weapon_star'>";
    h5 += "<option class='set5_weapon_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_weapon_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_weapon' id='set5_weapon'>";
    h5 += "</select>";
    h5 += "<select name='set5_armor_star' id='set5_armor_star'>";
    h5 += "<option class='set5_armor_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_armor_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_armor' id='set5_armor'>";
    h5 += "</select>";
    h5 += "<select name='set5_accessory_star' id='set5_accessory_star'>";
    h5 += "<option class='set5_accessory_star_class' value='0'>正常</option>";
    h5 += "<option class='set5_accessory_star_class' value='1'>齐心</option>";
    h5 += "</select>";
    h5 += "<select name='set5_accessory' id='set5_accessory'>";
    h5 += "</select>";
    __page_writeNpcMessage("<li>第五类自定套装 " + h5 + " <a href='javascript:void(0)' id='set5' style='color: yellow'>设置</a></li>");

    let zodiac = __cookie_getEnableZodiacFlashBattle();
    let zodiacSelect = "<select name='zodiacSelect' id='zodiacSelect'>";
    zodiacSelect += "<option class='zodiacSelect_class' value='1'>启用</option>";
    zodiacSelect += "<option class='zodiacSelect_class' value='0'>禁用</option>";
    zodiacSelect += "</select>";
    __page_writeNpcMessage("<li>十二宫极速战斗 " + zodiacSelect + " <a href='javascript:void(0)' id='zodiac' style='color: yellow'>设置</a></li>");

    $(".o1[value='" + Number(b1) + "']").prop("selected", true);
    $(".o2[value='" + Number(b2) + "']").prop("selected", true);
    $(".o3[value='" + b3 + "']").prop("selected", true);
    $(".o10[value='" + b10 + "']").prop("selected", true);
    $(".o4[value='" + b4 + "']").prop("selected", true);
    $(".o5[value='" + b5 + "']").prop("selected", true);
    $(".o11[value='" + Number(b11) + "']").prop("selected", true);
    $(".o12[value='" + Number(b12) + "']").prop("selected", true);
    $(".zodiacSelect_class[value='" + Number(zodiac) + "']").prop("selected", true);

    __generateOwnEquipmentSelectOptions(id, pass);

    $("#listAllEquipment").click(function () {
        __generateAllEquipmentSelectOptions(id);
    });

    $("#listOwnEquipment").click(function () {
        __generateOwnEquipmentSelectOptions(id, pass);
    });

    $("#a1").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_POKEMON_WIKI", $("#s1").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a2").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_SOLD_AUTO_DEPOSIT", $("#s2").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a3").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__HEALTH_LOSE_AUTO_LODGE_RATIO", $("#s3").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a10").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__MANA_LOSE_AUTO_LODGE_POINT", $("#s10").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a4").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD", $("#s4").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a5").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__DEPOSIT_BATTLE_NUMBER", $("#s5").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a6").click(function () {
        let text = $("#s6").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__RETURN_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a7").click(function () {
        let text = $("#s7").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__DEPOSIT_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a8").click(function () {
        let text = $("#s8").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__LODGE_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a9").click(function () {
        let text = $("#s9").val();
        if (text !== "") {
            text = escape(text);
        }
        Cookies.set("_POCKETROSE_ASSISTANT__REPAIR_BUTTON_TEXT", text, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a11").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_AUTO_SCROLL", $("#s11").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#a12").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_FORCE_RECOMMENDATION", $("#s12").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });

    $("#set1").click(function () {
        let p1 = $("#set1_weapon").val();
        let p2 = $("#set1_weapon_star").val();
        let p3 = $("#set1_armor").val();
        let p4 = $("#set1_armor_star").val();
        let p5 = $("#set1_accessory").val();
        let p6 = $("#set1_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_A_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set2").click(function () {
        let p1 = $("#set2_weapon").val();
        let p2 = $("#set2_weapon_star").val();
        let p3 = $("#set2_armor").val();
        let p4 = $("#set2_armor_star").val();
        let p5 = $("#set2_accessory").val();
        let p6 = $("#set2_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_B_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set3").click(function () {
        let p1 = $("#set3_weapon").val();
        let p2 = $("#set3_weapon_star").val();
        let p3 = $("#set3_armor").val();
        let p4 = $("#set3_armor_star").val();
        let p5 = $("#set3_accessory").val();
        let p6 = $("#set3_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_C_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set4").click(function () {
        let p1 = $("#set4_weapon").val();
        let p2 = $("#set4_weapon_star").val();
        let p3 = $("#set4_armor").val();
        let p4 = $("#set4_armor_star").val();
        let p5 = $("#set4_accessory").val();
        let p6 = $("#set4_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_D_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#set5").click(function () {
        let p1 = $("#set5_weapon").val();
        let p2 = $("#set5_weapon_star").val();
        let p3 = $("#set5_armor").val();
        let p4 = $("#set5_armor_star").val();
        let p5 = $("#set5_accessory").val();
        let p6 = $("#set5_accessory_star").val();

        let value = p1 + "_" + p2 + "_" + p3 + "_" + p4 + "_" + p5 + "_" + p6;
        value = escape(value);

        let key = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_E_" + id;
        Cookies.set(key, value, {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
    $("#zodiac").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__ENABLE_ZODIAC_FLASH_BATTLE", $("#zodiacSelect").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
}

function __generateAllEquipmentSelectOptions(id) {
    for (let idx = 1; idx <= 5; idx++) {
        let weaponOptions = "<option class='set" + idx + "_weapon_class' value='NONE'>★ 选择武器 ★</option>";
        for (let i = 0; i < _WEAPON_DICT.length; i++) {
            const weapon = _WEAPON_DICT[i];
            weaponOptions += "<option class='set" + idx + "_weapon_class' value='" + weapon + "'>" + weapon + "</option>";
        }
        $("#set" + idx + "_weapon").html(weaponOptions);

        let armorOptions = "<option class='set" + idx + "_armor_class' value='NONE'>★ 选择防具 ★</option>";
        for (let i = 0; i < _ARMOR_DICT.length; i++) {
            const armor = _ARMOR_DICT[i];
            armorOptions += "<option class='set" + idx + "_armor_class' value='" + armor + "'>" + armor + "</option>";
        }
        $("#set" + idx + "_armor").html(armorOptions);

        let accessoryOptions = "<option class='set" + idx + "_accessory_class' value='NONE'>★ 选择饰品 ★</option>";
        for (let i = 0; i < _ACCESSORY_DICT.length; i++) {
            const accessory = _ACCESSORY_DICT[i];
            accessoryOptions += "<option class='set" + idx + "_accessory_class' value='" + accessory + "'>" + accessory + "</option>";
        }
        $("#set" + idx + "_accessory").html(accessoryOptions);
    }

    for (let idx = 1; idx <= 5; idx++) {
        let no = "";
        if (idx === 1) {
            no = "A";
        } else if (idx === 2) {
            no = "B";
        } else if (idx === 3) {
            no = "C";
        } else if (idx === 4) {
            no = "D";
        } else {
            no = "E";
        }
        const set = __cookie_getEquipmentSet(no, id);

        $(".set" + idx + "_weapon_star_class[value='" + set[1] + "']").prop("selected", true);
        $(".set" + idx + "_weapon_class[value='" + set[0] + "']").prop("selected", true);
        $(".set" + idx + "_armor_star_class[value='" + set[3] + "']").prop("selected", true);
        $(".set" + idx + "_armor_class[value='" + set[2] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_star_class[value='" + set[5] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_class[value='" + set[4] + "']").prop("selected", true);
    }
}

function __generateOwnEquipmentSelectOptions(id, pass) {
    const ownWeapons = {};
    const ownArmors = {};
    const ownAccessories = {};
    __ajax_checkOwnItems(id, pass, function (id, pass, html) {
        let bagIndex = -1;
        $(html).find("input:checkbox").each(function (_idx, checkbox) {
            const name = $(checkbox).parent().next().next().text();
            const category = $(checkbox).parent().next().next().next().text();
            let nameForUse = name;
            if (nameForUse.indexOf("齐心★") !== -1) {
                nameForUse = nameForUse.substring(3);
            }
            if (category === "武器") {
                ownWeapons[nameForUse] = true;
            }
            if (category === "防具") {
                ownArmors[nameForUse] = true;
            }
            if (category === "饰品") {
                ownAccessories[nameForUse] = true;
            }
            if (category === "物品" && name === "百宝袋") {
                bagIndex = $(checkbox).val();
            }
        });

        if (bagIndex >= 0) {
            __ajax_openTreasureBag(id, pass, bagIndex, function (id, pass, html) {
                $(html).find("input:checkbox").each(function (_idx, checkbox) {
                    const name = $(checkbox).parent().next().text();
                    const category = $(checkbox).parent().next().next().text();
                    let nameForUse = name;
                    if (nameForUse.indexOf("齐心★") !== -1) {
                        nameForUse = nameForUse.substring(3);
                    }
                    if (category === "武器") {
                        ownWeapons[nameForUse] = true;
                    }
                    if (category === "防具") {
                        ownArmors[nameForUse] = true;
                    }
                    if (category === "饰品") {
                        ownAccessories[nameForUse] = true;
                    }
                    __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories);
                });
            });
        } else {
            __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories);
        }
    });
}

function __doGenerateOwnEquipmentSelectOptions(id, ownWeapons, ownArmors, ownAccessories) {
    for (let idx = 1; idx <= 5; idx++) {
        let weaponOptions = "<option class='set" + idx + "_weapon_class' value='NONE'>★ 选择武器 ★</option>";
        for (let i = 0; i < _WEAPON_DICT.length; i++) {
            const weapon = _WEAPON_DICT[i];
            if (ownWeapons[weapon] !== undefined) {
                weaponOptions += "<option class='set" + idx + "_weapon_class' value='" + weapon + "'>" + weapon + "</option>";
            }
        }
        $("#set" + idx + "_weapon").html(weaponOptions);

        let armorOptions = "<option class='set" + idx + "_armor_class' value='NONE'>★ 选择防具 ★</option>";
        for (let i = 0; i < _ARMOR_DICT.length; i++) {
            const armor = _ARMOR_DICT[i];
            if (ownArmors[armor] !== undefined) {
                armorOptions += "<option class='set" + idx + "_armor_class' value='" + armor + "'>" + armor + "</option>";
            }
        }
        $("#set" + idx + "_armor").html(armorOptions);

        let accessoryOptions = "<option class='set" + idx + "_accessory_class' value='NONE'>★ 选择饰品 ★</option>";
        for (let i = 0; i < _ACCESSORY_DICT.length; i++) {
            const accessory = _ACCESSORY_DICT[i];
            if (ownAccessories[accessory] !== undefined) {
                accessoryOptions += "<option class='set" + idx + "_accessory_class' value='" + accessory + "'>" + accessory + "</option>";
            }
        }
        $("#set" + idx + "_accessory").html(accessoryOptions);
    }

    for (let idx = 1; idx <= 5; idx++) {
        let no = "";
        if (idx === 1) {
            no = "A";
        } else if (idx === 2) {
            no = "B";
        } else if (idx === 3) {
            no = "C";
        } else if (idx === 4) {
            no = "D";
        } else {
            no = "E";
        }
        const set = __cookie_getEquipmentSet(no, id);

        $(".set" + idx + "_weapon_star_class[value='" + set[1] + "']").prop("selected", true);
        $(".set" + idx + "_weapon_class[value='" + set[0] + "']").prop("selected", true);
        $(".set" + idx + "_armor_star_class[value='" + set[3] + "']").prop("selected", true);
        $(".set" + idx + "_armor_class[value='" + set[2] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_star_class[value='" + set[5] + "']").prop("selected", true);
        $(".set" + idx + "_accessory_class[value='" + set[4] + "']").prop("selected", true);
    }
}

// 个人状态 -> 状态查看
function __personalStatus_view(htmlText) {
    $('input[value="返回城市"]').attr('tabIndex', 1);
    var honor;
    $("td:parent").each(function (_i, e) {
        var t = $(e).html();
        if (t.indexOf("荣誉：") != -1) {
            honor = $(e);
        }
    });
    if (honor != undefined) {
        var honorHtml = honor.html();
        var noBR = honorHtml.replace(/<br>/g, '');
        honor.attr('style', 'word-break:break-all');
        honor.html(noBR);
    }
}

/**
 * 领取俸禄后增强，添加存钱返回的功能。
 * @param htmlText HTML
 * @private
 */
function __personalStatus_salary(htmlText) {
    __page_constructNpcMessageTable("花子");
    __page_writeNpcMessage("打、打、打劫。不许笑，我跟这儿打劫呢。IC、IP、IQ卡，通通告诉我密码！");
    __page_writeNpcMessage("<a href='javascript:void(0)' id='runaway' style='color: yellow'><b>[溜了溜了]</b></a>");
    const id = __page_readIdFromCurrentPage();
    const pass = __page_readPassFromCurrentPage();
    $("#runaway").click(function () {
        __ajax_depositAllGolds(id, pass, function (data) {
            $("input:submit[value='返回城市']").trigger("click");
        });
    });
}

// 个人状态 -> 物品使用．装备
function __personalStatus_equipment(htmlText) {
    __page_constructNpcMessageTable("妮可");
    __page_writeNpcMessage("快捷简单的操作谁又会不喜欢呢？");

    $("input:submit[value='返回上个画面']").attr("id", "returnButton");
    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();

    let cash = 0;
    $("td:parent").each(function (_i, e) {
        if ($(e).text() === "所持金") {
            let cashText = $(e).next().text();
            cash = cashText.substring(0, cashText.indexOf(" "));
            $(e).parent().parent().append("<tr><td colspan='6' bgcolor='#E8E8D0' id='extMenuLocation'></td></tr>");
        }
    });

    let treasureBagIndex = -1;
    let goldenCageIndex = -1;
    $("input[type='checkbox']").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        if (category === "物品") {
            if (name === "百宝袋") {
                treasureBagIndex = $(checkbox).val();
            }
            if (name === "黄金笼子") {
                goldenCageIndex = $(checkbox).val();
            }
        }
    });

    let extMenu = "";
    extMenu += "<li><a href='javascript:void(0)' id='goIntoBag'>进入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='goIntoCage'>进入黄金笼子</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllGemsIntoBag'>所有的宝石放入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllItemsIntoBag'>所有非必要装备/物品放入百宝袋</a></li>"
    $("#extMenuLocation").html(extMenu);

    let treasureMapLocatedAtCity = [];
    $("input[type='checkbox']").each(function (_idx, inputElement) {
        let inputTableCell = $(inputElement).parent();
        let name = $(inputTableCell).next().next().text();
        let category = $(inputTableCell).next().next().next().text();
        if (category === "武器" || category === "防具" || category === "饰品") {
            // 计算装备满级所需要的最高经验
            let power = $(inputTableCell).next().next().next().next().text();
            let currentExp = $(inputTableCell).next().next().next().next()
                .next().next().next().next()
                .next().next().next().next()
                .next().next().next().next().text();

            if (__utilities_checkIfEquipmentFullExperience(name, power, currentExp)) {
                let nameHtml = $(inputTableCell).next().next().html();
                nameHtml = "<font color='red'><b>[满]</b></font>" + nameHtml;
                $(inputTableCell).next().next().html(nameHtml);
            }
        }
        if (category === "物品" && name.indexOf("藏宝图") !== -1) {
            // Process 藏宝图 related enhancement.
            let x = $(inputTableCell).next().next().next().next().text();
            let y = $(inputTableCell).next().next().next().next().next().text();
            if (isUnavailableTreasureHintMap(parseInt(x), parseInt(y))) {
                let nameHtml = $(inputTableCell).next().next().html();
                nameHtml = "<font color='red'><b>[城]</b></font>" + nameHtml;
                $(inputTableCell).next().next().html(nameHtml);
                treasureMapLocatedAtCity.push([$(inputElement).attr("name"), $(inputElement).val()]);
            }
        }
    });

    $("#goIntoBag").click(function () {
        if (__common_item_selectBag($("html")) > 0) {
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#goIntoCage").click(function () {
        if (__common_item_selectCage($("html")) > 0) {
            $("option[value='USE']").prop("selected", true);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", false);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#putAllGemsIntoBag").click(function () {
        if (__common_item_selectAllGems($("html")) > 0) {
            $("option[value='USE']").prop("selected", false);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", true);
            $("input[value='确定']").trigger("click");
        }
    });

    $("#putAllItemsIntoBag").click(function () {
        if (__common_item_selectAllStorableItems($("html")) > 0) {
            $("option[value='USE']").prop("selected", false);
            $("option[value='CONSECRATE']").prop("selected", false);
            $("option[value='PUTINBAG']").prop("selected", true);
            $("input[value='确定']").trigger("click");
        }
    });

    if (treasureMapLocatedAtCity.length > 0) {
        __page_writeNpcMessage("<li><a href='javascript:void(0)' id='exchangeTreasureMaps' style='color:yellow'><b>一键更换所有的城市藏宝图</b></a></li>");
    }
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='unloadAllEquipments' style='color:yellow'><b>一键卸下所有装备</b></a>" +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareChocolateSet' style='color:yellow'><b>一键准备巧克力套装</b></a>   " +
        "<a href='javascript:void(0)' id='useChocolateSet' style='color:yellow'><b>一键装备巧克力套装</b></a>" +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetA' style='color:yellow'><b>一键准备套装A</b></a>   " +
        "<a href='javascript:void(0)' id='useSetA' style='color:yellow'><b>一键装备套装A</b></a>   " +
        ____format_set_text("A", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetB' style='color:yellow'><b>一键准备套装B</b></a>   " +
        "<a href='javascript:void(0)' id='useSetB' style='color:yellow'><b>一键装备套装B</b></a>   " +
        ____format_set_text("B", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetC' style='color:yellow'><b>一键准备套装C</b></a>   " +
        "<a href='javascript:void(0)' id='useSetC' style='color:yellow'><b>一键装备套装C</b></a>   " +
        ____format_set_text("C", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetD' style='color:yellow'><b>一键准备套装D</b></a>   " +
        "<a href='javascript:void(0)' id='useSetD' style='color:yellow'><b>一键装备套装D</b></a>   " +
        ____format_set_text("D", id) +
        "</li>");
    __page_writeNpcMessage("<li>" +
        "<a href='javascript:void(0)' id='prepareSetE' style='color:yellow'><b>一键准备套装E</b></a>   " +
        "<a href='javascript:void(0)' id='useSetE' style='color:yellow'><b>一键装备套装E</b></a>   " +
        ____format_set_text("E", id) +
        "</li>");

    if (treasureMapLocatedAtCity.length > 0) {
        $("#exchangeTreasureMaps").click(function () {
            let amount = 0;
            if (cash < 100000) {
                amount = Math.ceil((100000 - cash) / 10000);
            }
            __ajax_withdrawGolds(id, pass, amount, function (data) {
                let request = {};
                request["id"] = data["id"];
                request["pass"] = data["pass"];
                request["mode"] = "CHANGEMAP2";
                for (let i = 0; i < treasureMapLocatedAtCity.length; i++) {
                    request[treasureMapLocatedAtCity[i][0]] = treasureMapLocatedAtCity[i][1];
                }
                $.post("town.cgi", request, function (html) {
                    $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                    $("form[action='status.cgi']").attr("action", "mydata.cgi");
                    $("#returnButton").trigger("click");
                });
            });
        });
    }
    // 一键卸下所有装备
    $("#unloadAllEquipments").click(function () {
        let candidates = [];
        $("input[type='checkbox']").each(function (_idx, checkbox) {
            let using = $(checkbox).parent().next().text();
            if (using === "★") {
                $(checkbox).prop("checked", true);
                candidates.push([$(checkbox).attr("name"), $(checkbox).val()]);
            } else {
                $(checkbox).prop("checked", false);
            }
        });
        if (candidates.length > 0) {
            let request = {};
            request["id"] = id;
            request["pass"] = pass;
            request["mode"] = "USE";
            request["chara"] = "1";
            for (let i = 0; i < candidates.length; i++) {
                request[candidates[i][0]] = candidates[i][1];
            }
            $.post("mydata.cgi", request, function (html) {
                $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                $("form[action='status.cgi']").attr("action", "mydata.cgi");
                $("#returnButton").trigger("click");
            });
        }
    });
    $("#prepareChocolateSet").click(function () {
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            "2015.02.14情人节巧克力", false,
            "2015.01.29十周年纪念", false,
            "2015.02.14情人节玫瑰", false);
    });
    $("#useChocolateSet").click(function () {
        ____use_equipment_set(id, pass,
            "2015.02.14情人节巧克力", false,
            "2015.01.29十周年纪念", false,
            "2015.02.14情人节玫瑰", false);
    });
    $("#prepareSetA").click(function () {
        let set = __cookie_getEquipmentSet("A", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetA").click(function () {
        let set = __cookie_getEquipmentSet("A", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetB").click(function () {
        let set = __cookie_getEquipmentSet("B", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetB").click(function () {
        let set = __cookie_getEquipmentSet("B", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetC").click(function () {
        let set = __cookie_getEquipmentSet("C", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetC").click(function () {
        let set = __cookie_getEquipmentSet("C", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetD").click(function () {
        let set = __cookie_getEquipmentSet("D", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetD").click(function () {
        let set = __cookie_getEquipmentSet("D", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#prepareSetE").click(function () {
        let set = __cookie_getEquipmentSet("E", id);
        __personalStatus_equipment_prepareItems(
            id, pass, treasureBagIndex,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
    $("#useSetE").click(function () {
        let set = __cookie_getEquipmentSet("E", id);
        ____use_equipment_set(
            id, pass,
            set[0], set[1] !== "0",
            set[2], set[3] !== "0",
            set[4], set[5] !== "0");
    });
}

function ____format_set_text(no, id) {
    let set = __cookie_getEquipmentSet(no, id);
    let text = "";
    if (set[0] === "NONE") {
        text += "无";
    } else {
        if (set[1] !== "0") {
            text += "齐心★";
        }
        text += set[0];
    }
    text += "/";
    if (set[2] === "NONE") {
        text += "无";
    } else {
        if (set[3] !== "0") {
            text += "齐心★";
        }
        text += set[2];
    }
    text += "/";
    if (set[4] === "NONE") {
        text += "无";
    } else {
        if (set[5] !== "0") {
            text += "齐心★";
        }
        text += set[4];
    }
    return "[" + text + "]";
}

function __personalStatus_equipment_prepareItems(id, pass, treasureBagIndex,
                                                 weaponName, weaponStar,
                                                 armorName, armorStar,
                                                 accessoryName, accessoryStar) {
    let weaponNameForUse = weaponName;
    if (weaponStar) {
        weaponNameForUse = "齐心★" + weaponNameForUse;
    }
    let armorNameForUse = armorName;
    if (armorStar) {
        armorNameForUse = "齐心★" + armorNameForUse;
    }
    let accessoryNameForUse = accessoryName;
    if (accessoryStar) {
        accessoryNameForUse = "齐心★" + accessoryNameForUse;
    }

    let weaponFound = false;
    let armorFound = false;
    let accessoryFound = false;
    $("input:checkbox").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        if (category === "武器" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
            weaponFound = true;
        }
        if (category === "防具" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
            armorFound = true;
        }
        if (category === "饰品" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
            accessoryFound = true;
        }
    });
    if ((!weaponFound || !armorFound || !accessoryFound) && treasureBagIndex >= 0) {
        __ajax_openTreasureBag(id, pass, treasureBagIndex, function (id, pass, html) {
            let weaponIndex = -1;
            let armorIndex = -1;
            let accessoryIndex = -1;
            $(html).find("input:checkbox").each(function (_idx, checkbox) {
                let name = $(checkbox).parent().next().text();
                let category = $(checkbox).parent().next().next().text();
                if (!weaponFound && category === "武器" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
                    weaponIndex = $(checkbox).val();
                    weaponFound = true;
                }
                if (!armorFound && category === "防具" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
                    armorIndex = $(checkbox).val();
                    armorFound = true;
                }
                if (!accessoryFound && category === "饰品" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
                    accessoryIndex = $(checkbox).val();
                    accessoryFound = true;
                }
            });
            if (weaponIndex >= 0 || armorIndex >= 0 || accessoryIndex >= 0) {
                let takeFromBagRequest = {};
                takeFromBagRequest["id"] = id;
                takeFromBagRequest["pass"] = pass;
                takeFromBagRequest["mode"] = "GETOUTBAG";
                if (weaponIndex >= 0) {
                    takeFromBagRequest["item" + weaponIndex] = weaponIndex;
                }
                if (armorIndex >= 0) {
                    takeFromBagRequest["item" + armorIndex] = armorIndex;
                }
                if (accessoryIndex >= 0) {
                    takeFromBagRequest["item" + accessoryIndex] = accessoryIndex;
                }
                $.post("mydata.cgi", takeFromBagRequest, function (html) {
                    $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
                    $("form[action='status.cgi']").attr("action", "mydata.cgi");
                    $("#returnButton").trigger("click");
                });
            }
        });
    }
}

/**
 * 装备指定的套装
 * @param id ID
 * @param pass PASS
 * @param weaponName 武器名
 * @param weaponStar 是否齐心武器
 * @param armorName 防具名
 * @param armorStar 是否齐心防具
 * @param accessoryName 饰品名
 * @param accessoryStar 是否齐心饰品
 * @private
 */
function ____use_equipment_set(id, pass,
                               weaponName, weaponStar,
                               armorName, armorStar,
                               accessoryName, accessoryStar) {
    let weaponNameForUse = weaponName;
    if (weaponStar) {
        weaponNameForUse = "齐心★" + weaponNameForUse;
    }
    let armorNameForUse = armorName;
    if (armorStar) {
        armorNameForUse = "齐心★" + armorNameForUse;
    }
    let accessoryNameForUse = accessoryName;
    if (accessoryStar) {
        accessoryNameForUse = "齐心★" + accessoryNameForUse;
    }
    let weaponIndex = -1;
    let armorIndex = -1;
    let accessoryIndex = -1;
    $("input:checkbox").each(function (_idx, checkbox) {
        let name = $(checkbox).parent().next().next().text();
        let category = $(checkbox).parent().next().next().next().text();
        let using = $(checkbox).parent().next().text();
        if (category === "武器" && using !== "★" && (weaponNameForUse === name || "[满]" + weaponNameForUse === name)) {
            weaponIndex = $(checkbox).val();
        }
        if (category === "防具" && using !== "★" && (armorNameForUse === name || "[满]" + armorNameForUse === name)) {
            armorIndex = $(checkbox).val();
        }
        if (category === "饰品" && using !== "★" && (accessoryNameForUse === name || "[满]" + accessoryNameForUse === name)) {
            accessoryIndex = $(checkbox).val();
        }
    });
    if (weaponIndex >= 0 || armorIndex >= 0 || accessoryIndex >= 0) {
        let request = {};
        request["id"] = id;
        request["pass"] = pass;
        request["chara"] = "1";
        request["mode"] = "USE"
        if (weaponIndex >= 0) {
            request["item" + weaponIndex] = weaponIndex;
        }
        if (armorIndex >= 0) {
            request["item" + armorIndex] = armorIndex;
        }
        if (accessoryIndex >= 0) {
            request["item" + accessoryIndex] = accessoryIndex;
        }
        $.post("mydata.cgi", request, function (html) {
            $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
            $("form[action='status.cgi']").attr("action", "mydata.cgi");
            $("#returnButton").trigger("click");
        });
    }
}

/**
 * 百宝袋的界面的增强实现。
 * @param htmlText 原始HTML文本
 * @private
 */
function __personalStatus_treasureBag(htmlText) {
    $("input[type='checkbox']").each(function (_idx, input) {
        let td = $(input).parent();
        let name = $(td).next().text();
        let category = $(td).next().next().text();
        let power = $(td).next().next().next().text();
        let exp = $(td).next().next().next().next().next().next().next().next().next().text();
        if (category === "武器" || category === "防具" || category === "饰品") {
            if (__utilities_checkIfEquipmentFullExperience(name, power, exp)) {
                let nameHtml = $(td).next().html();
                nameHtml = "<font color='red'><b>[满]</b></font>" + nameHtml;
                $(td).next().html(nameHtml);
            }
        }
        if (category === "物品" && name.indexOf("藏宝图") !== -1) {
            let x = power;
            let y = $(td).next().next().next().next().text();
            if (isUnavailableTreasureHintMap(parseInt(x), parseInt(y))) {
                let nameHtml = $(td).next().html();
                nameHtml = "<font color='red'><b>[城]</b></font>" + nameHtml;
                $(td).next().html(nameHtml);
            }
        }
    });
}


// 个人状态 -> 转职
function __personalStatus_transferCareer(htmlText) {
    __page_constructNpcMessageTable("白皇");
    __page_writeNpcMessage("是的，你没有看错，换人了，某幕后黑手不愿意出镜。不过请放心，转职方面我是专业的，毕竟我一直制霸钉耙榜。<br>");

    $('input[value="转职"]').attr('id', 'transferCareerButton');

    let lastTargetCareer = "";
    $("option[value!='']").each(function (_idx, option) {
        lastTargetCareer = $(option).attr("value");
    });

    if (lastTargetCareer === "") {
        __page_writeNpcMessage("我的天，你甚至连最基础的转职条件都没有满足，那你来这么干什么？我不愿意说粗口，所以我无话可说了，你走吧。<br>");
        return;
    }

    let level = $($($("table")[4]).find("td")[7]).text();
    if (level < 150) {
        __page_writeNpcMessage("从专业的角度来说，你现在并没有满级，我并不推荐你现在就转职。当然你如果强行要这么做的话，我也不说啥。<br>");
        return;
    }

    let id = __page_readIdFromCurrentPage();
    let pass = __page_readPassFromCurrentPage();
    // 进入转职页面的时候，读取一下个人信息。把标准的HP/MP和五围读出来
    __ajax_readPersonalInformation(id, pass, function (information) {
        var mhp = information["MAX_HP"];
        var mmp = information["MAX_MP"];
        var at = information["AT"];
        var df = information["DF"];
        var sa = information["SA"];
        var sd = information["SD"];
        var sp = information["SP"];
        var stableCareer = (mhp == 1999 && mmp >= 1000
            && at >= 300 && df >= 300 && sa >= 300 && sd >= 300 && sp >= 300);

        if (stableCareer) {
            // 看起来这能力已经可以定型了，给个警告吧，确认是否要转职！
            var current = information["HP"] + "/" + mhp + " " + information["MP"] + "/" + mmp + " " + at + " " + df + " " + sa + " " + sd + " " + sp;
            $('#transferCareerButton').attr('value', '看起来你现在满足了最低的定型标准(' + current + ')，你确认要转职吗？');
        }

        // 是否需要给个转职建议呢？
        var recommendationCareers = [];
        var careers = Object.keys(transferCareerRequirementDict);
        for (var careerIndex = 0; careerIndex < careers.length; careerIndex++) {
            var career = careers[careerIndex];
            var requirement = transferCareerRequirementDict[career];
            if (mmp >= requirement[0] && at >= requirement[1] && df >= requirement[2] &&
                sa >= requirement[3] && sd >= requirement[4] && sp >= requirement[5]) {
                // 发现了可以推荐的职业
                recommendationCareers.push(career);
            }
        }

        let autoSuggest = false;
        let message = "";
        if (recommendationCareers.length > 0) {
            message += "我觉得你可以尝试一下这些新职业：";
            for (let ci = 0; ci < recommendationCareers.length; ci++) {
                message += "<b>" + recommendationCareers[ci] + "</b> "
            }
            message += " 当然，看脸时代的转职成功率你应该心中有数。";
        } else {
            autoSuggest = true;
            message += "不过说实话，你现在的能力，确实爱转啥就转啥吧，区别不大。";
        }
        message += "<br>"
        __page_writeNpcMessage(message);

        if (autoSuggest) {
            let targetCareer = "";
            let careerNames = Object.keys(_CAREER_DICT);
            for (let ci = 0; ci < careerNames.length; ci++) {
                let careerName = careerNames[ci];
                let career = _CAREER_DICT[careerName];
                if (career["id"] == lastTargetCareer) {
                    targetCareer = careerName;
                }
            }
            if (targetCareer !== "") {
                __page_writeNpcMessage("嗯，还有另外一种选择，继续转职<b>" + targetCareer + "</b>，如何？" +
                    "<b>[<a href='javascript:void(0)' id='toTopCareer'>我听你的就转职" + targetCareer + "</a>]</b>");
                $("#toTopCareer").click(function () {
                    $("option").each(function (_i, o) {
                        let optionValue = $(o).attr("value");
                        if (optionValue != lastTargetCareer) {
                            $(o).prop("selected", false);
                        } else {
                            $(o).prop("selected", true);
                        }
                    });
                    $("input[type='radio']").prop("checked", true);
                    __ajax_lodgeAtInn(information["id"], information["pass"], function (data) {
                        // 转职前住宿，保持最佳状态
                        $("#transferCareerButton").trigger("click");
                    });
                });
            }
        }
    });
}