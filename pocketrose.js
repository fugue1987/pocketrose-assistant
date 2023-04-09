// ==UserScript==
// @name         pocketrose assistant
// @namespace    https://pocketrose.itsns.net.cn/
// @description  Intercepts and modifies pocketrose CGI requests
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      mit
// @author       xiaohaiz,fugue
// @version      1.4.4
// @grant        unsafeWindow
// @match        *://pocketrose.itsns.net.cn/*
// @require      https://code.jquery.com/jquery-2.1.4.min.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js
// @run-at       document-start
// @unwrap
// ==/UserScript==

// ============================================================================
// 口 袋 助 手 郑 重 承 诺
// ----------------------------------------------------------------------------
// 所有验证码破解的相关领域都设立为禁区，我们绝对不触碰验证码破解！
// ============================================================================

const POCKETROSE_DOMAIN = "https://pocketrose.itsns.net.cn/pocketrose";

const returnButtonText = "少年輕輕的離開，沒有帶走一片雲彩！";
const bankButtonText = "順風不浪，逆風不慫，身上不要放太多的錢！";
const blacksmithButtonText = "去修理下裝備吧，等爆掉的時候你就知道痛了！";
const innButtonText = "你看起來很疲憊的樣子呀，媽媽喊你回去休息啦！";
const depositEveryBattleTimes = 5;                                          // 定期存钱的战数，设置为0表示关闭此功能

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

const _PROHIBIT_SELLING_ITEM_DICT = ["千与千寻", "勿忘我", "双经斩"];

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
        "x": 0,
        "y": 0
    },
    "2": {
        "name": "翡冷翠",
        "description": "",
        "x": 0,
        "y": 0
    },
    "3": {
        "name": "诺曼",
        "description": "",
        "x": 0,
        "y": 0
    },
    "4": {
        "name": "潘帕斯",
        "description": "",
        "x": 0,
        "y": 0
    },
    "5": {
        "name": "卡鲁",
        "description": "",
        "x": 0,
        "y": 0
    },
    "6": {
        "name": "格林尼治",
        "description": "",
        "x": 0,
        "y": 0
    },
    "7": {
        "name": "萨拉镇",
        "description": "",
        "x": 0,
        "y": 0
    },
    "8": {
        "name": "海文",
        "description": "矮人族连接山区和草原的重要中转站，春季会在附近原野举行大型交易会，是无论什么种族也会受到平等接待的地方。",
        "x": 0,
        "y": 0
    },
    "9": {
        "name": "黄昏之都",
        "description": "",
        "x": 0,
        "y": 0
    },
    "10": {
        "name": "圣克鲁斯堡",
        "description": "",
        "x": 0,
        "y": 0
    },
    "11": {
        "name": "泰法城",
        "description": "",
        "x": 0,
        "y": 0
    },
    "12": {
        "name": "枫丹",
        "description": "原帝国冬都，又名白露城，号称四百年无战之都。大陆联合商会所在地，无数传说的源头，号称大冒险大恋爱的起点。",
        "x": 0,
        "y": 0
    },
    "13": {
        "name": "自由港_赞特",
        "description": "",
        "x": 0,
        "y": 0
    },
    "14": {
        "name": "火之都",
        "description": "",
        "x": 0,
        "y": 0
    },
    "15": {
        "name": "土之域",
        "description": "",
        "x": 0,
        "y": 0
    },
    "16": {
        "name": "瓦伦要塞",
        "description": "",
        "x": 0,
        "y": 0
    },
    "17": {
        "name": "梵",
        "description": "",
        "x": 0,
        "y": 0
    },
    "18": {
        "name": "日尔曼尼亚",
        "description": "",
        "x": 0,
        "y": 0
    },
    "19": {
        "name": "水之城",
        "description": "",
        "x": 0,
        "y": 0
    },
    "20": {
        "name": "埃达",
        "description": "",
        "x": 0,
        "y": 0
    },
    "21": {
        "name": "柯利亚",
        "description": "",
        "x": 0,
        "y": 0
    },
    "22": {
        "name": "格兰特",
        "description": "",
        "x": 0,
        "y": 0
    },
    "23": {
        "name": "斯坎",
        "description": "",
        "x": 0,
        "y": 0
    },
    "24": {
        "name": "龙牙堡",
        "description": "",
        "x": 0,
        "y": 0
    },
    "25": {
        "name": "海布里",
        "description": "半兽人 贝里萨利乌斯族生活的集落，是半兽人中最为勇猛、尚武的一支，如今正遭遇百年不遇的人口锐减，百年前曾和人类共同作战，据信村中仍有混血的后代，出产美酒，被誉为大陆第一的珍酿。",
        "x": 0,
        "y": 0
    },
    "26": {
        "name": "风之谷",
        "description": "",
        "x": 0,
        "y": 0
    },
    "27": {
        "name": "不归森林",
        "description": "",
        "x": 0,
        "y": 0
    },
    "28": {
        "name": "特罗尔",
        "description": "",
        "x": 0,
        "y": 0
    }
};

const _NPC_DICT = {
    '夜九年': {
        'image': POCKETROSE_DOMAIN + '/image/head/1561.gif',
        'intro': ''
    },
    '夜苍凉': {
        'image': POCKETROSE_DOMAIN + '/image/head/1117.gif',
        'intro': ''
    },
    '青鸟': {
        'image': POCKETROSE_DOMAIN + '/image/head/7184.gif',
        'intro': ''
    },
    '末末': {
        'image': POCKETROSE_DOMAIN + '/image/head/8173.gif',
        'intro': ''
    },
    '白皇': {
        'image': POCKETROSE_DOMAIN + '/image/head/11134.gif',
        'intro': ''
    },
    '七七': {
        'image': POCKETROSE_DOMAIN + '/image/head/1368.gif',
        'intro': ''
    }
};

const pokemonDict = {
    '大猩猩(289)': '<a href="https://wiki.52poke.com/wiki/%E8%AF%B7%E5%81%87%E7%8E%8B" target="_blank" rel="noopener noreferrer">请假王(289)</a>',
    '忍耐龙(202)': '<a href="https://wiki.52poke.com/wiki/%E6%9E%9C%E7%84%B6%E7%BF%81" target="_blank" rel="noopener noreferrer">果然翁(202)</a>',
    '雪拉比(251)': '<a href="https://wiki.52poke.com/wiki/%E6%97%B6%E6%8B%89%E6%AF%94" target="_blank" rel="noopener noreferrer">时拉比(251)</a>',
    '拉普拉斯(131)': '<a href="https://wiki.52poke.com/wiki/%E6%8B%89%E6%99%AE%E6%8B%89%E6%96%AF" target="_blank" rel="noopener noreferrer">拉普拉斯(131)</a>',
    '相扑兔(297)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E6%8E%8C%E5%8A%9B%E5%A3%AB" target="_blank" rel="noopener noreferrer">铁掌力士(297)</a>',
    '草刺猬(492)': '<a href="https://wiki.52poke.com/wiki/%E8%B0%A2%E7%B1%B3" target="_blank" rel="noopener noreferrer">谢米(492)</a>',
    '梦幻(151)': '<a href="https://wiki.52poke.com/wiki/%E6%A2%A6%E5%B9%BB" target="_blank" rel="noopener noreferrer">梦幻(151)</a>',
    '快乐(242)': '<a href="https://wiki.52poke.com/wiki/%E5%B9%B8%E7%A6%8F%E8%9B%8B" target="_blank" rel="noopener noreferrer">幸福蛋(242)</a>',
    '火焰鸟(146)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E7%84%B0%E9%B8%9F" target="_blank" rel="noopener noreferrer">火焰鸟(146)</a>',
    '路基亚(249)': '<a href="https://wiki.52poke.com/wiki/%E6%B4%9B%E5%A5%87%E4%BA%9A" target="_blank" rel="noopener noreferrer">洛奇亚(249)</a>',
    '大双灯鱼(171)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E7%81%AF%E6%80%AA" target="_blank" rel="noopener noreferrer">电灯怪(171)</a>',
    '胖可丁(040)': '<a href="https://wiki.52poke.com/wiki/%E8%83%96%E5%8F%AF%E4%B8%81" target="_blank" rel="noopener noreferrer">胖可丁(040)</a>',
    '圣灵兽(493)': '<a href="https://wiki.52poke.com/wiki/%E9%98%BF%E5%B0%94%E5%AE%99%E6%96%AF" target="_blank" rel="noopener noreferrer">阿尔宙斯(493)</a>',
    '暴地龙(445)': '<a href="https://wiki.52poke.com/wiki/%E7%83%88%E5%92%AC%E9%99%86%E9%B2%A8" target="_blank" rel="noopener noreferrer">烈咬陆鲨(445)</a>',
    '尼多后(031)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E5%90%8E" target="_blank" rel="noopener noreferrer">尼多后(031)</a>',
    '天空之龙(384)': '<a href="https://wiki.52poke.com/wiki/%E7%83%88%E7%A9%BA%E5%9D%90" target="_blank" rel="noopener noreferrer">烈空坐(384)</a>',
    '鲸鱼王(321)': '<a href="https://wiki.52poke.com/wiki/%E5%90%BC%E9%B2%B8%E7%8E%8B" target="_blank" rel="noopener noreferrer">吼鲸王(321)</a>',
    '吉利蛋(113)': '<a href="https://wiki.52poke.com/wiki/%E5%90%89%E5%88%A9%E8%9B%8B" target="_blank" rel="noopener noreferrer">吉利蛋(113)</a>',
    '凤凰(250)': '<a href="https://wiki.52poke.com/wiki/%E5%87%A4%E7%8E%8B" target="_blank" rel="noopener noreferrer">凤王(250)</a>',
    '血翼飞龙(373)': '<a href="https://wiki.52poke.com/wiki/%E6%9A%B4%E9%A3%9E%E9%BE%99" target="_blank" rel="noopener noreferrer">暴飞龙(373)</a>',
    '电龙(181)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E9%BE%99" target="_blank" rel="noopener noreferrer">电龙(181)</a>',
    '恶毒釉(435)': '<a href="https://wiki.52poke.com/wiki/%E5%9D%A6%E5%85%8B%E8%87%AD%E9%BC%AC" target="_blank" rel="noopener noreferrer">坦克臭鼬(435)</a>',
    '巨头冰怪(362)': '<a href="https://wiki.52poke.com/wiki/%E5%86%B0%E9%AC%BC%E6%8A%A4" target="_blank" rel="noopener noreferrer">冰鬼护(362)</a>',
    '肥波鲸(320)': '<a href="https://wiki.52poke.com/wiki/%E5%90%BC%E5%90%BC%E9%B2%B8" target="_blank" rel="noopener noreferrer">吼吼鲸(320)</a>',
    '蓝圣菇(482)': '<a href="https://wiki.52poke.com/wiki/%E4%BA%9A%E5%85%8B%E8%AF%BA%E5%A7%86" target="_blank" rel="noopener noreferrer">亚克诺姆(482)</a>',
    '岩浆巨兽(485)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%AD%E5%A4%9A%E8%93%9D%E6%81%A9" target="_blank" rel="noopener noreferrer">席多蓝恩(485)</a>',
    '针叶王(254)': '<a href="https://wiki.52poke.com/wiki/%E8%9C%A5%E8%9C%B4%E7%8E%8B" target="_blank" rel="noopener noreferrer">蜥蜴王(254)</a>',
    '热带雷龙(357)': '<a href="https://wiki.52poke.com/wiki/%E7%83%AD%E5%B8%A6%E9%BE%99" target="_blank" rel="noopener noreferrer">热带龙(357)</a>',
    '拉迪奥斯(381)': '<a href="https://wiki.52poke.com/wiki/%E6%8B%89%E5%B8%9D%E6%AC%A7%E6%96%AF" target="_blank" rel="noopener noreferrer">拉帝欧斯(381)</a>',
    '双翼蝙蝠(169)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%89%E5%AD%97%E8%9D%A0" target="_blank" rel="noopener noreferrer">叉字蝠(169)</a>',
    '夜鹰(164)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%AB%E5%A4%B4%E5%A4%9C%E9%B9%B0" target="_blank" rel="noopener noreferrer">猫头夜鹰(164)</a>',
    '呆呆嵘(195)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%BC%E7%8E%8B" target="_blank" rel="noopener noreferrer">沼王(195)</a>',
    '玛娜菲(490)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E7%BA%B3%E9%9C%8F" target="_blank" rel="noopener noreferrer">玛纳霏(490)</a>',
    '迪奥鲁加(483)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%9D%E7%89%99%E5%8D%A2%E5%8D%A1" target="_blank" rel="noopener noreferrer">帝牙卢卡(483)</a>',
    '吞食王(317)': '<a href="https://wiki.52poke.com/wiki/%E5%90%9E%E9%A3%9F%E5%85%BD" target="_blank" rel="noopener noreferrer">吞食兽(317)</a>',
    '铁甲暴龙(112)': '<a href="https://wiki.52poke.com/wiki/%E9%92%BB%E8%A7%92%E7%8A%80%E5%85%BD" target="_blank" rel="noopener noreferrer">钻角犀兽(112)</a>',
    '风速狗(059)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%8E%E9%80%9F%E7%8B%97" target="_blank" rel="noopener noreferrer">风速狗(059)</a>',
    '拉巴飞龙(330)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%99%E6%BC%A0%E8%9C%BB%E8%9C%93" target="_blank" rel="noopener noreferrer">沙漠蜻蜓(330)</a>',
    '臭臭泥(089)': '<a href="https://wiki.52poke.com/wiki/%E8%87%AD%E8%87%AD%E6%B3%A5" target="_blank" rel="noopener noreferrer">臭臭泥(089)</a>',
    '水狗王(260)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E6%B2%BC%E6%80%AA" target="_blank" rel="noopener noreferrer">巨沼怪(260)</a>',
    '超梦(150)': '<a href="https://wiki.52poke.com/wiki/%E8%B6%85%E6%A2%A6" target="_blank" rel="noopener noreferrer">超梦(150)</a>',
    '帕鲁其亚(484)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%95%E8%B7%AF%E5%A5%87%E4%BA%9A" target="_blank" rel="noopener noreferrer">帕路奇亚(484)</a>',
    '雷鸣狮(405)': '<a href="https://wiki.52poke.com/wiki/%E4%BC%A6%E7%90%B4%E7%8C%AB" target="_blank" rel="noopener noreferrer">伦琴猫(405)</a>',
    '水箭龟(009)': '<a href="https://wiki.52poke.com/wiki/%E6%B0%B4%E7%AE%AD%E9%BE%9F" target="_blank" rel="noopener noreferrer">水箭龟(009)</a>',
    '电气狗(310)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E7%94%B5%E5%85%BD" target="_blank" rel="noopener noreferrer">雷电兽(310)</a>',
    '幽灵气球(426)': '<a href="https://wiki.52poke.com/wiki/%E9%9A%8F%E9%A3%8E%E7%90%83" target="_blank" rel="noopener noreferrer">随风球(426)</a>',
    '月映兽(385)': '<a href="https://wiki.52poke.com/wiki/%E5%9F%BA%E6%8B%89%E7%A5%88" target="_blank" rel="noopener noreferrer">基拉祈(385)</a>',
    '尼多王(034)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E7%8E%8B" target="_blank" rel="noopener noreferrer">尼多王(034)</a>',
    '怪力(068)': '<a href="https://wiki.52poke.com/wiki/%E6%80%AA%E5%8A%9B" target="_blank" rel="noopener noreferrer">怪力(068)</a>',
    '胡地(065)': '<a href="https://wiki.52poke.com/wiki/%E8%83%A1%E5%9C%B0" target="_blank" rel="noopener noreferrer">胡地(065)</a>',
    '布比猪(326)': '<a href="https://wiki.52poke.com/wiki/%E5%99%97%E5%99%97%E7%8C%AA" target="_blank" rel="noopener noreferrer">噗噗猪(326)</a>',
    '末入蛾(049)': '<a href="https://wiki.52poke.com/wiki/%E6%91%A9%E9%B2%81%E8%9B%BE" target="_blank" rel="noopener noreferrer">摩鲁蛾(049)</a>',
    '水狼(245)': '<a href="https://wiki.52poke.com/wiki/%E6%B0%B4%E5%90%9B" target="_blank" rel="noopener noreferrer">水君(245)</a>',
    '喷火龙(006)': '<a href="https://wiki.52poke.com/wiki/%E5%96%B7%E7%81%AB%E9%BE%99" target="_blank" rel="noopener noreferrer">喷火龙(006)</a>',
    '快龙(149)': '<a href="https://wiki.52poke.com/wiki/%E5%BF%AB%E9%BE%99" target="_blank" rel="noopener noreferrer">快龙(149)</a>',
    '钢神柱(379)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E5%90%89%E6%96%AF%E5%A5%87%E9%B2%81" target="_blank" rel="noopener noreferrer">雷吉斯奇鲁(379)</a>',
    '地壳龟(389)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%9F%E5%8F%B0%E9%BE%9F" target="_blank" rel="noopener noreferrer">土台龟(389)</a>',
    '噪音王(295)': '<a href="https://wiki.52poke.com/wiki/%E7%88%86%E9%9F%B3%E6%80%AA" target="_blank" rel="noopener noreferrer">爆音怪(295)</a>',
    '巴大蝴(012)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%B4%E5%A4%A7%E8%9D%B6" target="_blank" rel="noopener noreferrer">巴大蝶(012)</a>',
    '獠牙猪(473)': '<a href="https://wiki.52poke.com/wiki/%E8%B1%A1%E7%89%99%E7%8C%AA" target="_blank" rel="noopener noreferrer">象牙猪(473)</a>',
    '爆风兽(157)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E6%9A%B4%E5%85%BD" target="_blank" rel="noopener noreferrer">火暴兽(157)</a>',
    '闪电鸟(145)': '<a href="https://wiki.52poke.com/wiki/%E9%97%AA%E7%94%B5%E9%B8%9F" target="_blank" rel="noopener noreferrer">闪电鸟(145)</a>',
    '肯泰罗(128)': '<a href="https://wiki.52poke.com/wiki/%E8%82%AF%E6%B3%B0%E7%BD%97" target="_blank" rel="noopener noreferrer">肯泰罗(128)</a>',
    '鸭嘴火龙(126)': '<a href="https://wiki.52poke.com/wiki/%E9%B8%AD%E5%98%B4%E7%81%AB%E5%85%BD" target="_blank" rel="noopener noreferrer">鸭嘴火兽(126)</a>',
    '大嘴蝠(042)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%98%B4%E8%9D%A0" target="_blank" rel="noopener noreferrer">大嘴蝠(042)</a>',
    '冷冻鸟(144)': '<a href="https://wiki.52poke.com/wiki/%E6%80%A5%E5%86%BB%E9%B8%9F" target="_blank" rel="noopener noreferrer">急冻鸟(144)</a>',
    '比雕(018)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E6%AF%94%E9%B8%9F" target="_blank" rel="noopener noreferrer">大比鸟(018)</a>',
    '吸管蝶(267)': '<a href="https://wiki.52poke.com/wiki/%E7%8B%A9%E7%8C%8E%E5%87%A4%E8%9D%B6" target="_blank" rel="noopener noreferrer">狩猎凤蝶(267)</a>',
    '塔斯仙人掌(332)': '<a href="https://wiki.52poke.com/wiki/%E6%A2%A6%E6%AD%8C%E4%BB%99%E4%BA%BA%E6%8E%8C" target="_blank" rel="noopener noreferrer">梦歌仙人掌(332)</a>',
    '3D龙2(233)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%9A%E8%BE%B9%E5%85%BD%E2%85%A1" target="_blank" rel="noopener noreferrer">多边兽2型(233)</a>',
    '巨鸟(227)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%94%E7%94%B2%E9%B8%9F" target="_blank" rel="noopener noreferrer">盔甲鸟(227)</a>',
    '美丽龙(350)': '<a href="https://wiki.52poke.com/wiki/%E7%BE%8E%E7%BA%B3%E6%96%AF" target="_blank" rel="noopener noreferrer">美纳斯(350)</a>',
    '鸭嘴炎龙(467)': '<a href="https://wiki.52poke.com/wiki/%E9%B8%AD%E5%98%B4%E7%82%8E%E5%85%BD" target="_blank" rel="noopener noreferrer">鸭嘴炎兽(467)</a>',
    '烈焰马(078)': '<a href="https://wiki.52poke.com/wiki/%E7%83%88%E7%84%B0%E9%A9%AC" target="_blank" rel="noopener noreferrer">烈焰马(078)</a>',
    '海马龙(230)': '<a href="https://wiki.52poke.com/wiki/%E5%88%BA%E9%BE%99%E7%8E%8B" target="_blank" rel="noopener noreferrer">刺龙王(230)</a>',
    '超能女皇(282)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%99%E5%A5%88%E6%9C%B5" target="_blank" rel="noopener noreferrer">沙奈朵(282)</a>',
    '熔岩乌龟(324)': '<a href="https://wiki.52poke.com/wiki/%E7%85%A4%E7%82%AD%E9%BE%9F" target="_blank" rel="noopener noreferrer">煤炭龟(324)</a>',
    '雷精灵(135)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">雷伊布(135)</a>',
    '小甲龙(247)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%99%E5%9F%BA%E6%8B%89%E6%96%AF" target="_blank" rel="noopener noreferrer">沙基拉斯(247)</a>',
    '阿美蝶(284)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%A8%E7%BF%85%E8%9B%BE" target="_blank" rel="noopener noreferrer">雨翅蛾(284)</a>',
    '小黑兔(197)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%88%E4%BA%AE%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">月亮伊布(197)</a>',
    '大丹鳄(160)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%8A%9B%E9%B3%84" target="_blank" rel="noopener noreferrer">大力鳄(160)</a>',
    '三合一土偶(344)': '<a href="https://wiki.52poke.com/wiki/%E5%BF%B5%E5%8A%9B%E5%9C%9F%E5%81%B6" target="_blank" rel="noopener noreferrer">念力土偶(344)</a>',
    '尼多利诺(033)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E5%8A%9B%E8%AF%BA" target="_blank" rel="noopener noreferrer">尼多力诺(033)</a>',
    '电松鼠(417)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%95%E5%A5%87%E5%88%A9%E5%85%B9" target="_blank" rel="noopener noreferrer">帕奇利兹(417)</a>',
    '拉达(020)': '<a href="https://wiki.52poke.com/wiki/%E6%8B%89%E8%BE%BE" target="_blank" rel="noopener noreferrer">拉达(020)</a>',
    '小臭釉(264)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%B4%E5%86%B2%E7%86%8A" target="_blank" rel="noopener noreferrer">直冲熊(264)</a>',
    '铁甲贝(091)': '<a href="https://wiki.52poke.com/wiki/%E5%88%BA%E7%94%B2%E8%B4%9D" target="_blank" rel="noopener noreferrer">刺甲贝(091)</a>',
    '九尾(038)': '<a href="https://wiki.52poke.com/wiki/%E4%B9%9D%E5%B0%BE" target="_blank" rel="noopener noreferrer">九尾(038)</a>',
    '波克鸟(468)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E5%85%8B%E5%9F%BA%E6%96%AF" target="_blank" rel="noopener noreferrer">波克基斯(468)</a>',
    '派拉斯特(047)': '<a href="https://wiki.52poke.com/wiki/%E6%B4%BE%E6%8B%89%E6%96%AF%E7%89%B9" target="_blank" rel="noopener noreferrer">派拉斯特(047)</a>',
    '骗人树(185)': '<a href="https://wiki.52poke.com/wiki/%E6%A0%91%E6%89%8D%E6%80%AA" target="_blank" rel="noopener noreferrer">树才怪(185)</a>',
    '毒蟾王(454)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%92%E9%AA%B7%E8%9B%99" target="_blank" rel="noopener noreferrer">毒骷蛙(454)</a>',
    '素利柏(097)': '<a href="https://wiki.52poke.com/wiki/%E5%BC%95%E6%A2%A6%E8%B2%98%E4%BA%BA" target="_blank" rel="noopener noreferrer">引梦貘人(097)</a>',
    '巨花兽(154)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E7%AB%BA%E8%91%B5" target="_blank" rel="noopener noreferrer">大竺葵(154)</a>',
    '拳击兔(296)': '<a href="https://wiki.52poke.com/wiki/%E5%B9%95%E4%B8%8B%E5%8A%9B%E5%A3%AB" target="_blank" rel="noopener noreferrer">幕下力士(296)</a>',
    '沙河马(450)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%B3%E9%A9%AC%E5%85%BD" target="_blank" rel="noopener noreferrer">河马兽(450)</a>',
    '巨大甲龙(248)': '<a href="https://wiki.52poke.com/wiki/%E7%8F%AD%E5%9F%BA%E6%8B%89%E6%96%AF" target="_blank" rel="noopener noreferrer">班基拉斯(248)</a>',
    '大针蜂(015)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E9%92%88%E8%9C%82" target="_blank" rel="noopener noreferrer">大针蜂(015)</a>',
    '钢钳龙虾(342)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E8%9E%AF%E9%BE%99%E8%99%BE" target="_blank" rel="noopener noreferrer">铁螯龙虾(342)</a>',
    '多刺菊石兽(139)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%9A%E5%88%BA%E8%8F%8A%E7%9F%B3%E5%85%BD" target="_blank" rel="noopener noreferrer">多刺菊石兽(139)</a>',
    '胖胖猫(432)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%9C%E6%96%BD%E5%96%B5" target="_blank" rel="noopener noreferrer">东施喵(432)</a>',
    '蜂女皇(416)': '<a href="https://wiki.52poke.com/wiki/%E8%9C%82%E5%A5%B3%E7%8E%8B" target="_blank" rel="noopener noreferrer">蜂女王(416)</a>',
    '蚊香蛙王(186)': '<a href="https://wiki.52poke.com/wiki/%E8%9A%8A%E9%A6%99%E8%9B%99%E7%9A%87" target="_blank" rel="noopener noreferrer">蚊香蛙皇(186)</a>',
    '耿鬼(094)': '<a href="https://wiki.52poke.com/wiki/%E8%80%BF%E9%AC%BC" target="_blank" rel="noopener noreferrer">耿鬼(094)</a>',
    '圆耳兔(294)': '<a href="https://wiki.52poke.com/wiki/%E5%90%BC%E7%88%86%E5%BC%B9" target="_blank" rel="noopener noreferrer">吼爆弹(294)</a>',
    '洞洞龟(213)': '<a href="https://wiki.52poke.com/wiki/%E5%A3%B6%E5%A3%B6" target="_blank" rel="noopener noreferrer">壶壶(213)</a>',
    '圈圈熊(217)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%88%E5%9C%88%E7%86%8A" target="_blank" rel="noopener noreferrer">圈圈熊(217)</a>',
    '荷叶鸭(272)': '<a href="https://wiki.52poke.com/wiki/%E4%B9%90%E5%A4%A9%E6%B2%B3%E7%AB%A5" target="_blank" rel="noopener noreferrer">乐天河童(272)</a>',
    '预言鸟(178)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A9%E7%84%B6%E9%B8%9F" target="_blank" rel="noopener noreferrer">天然鸟(178)</a>',
    '镰刀盔(141)': '<a href="https://wiki.52poke.com/wiki/%E9%95%B0%E5%88%80%E7%9B%94" target="_blank" rel="noopener noreferrer">镰刀盔(141)</a>',
    '皮卡丘(025)': '<a href="https://wiki.52poke.com/wiki/%E7%9A%AE%E5%8D%A1%E4%B8%98" target="_blank" rel="noopener noreferrer">皮卡丘(025)</a>',
    '恩神柱(486)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E5%90%89%E5%A5%87%E5%8D%A1%E6%96%AF" target="_blank" rel="noopener noreferrer">雷吉奇卡斯(486)</a>',
    '大布鲁(210)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%83%E9%B2%81%E7%9A%87" target="_blank" rel="noopener noreferrer">布鲁皇(210)</a>',
    '巨雪人(460)': '<a href="https://wiki.52poke.com/wiki/%E6%9A%B4%E9%9B%AA%E7%8E%8B" target="_blank" rel="noopener noreferrer">暴雪王(460)</a>',
    '芭蕾玫瑰(315)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%92%E8%94%B7%E8%96%87" target="_blank" rel="noopener noreferrer">毒蔷薇(315)</a>',
    '古拉海象(364)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%B7%E9%AD%94%E7%8B%AE" target="_blank" rel="noopener noreferrer">海魔狮(364)</a>',
    '大胖翁(397)': '<a href="https://wiki.52poke.com/wiki/%E5%A7%86%E5%85%8B%E9%B8%9F" target="_blank" rel="noopener noreferrer">姆克鸟(397)</a>',
    '顽皮蛋(101)': '<a href="https://wiki.52poke.com/wiki/%E9%A1%BD%E7%9A%AE%E9%9B%B7%E5%BC%B9" target="_blank" rel="noopener noreferrer">顽皮雷弹(101)</a>',
    '火山骆驼(323)': '<a href="https://wiki.52poke.com/wiki/%E5%96%B7%E7%81%AB%E9%A9%BC" target="_blank" rel="noopener noreferrer">喷火驼(323)</a>',
    '黄圣菇(480)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B1%E5%85%8B%E5%B8%8C" target="_blank" rel="noopener noreferrer">由克希(480)</a>',
    '宝石海星(121)': '<a href="https://wiki.52poke.com/wiki/%E5%AE%9D%E7%9F%B3%E6%B5%B7%E6%98%9F" target="_blank" rel="noopener noreferrer">宝石海星(121)</a>',
    '古拉顿(383)': '<a href="https://wiki.52poke.com/wiki/%E5%9B%BA%E6%8B%89%E5%A4%9A" target="_blank" rel="noopener noreferrer">固拉多(383)</a>',
    '黑乃伊(356)': '<a href="https://wiki.52poke.com/wiki/%E5%BD%B7%E5%BE%A8%E5%A4%9C%E7%81%B5" target="_blank" rel="noopener noreferrer">彷徨夜灵(356)</a>',
    '大独角蛛(168)': '<a href="https://wiki.52poke.com/wiki/%E9%98%BF%E5%88%A9%E5%A4%9A%E6%96%AF" target="_blank" rel="noopener noreferrer">阿利多斯(168)</a>',
    '钢甲暴龙(306)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E5%A3%AB%E5%8F%AF%E5%A4%9A%E6%8B%89" target="_blank" rel="noopener noreferrer">波士可多拉(306)</a>',
    '蚊香蛙(061)': '<a href="https://wiki.52poke.com/wiki/%E8%9A%8A%E9%A6%99%E5%90%9B" target="_blank" rel="noopener noreferrer">蚊香君(061)</a>',
    '万花蔷薇(407)': '<a href="https://wiki.52poke.com/wiki/%E7%BD%97%E4%B8%9D%E9%9B%B7%E6%9C%B5" target="_blank" rel="noopener noreferrer">罗丝雷朵(407)</a>',
    '暗裂魔(491)': '<a href="https://wiki.52poke.com/wiki/%E8%BE%BE%E5%85%8B%E8%8E%B1%E4%BC%8A" target="_blank" rel="noopener noreferrer">达克莱伊(491)</a>',
    '链嘴幽魂(354)': '<a href="https://wiki.52poke.com/wiki/%E8%AF%85%E5%92%92%E5%A8%83%E5%A8%83" target="_blank" rel="noopener noreferrer">诅咒娃娃(354)</a>',
    '豪火猴(392)': '<a href="https://wiki.52poke.com/wiki/%E7%83%88%E7%84%B0%E7%8C%B4" target="_blank" rel="noopener noreferrer">烈焰猴(392)</a>',
    '芝麻象(231)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E5%B0%8F%E8%B1%A1" target="_blank" rel="noopener noreferrer">小小象(231)</a>',
    '碧云龙(334)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%83%E5%A4%95%E9%9D%92%E9%B8%9F" target="_blank" rel="noopener noreferrer">七夕青鸟(334)</a>',
    '小忍耐龙(360)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E6%9E%9C%E7%84%B6" target="_blank" rel="noopener noreferrer">小果然(360)</a>',
    '鬼斯通(093)': '<a href="https://wiki.52poke.com/wiki/%E9%AC%BC%E6%96%AF%E9%80%9A" target="_blank" rel="noopener noreferrer">鬼斯通(093)</a>',
    '双弹瓦斯(110)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%8C%E5%BC%B9%E7%93%A6%E6%96%AF" target="_blank" rel="noopener noreferrer">双弹瓦斯(110)</a>',
    '钢牙龙(208)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E9%92%A2%E8%9B%87" target="_blank" rel="noopener noreferrer">大钢蛇(208)</a>',
    '黑面雪狐(359)': '<a href="https://wiki.52poke.com/wiki/%E9%98%BF%E5%8B%83%E6%A2%AD%E9%B2%81" target="_blank" rel="noopener noreferrer">阿勃梭鲁(359)</a>',
    '雷虎(243)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E5%85%AC" target="_blank" rel="noopener noreferrer">雷公(243)</a>',
    '丘雷姆(308)': '<a href="https://wiki.52poke.com/wiki/%E6%81%B0%E9%9B%B7%E5%A7%86" target="_blank" rel="noopener noreferrer">恰雷姆(308)</a>',
    '蓝风铃(358)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%8E%E9%93%83%E9%93%83" target="_blank" rel="noopener noreferrer">风铃铃(358)</a>',
    '熔岩兽(156)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E5%B2%A9%E9%BC%A0" target="_blank" rel="noopener noreferrer">火岩鼠(156)</a>',
    '阿柏怪(024)': '<a href="https://wiki.52poke.com/wiki/%E9%98%BF%E6%9F%8F%E6%80%AA" target="_blank" rel="noopener noreferrer">阿柏怪(024)</a>',
    '红牙响尾蛇(336)': '<a href="https://wiki.52poke.com/wiki/%E9%A5%AD%E5%8C%99%E8%9B%87" target="_blank" rel="noopener noreferrer">饭匙蛇(336)</a>',
    '凯诺战士(286)': '<a href="https://wiki.52poke.com/wiki/%E6%96%97%E7%AC%A0%E8%8F%87" target="_blank" rel="noopener noreferrer">斗笠菇(286)</a>',
    '奥思巴燕(277)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E7%8E%8B%E7%87%95" target="_blank" rel="noopener noreferrer">大王燕(277)</a>',
    '嘟嘟利(085)': '<a href="https://wiki.52poke.com/wiki/%E5%98%9F%E5%98%9F%E5%88%A9" target="_blank" rel="noopener noreferrer">嘟嘟利(085)</a>',
    '由基瓦拉(361)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%AA%E7%AB%A5%E5%AD%90" target="_blank" rel="noopener noreferrer">雪童子(361)</a>',
    '向日葵(192)': '<a href="https://wiki.52poke.com/wiki/%E5%90%91%E6%97%A5%E8%8A%B1%E6%80%AA" target="_blank" rel="noopener noreferrer">向日花怪(192)</a>',
    '红鼻钢(476)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E6%9C%9D%E5%8C%97%E9%BC%BB" target="_blank" rel="noopener noreferrer">大朝北鼻(476)</a>',
    '火狮(244)': '<a href="https://wiki.52poke.com/wiki/%E7%82%8E%E5%B8%9D" target="_blank" rel="noopener noreferrer">炎帝(244)</a>',
    '迪奥西斯(386)': '<a href="https://wiki.52poke.com/wiki/%E4%BB%A3%E6%AC%A7%E5%A5%87%E5%B8%8C%E6%96%AF" target="_blank" rel="noopener noreferrer">代欧奇希斯(386)</a>',
    '妙蛙花(003)': '<a href="https://wiki.52poke.com/wiki/%E5%A6%99%E8%9B%99%E8%8A%B1" target="_blank" rel="noopener noreferrer">妙蛙花(003)</a>',
    '公主熊(216)': '<a href="https://wiki.52poke.com/wiki/%E7%86%8A%E5%AE%9D%E5%AE%9D" target="_blank" rel="noopener noreferrer">熊宝宝(216)</a>',
    '梦巫(429)': '<a href="https://wiki.52poke.com/wiki/%E6%A2%A6%E5%A6%96%E9%AD%94" target="_blank" rel="noopener noreferrer">梦妖魔(429)</a>',
    '地狱超人(302)': '<a href="https://wiki.52poke.com/wiki/%E5%8B%BE%E9%AD%82%E7%9C%BC" target="_blank" rel="noopener noreferrer">勾魂眼(302)</a>',
    '女郎兔(428)': '<a href="https://wiki.52poke.com/wiki/%E9%95%BF%E8%80%B3%E5%85%94" target="_blank" rel="noopener noreferrer">长耳兔(428)</a>',
    '三地鼠(051)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%89%E5%9C%B0%E9%BC%A0" target="_blank" rel="noopener noreferrer">三地鼠(051)</a>',
    '隆隆岩(076)': '<a href="https://wiki.52poke.com/wiki/%E9%9A%86%E9%9A%86%E5%B2%A9" target="_blank" rel="noopener noreferrer">隆隆岩(076)</a>',
    '小嵘(194)': '<a href="https://wiki.52poke.com/wiki/%E4%B9%8C%E6%B3%A2" target="_blank" rel="noopener noreferrer">乌波(194)</a>',
    '巨钳蟹(099)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E9%92%B3%E8%9F%B9" target="_blank" rel="noopener noreferrer">巨钳蟹(099)</a>',
    '河狸精灵(400)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%B0%BE%E7%8B%B8" target="_blank" rel="noopener noreferrer">大尾狸(400)</a>',
    '巨翅蝉(291)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E9%9D%A2%E5%BF%8D%E8%80%85" target="_blank" rel="noopener noreferrer">铁面忍者(291)</a>',
    '迷唇姐(124)': '<a href="https://wiki.52poke.com/wiki/%E8%BF%B7%E5%94%87%E5%A7%90" target="_blank" rel="noopener noreferrer">迷唇姐(124)</a>',
    '暴鲤龙(130)': '<a href="https://wiki.52poke.com/wiki/%E6%9A%B4%E9%B2%A4%E9%BE%99" target="_blank" rel="noopener noreferrer">暴鲤龙(130)</a>',
    '豪力(067)': '<a href="https://wiki.52poke.com/wiki/%E8%B1%AA%E5%8A%9B" target="_blank" rel="noopener noreferrer">豪力(067)</a>',
    '哈斯荷童(271)': '<a href="https://wiki.52poke.com/wiki/%E8%8E%B2%E5%B8%BD%E5%B0%8F%E7%AB%A5" target="_blank" rel="noopener noreferrer">莲帽小童(271)</a>',
    '蟋蟀战士(402)': '<a href="https://wiki.52poke.com/wiki/%E9%9F%B3%E7%AE%B1%E8%9F%80" target="_blank" rel="noopener noreferrer">音箱蟀(402)</a>',
    '具壳怪(205)': '<a href="https://wiki.52poke.com/wiki/%E4%BD%9B%E7%83%88%E6%89%98%E6%96%AF" target="_blank" rel="noopener noreferrer">佛烈托斯(205)</a>',
    '雷丘(026)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E4%B8%98" target="_blank" rel="noopener noreferrer">雷丘(026)</a>',
    '海鼬王(419)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%AE%E6%BD%9C%E9%BC%AC" target="_blank" rel="noopener noreferrer">浮潜鼬(419)</a>',
    '毒刺水母(073)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%92%E5%88%BA%E6%B0%B4%E6%AF%8D" target="_blank" rel="noopener noreferrer">毒刺水母(073)</a>',
    '哈克龙(148)': '<a href="https://wiki.52poke.com/wiki/%E5%93%88%E5%85%8B%E9%BE%99" target="_blank" rel="noopener noreferrer">哈克龙(148)</a>',
    '小火马(077)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%81%AB%E9%A9%AC" target="_blank" rel="noopener noreferrer">小火马(077)</a>',
    '麒麟奇(203)': '<a href="https://wiki.52poke.com/wiki/%E9%BA%92%E9%BA%9F%E5%A5%87" target="_blank" rel="noopener noreferrer">麒麟奇(203)</a>',
    '钻甲暴龙(464)': '<a href="https://wiki.52poke.com/wiki/%E8%B6%85%E7%94%B2%E7%8B%82%E7%8A%80" target="_blank" rel="noopener noreferrer">超甲狂犀(464)</a>',
    '金龟战士(166)': '<a href="https://wiki.52poke.com/wiki/%E5%AE%89%E7%93%A2%E8%99%AB" target="_blank" rel="noopener noreferrer">安瓢虫(166)</a>',
    '噬人怪草(455)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%96%E7%89%99%E7%AC%BC" target="_blank" rel="noopener noreferrer">尖牙笼(455)</a>',
    '恶啸狼(262)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E7%8B%BC%E7%8A%AC" target="_blank" rel="noopener noreferrer">大狼犬(262)</a>',
    '电击兽(125)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E5%87%BB%E5%85%BD" target="_blank" rel="noopener noreferrer">电击兽(125)</a>',
    '花羽蜻蜓(193)': '<a href="https://wiki.52poke.com/wiki/%E8%9C%BB%E8%9C%BB%E8%9C%93" target="_blank" rel="noopener noreferrer">蜻蜻蜓(193)</a>',
    '尖嘴鸟(022)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%98%B4%E9%9B%80" target="_blank" rel="noopener noreferrer">大嘴雀(022)</a>',
    '臭臭花(044)': '<a href="https://wiki.52poke.com/wiki/%E8%87%AD%E8%87%AD%E8%8A%B1" target="_blank" rel="noopener noreferrer">臭臭花(044)</a>',
    '嘎拉嘎拉(105)': '<a href="https://wiki.52poke.com/wiki/%E5%98%8E%E5%95%A6%E5%98%8E%E5%95%A6" target="_blank" rel="noopener noreferrer">嘎啦嘎啦(105)</a>',
    '霸王花(045)': '<a href="https://wiki.52poke.com/wiki/%E9%9C%B8%E7%8E%8B%E8%8A%B1" target="_blank" rel="noopener noreferrer">霸王花(045)</a>',
    '呆呆兽(079)': '<a href="https://wiki.52poke.com/wiki/%E5%91%86%E5%91%86%E5%85%BD" target="_blank" rel="noopener noreferrer">呆呆兽(079)</a>',
    '长臂猿(288)': '<a href="https://wiki.52poke.com/wiki/%E8%BF%87%E5%8A%A8%E7%8C%BF" target="_blank" rel="noopener noreferrer">过动猿(288)</a>',
    '小鲶鱼(339)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A5%E6%B3%A5%E9%B3%85" target="_blank" rel="noopener noreferrer">泥泥鳅(339)</a>',
    '火爆猴(057)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E6%9A%B4%E7%8C%B4" target="_blank" rel="noopener noreferrer">火暴猴(057)</a>',
    '小骨龙(408)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%B4%E7%9B%96%E9%BE%99" target="_blank" rel="noopener noreferrer">头盖龙(408)</a>',
    '巴鲁胖蜂(313)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E8%90%A4%E8%99%AB" target="_blank" rel="noopener noreferrer">电萤虫(313)</a>',
    '蝶尾鱼(456)': '<a href="https://wiki.52poke.com/wiki/%E8%8D%A7%E5%85%89%E9%B1%BC" target="_blank" rel="noopener noreferrer">荧光鱼(456)</a>',
    '钢甲犀牛(305)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%AF%E5%A4%9A%E6%8B%89" target="_blank" rel="noopener noreferrer">可多拉(305)</a>',
    '电光狮(404)': '<a href="https://wiki.52poke.com/wiki/%E5%8B%92%E5%85%8B%E7%8C%AB" target="_blank" rel="noopener noreferrer">勒克猫(404)</a>',
    '呵呵鹰(163)': '<a href="https://wiki.52poke.com/wiki/%E5%92%95%E5%92%95" target="_blank" rel="noopener noreferrer">咕咕(163)</a>',
    '瓦斯弹(109)': '<a href="https://wiki.52poke.com/wiki/%E7%93%A6%E6%96%AF%E5%BC%B9" target="_blank" rel="noopener noreferrer">瓦斯弹(109)</a>',
    '松果怪(204)': '<a href="https://wiki.52poke.com/wiki/%E6%A6%9B%E6%9E%9C%E7%90%83" target="_blank" rel="noopener noreferrer">榛果球(204)</a>',
    '牛奶坦克(241)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%A5%B6%E7%BD%90" target="_blank" rel="noopener noreferrer">大奶罐(241)</a>',
    '绅士鸦(430)': '<a href="https://wiki.52poke.com/wiki/%E4%B9%8C%E9%B8%A6%E5%A4%B4%E5%A4%B4" target="_blank" rel="noopener noreferrer">乌鸦头头(430)</a>',
    '长尾猴(190)': '<a href="https://wiki.52poke.com/wiki/%E9%95%BF%E5%B0%BE%E6%80%AA%E6%89%8B" target="_blank" rel="noopener noreferrer">长尾怪手(190)</a>',
    '3D龙(137)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%9A%E8%BE%B9%E5%85%BD" target="_blank" rel="noopener noreferrer">多边兽(137)</a>',
    '疾电狗(309)': '<a href="https://wiki.52poke.com/wiki/%E8%90%BD%E9%9B%B7%E5%85%BD" target="_blank" rel="noopener noreferrer">落雷兽(309)</a>',
    '凯诺菇(285)': '<a href="https://wiki.52poke.com/wiki/%E8%98%91%E8%98%91%E8%8F%87" target="_blank" rel="noopener noreferrer">蘑蘑菇(285)</a>',
    '棉花树(189)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%BD%E5%AD%90%E6%A3%89" target="_blank" rel="noopener noreferrer">毽子棉(189)</a>',
    '素利普(096)': '<a href="https://wiki.52poke.com/wiki/%E5%82%AC%E7%9C%A0%E8%B2%98" target="_blank" rel="noopener noreferrer">催眠貘(096)</a>',
    '长冠翁(398)': '<a href="https://wiki.52poke.com/wiki/%E5%A7%86%E5%85%8B%E9%B9%B0" target="_blank" rel="noopener noreferrer">姆克鹰(398)</a>',
    '拉巴蜻蜓(329)': '<a href="https://wiki.52poke.com/wiki/%E8%B6%85%E9%9F%B3%E6%B3%A2%E5%B9%BC%E8%99%AB" target="_blank" rel="noopener noreferrer">超音波幼虫(329)</a>',
    '正电兔(311)': '<a href="https://wiki.52poke.com/wiki/%E6%AD%A3%E7%94%B5%E6%8B%8D%E6%8B%8D" target="_blank" rel="noopener noreferrer">正电拍拍(311)</a>',
    '沙漠骆驼(322)': '<a href="https://wiki.52poke.com/wiki/%E5%91%86%E7%81%AB%E9%A9%BC" target="_blank" rel="noopener noreferrer">呆火驼(322)</a>',
    '磁石怪(299)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%9D%E5%8C%97%E9%BC%BB" target="_blank" rel="noopener noreferrer">朝北鼻(299)</a>',
    '吞食兽(316)': '<a href="https://wiki.52poke.com/wiki/%E6%BA%B6%E9%A3%9F%E5%85%BD" target="_blank" rel="noopener noreferrer">溶食兽(316)</a>',
    '兜兜蛋(440)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%A6%8F%E8%9B%8B" target="_blank" rel="noopener noreferrer">小福蛋(440)</a>',
    '胡说盆栽(438)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%86%E6%89%8D%E6%80%AA" target="_blank" rel="noopener noreferrer">盆才怪(438)</a>',
    '艾比郎(107)': '<a href="https://wiki.52poke.com/wiki/%E5%BF%AB%E6%8B%B3%E9%83%8E" target="_blank" rel="noopener noreferrer">快拳郎(107)</a>',
    '布布林(174)': '<a href="https://wiki.52poke.com/wiki/%E5%AE%9D%E5%AE%9D%E4%B8%81" target="_blank" rel="noopener noreferrer">宝宝丁(174)</a>',
    '思巴燕(276)': '<a href="https://wiki.52poke.com/wiki/%E5%82%B2%E9%AA%A8%E7%87%95" target="_blank" rel="noopener noreferrer">傲骨燕(276)</a>',
    '小海狮(086)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E6%B5%B7%E7%8B%AE" target="_blank" rel="noopener noreferrer">小海狮(086)</a>',
    '雷电球(100)': '<a href="https://wiki.52poke.com/wiki/%E9%9C%B9%E9%9B%B3%E7%94%B5%E7%90%83" target="_blank" rel="noopener noreferrer">霹雳电球(100)</a>',
    '隆隆石(075)': '<a href="https://wiki.52poke.com/wiki/%E9%9A%86%E9%9A%86%E7%9F%B3" target="_blank" rel="noopener noreferrer">隆隆石(075)</a>',
    '手尾猫(300)': '<a href="https://wiki.52poke.com/wiki/%E5%90%91%E5%B0%BE%E5%96%B5" target="_blank" rel="noopener noreferrer">向尾喵(300)</a>',
    '独角蛛(167)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%86%E4%B8%9D%E8%9B%9B" target="_blank" rel="noopener noreferrer">圆丝蛛(167)</a>',
    '隐身龙(352)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%98%E9%9A%90%E9%BE%99" target="_blank" rel="noopener noreferrer">变隐龙(352)</a>',
    '鬼盆栽(442)': '<a href="https://wiki.52poke.com/wiki/%E8%8A%B1%E5%B2%A9%E6%80%AA" target="_blank" rel="noopener noreferrer">花岩怪(442)</a>',
    '太阳神石(338)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%AA%E9%98%B3%E5%B2%A9" target="_blank" rel="noopener noreferrer">太阳岩(338)</a>',
    '气球仔(425)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%98%E9%A3%98%E7%90%83" target="_blank" rel="noopener noreferrer">飘飘球(425)</a>',
    '鲁力欧(447)': '<a href="https://wiki.52poke.com/wiki/%E5%88%A9%E6%AC%A7%E8%B7%AF" target="_blank" rel="noopener noreferrer">利欧路(447)</a>',
    '棉花兔(427)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%B7%E5%8D%B7%E8%80%B3" target="_blank" rel="noopener noreferrer">卷卷耳(427)</a>',
    '双钳龙虾(341)': '<a href="https://wiki.52poke.com/wiki/%E9%BE%99%E8%99%BE%E5%B0%8F%E5%85%B5" target="_blank" rel="noopener noreferrer">龙虾小兵(341)</a>',
    '口朵花(070)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%A3%E5%91%86%E8%8A%B1" target="_blank" rel="noopener noreferrer">口呆花(070)</a>',
    '拿古拉(328)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E9%A2%9A%E8%9A%81" target="_blank" rel="noopener noreferrer">大颚蚁(328)</a>',
    '大立尾鼠(162)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%B0%BE%E7%AB%8B" target="_blank" rel="noopener noreferrer">大尾立(162)</a>',
    '大牙象(232)': '<a href="https://wiki.52poke.com/wiki/%E9%A1%BF%E7%94%B2" target="_blank" rel="noopener noreferrer">顿甲(232)</a>',
    '皇帝企鹅(395)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%9D%E7%8E%8B%E6%8B%BF%E6%B3%A2" target="_blank" rel="noopener noreferrer">帝王拿波(395)</a>',
    '美丽花(182)': '<a href="https://wiki.52poke.com/wiki/%E7%BE%8E%E4%B8%BD%E8%8A%B1" target="_blank" rel="noopener noreferrer">美丽花(182)</a>',
    '可达鸭(054)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%AF%E8%BE%BE%E9%B8%AD" target="_blank" rel="noopener noreferrer">可达鸭(054)</a>',
    '向日古花(345)': '<a href="https://wiki.52poke.com/wiki/%E8%A7%A6%E6%89%8B%E7%99%BE%E5%90%88" target="_blank" rel="noopener noreferrer">触手百合(345)</a>',
    '画画犬(235)': '<a href="https://wiki.52poke.com/wiki/%E5%9B%BE%E5%9B%BE%E7%8A%AC" target="_blank" rel="noopener noreferrer">图图犬(235)</a>',
    '三色食人鱼(318)': '<a href="https://wiki.52poke.com/wiki/%E5%88%A9%E7%89%99%E9%B1%BC" target="_blank" rel="noopener noreferrer">利牙鱼(318)</a>',
    '玩偶鸟(177)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A9%E7%84%B6%E9%9B%80" target="_blank" rel="noopener noreferrer">天然雀(177)</a>',
    '阿萨那恩(307)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E6%B2%99%E9%82%A3" target="_blank" rel="noopener noreferrer">玛沙那(307)</a>',
    '坚果球(273)': '<a href="https://wiki.52poke.com/wiki/%E6%A9%A1%E5%AE%9E%E6%9E%9C" target="_blank" rel="noopener noreferrer">橡实果(273)</a>',
    '土偶怪(343)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A9%E7%A7%A4%E5%81%B6" target="_blank" rel="noopener noreferrer">天秤偶(343)</a>',
    '云彩雀(333)': '<a href="https://wiki.52poke.com/wiki/%E9%9D%92%E7%BB%B5%E9%B8%9F" target="_blank" rel="noopener noreferrer">青绵鸟(333)</a>',
    '嘟嘟(084)': '<a href="https://wiki.52poke.com/wiki/%E5%98%9F%E5%98%9F" target="_blank" rel="noopener noreferrer">嘟嘟(084)</a>',
    '鲁卡力欧(448)': '<a href="https://wiki.52poke.com/wiki/%E8%B7%AF%E5%8D%A1%E5%88%A9%E6%AC%A7" target="_blank" rel="noopener noreferrer">路卡利欧(448)</a>',
    '角金鱼(118)': '<a href="https://wiki.52poke.com/wiki/%E8%A7%92%E9%87%91%E9%B1%BC" target="_blank" rel="noopener noreferrer">角金鱼(118)</a>',
    '小懒熊(287)': '<a href="https://wiki.52poke.com/wiki/%E6%87%92%E4%BA%BA%E7%8D%AD" target="_blank" rel="noopener noreferrer">懒人獭(287)</a>',
    '铁甲蛹(011)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E7%94%B2%E8%9B%B9" target="_blank" rel="noopener noreferrer">铁甲蛹(011)</a>',
    '大岩蛇(095)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%B2%A9%E8%9B%87" target="_blank" rel="noopener noreferrer">大岩蛇(095)</a>',
    '铁壳昆(014)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E5%A3%B3%E8%9B%B9" target="_blank" rel="noopener noreferrer">铁壳蛹(014)</a>',
    '乌利猪(220)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E5%B1%B1%E7%8C%AA" target="_blank" rel="noopener noreferrer">小山猪(220)</a>',
    '凯利阿(281)': '<a href="https://wiki.52poke.com/wiki/%E5%A5%87%E9%B2%81%E8%8E%89%E5%AE%89" target="_blank" rel="noopener noreferrer">奇鲁莉安(281)</a>',
    '刺角蛹(266)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B2%E5%A3%B3%E8%8C%A7" target="_blank" rel="noopener noreferrer">甲壳茧(266)</a>',
    '羽毛树(187)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%BD%E5%AD%90%E8%8D%89" target="_blank" rel="noopener noreferrer">毽子草(187)</a>',
    '六尾(037)': '<a href="https://wiki.52poke.com/wiki/%E5%85%AD%E5%B0%BE" target="_blank" rel="noopener noreferrer">六尾(037)</a>',
    '沼泽河马(449)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%99%E6%B2%B3%E9%A9%AC" target="_blank" rel="noopener noreferrer">沙河马(449)</a>',
    '金龟虫(165)': '<a href="https://wiki.52poke.com/wiki/%E8%8A%AD%E7%93%A2%E8%99%AB" target="_blank" rel="noopener noreferrer">芭瓢虫(165)</a>',
    '悠闲种子(191)': '<a href="https://wiki.52poke.com/wiki/%E5%90%91%E6%97%A5%E7%A7%8D%E5%AD%90" target="_blank" rel="noopener noreferrer">向日种子(191)</a>',
    '立尾鼠(161)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BE%E7%AB%8B" target="_blank" rel="noopener noreferrer">尾立(161)</a>',
    '树林龟(388)': '<a href="https://wiki.52poke.com/wiki/%E6%A0%91%E6%9E%97%E9%BE%9F" target="_blank" rel="noopener noreferrer">树林龟(388)</a>',
    '伊诺猪(221)': '<a href="https://wiki.52poke.com/wiki/%E9%95%BF%E6%AF%9B%E7%8C%AA" target="_blank" rel="noopener noreferrer">长毛猪(221)</a>',
    '阿柏蛇(023)': '<a href="https://wiki.52poke.com/wiki/%E9%98%BF%E6%9F%8F%E8%9B%87" target="_blank" rel="noopener noreferrer">阿柏蛇(023)</a>',
    '地图石鱼(369)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%A4%E7%A9%BA%E6%A3%98%E9%B1%BC" target="_blank" rel="noopener noreferrer">古空棘鱼(369)</a>',
    '怪蛙鱼(223)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E7%82%AE%E9%B1%BC" target="_blank" rel="noopener noreferrer">铁炮鱼(223)</a>',
    '哈斯荷叶(270)': '<a href="https://wiki.52poke.com/wiki/%E8%8E%B2%E5%8F%B6%E7%AB%A5%E5%AD%90" target="_blank" rel="noopener noreferrer">莲叶童子(270)</a>',
    '塔祖贝龙(371)': '<a href="https://wiki.52poke.com/wiki/%E5%AE%9D%E8%B4%9D%E9%BE%99" target="_blank" rel="noopener noreferrer">宝贝龙(371)</a>',
    '地鼠(050)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%B0%E9%BC%A0" target="_blank" rel="noopener noreferrer">地鼠(050)</a>',
    '皮丘(172)': '<a href="https://wiki.52poke.com/wiki/%E7%9A%AE%E4%B8%98" target="_blank" rel="noopener noreferrer">皮丘(172)</a>',
    '皮(173)': '<a href="https://wiki.52poke.com/wiki/%E7%9A%AE%E5%AE%9D%E5%AE%9D" target="_blank" rel="noopener noreferrer">皮宝宝(173)</a>',
    '尼多朗(032)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E6%9C%97" target="_blank" rel="noopener noreferrer">尼多朗(032)</a>',
    '树苗龟(387)': '<a href="https://wiki.52poke.com/wiki/%E8%8D%89%E8%8B%97%E9%BE%9F" target="_blank" rel="noopener noreferrer">草苗龟(387)</a>',
    '波克比(175)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E5%85%8B%E6%AF%94" target="_blank" rel="noopener noreferrer">波克比(175)</a>',
    '蚊香蝌蚪(060)': '<a href="https://wiki.52poke.com/wiki/%E8%9A%8A%E9%A6%99%E8%9D%8C%E8%9A%AA" target="_blank" rel="noopener noreferrer">蚊香蝌蚪(060)</a>',
    '喇叭芽(069)': '<a href="https://wiki.52poke.com/wiki/%E5%96%87%E5%8F%AD%E8%8A%BD" target="_blank" rel="noopener noreferrer">喇叭芽(069)</a>',
    '土龙(206)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%9F%E9%BE%99%E5%BC%9F%E5%BC%9F" target="_blank" rel="noopener noreferrer">土龙弟弟(206)</a>',
    '雪山狐猫(335)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%AB%E9%BC%AC%E6%96%A9" target="_blank" rel="noopener noreferrer">猫鼬斩(335)</a>',
    '袋龙(115)': '<a href="https://wiki.52poke.com/wiki/%E8%A2%8B%E5%85%BD" target="_blank" rel="noopener noreferrer">袋兽(115)</a>',
    '丑鲤鱼(349)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%91%E4%B8%91%E9%B1%BC" target="_blank" rel="noopener noreferrer">丑丑鱼(349)</a>',
    '双灯鱼(170)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AF%E7%AC%BC%E9%B1%BC" target="_blank" rel="noopener noreferrer">灯笼鱼(170)</a>',
    '独眼达恩(374)': '<a href="https://wiki.52poke.com/wiki/%E9%93%81%E5%93%91%E9%93%83" target="_blank" rel="noopener noreferrer">铁哑铃(374)</a>',
    '胖蟋蟀(401)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%86%E6%B3%95%E5%B8%88" target="_blank" rel="noopener noreferrer">圆法师(401)</a>',
    '沙瓦郎(106)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%9E%E8%85%BF%E9%83%8E" target="_blank" rel="noopener noreferrer">飞腿郎(106)</a>',
    '大力甲虫(214)': '<a href="https://wiki.52poke.com/wiki/%E8%B5%AB%E6%8B%89%E5%85%8B%E7%BD%97%E6%96%AF" target="_blank" rel="noopener noreferrer">赫拉克罗斯(214)</a>',
    '巨嘴鳗(367)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%8E%E6%96%91%E9%B1%BC" target="_blank" rel="noopener noreferrer">猎斑鱼(367)</a>',
    '波波(016)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E6%B3%A2" target="_blank" rel="noopener noreferrer">波波(016)</a>',
    '绿毛虫(010)': '<a href="https://wiki.52poke.com/wiki/%E7%BB%BF%E6%AF%9B%E8%99%AB" target="_blank" rel="noopener noreferrer">绿毛虫(010)</a>',
    '飞碟磁怪(462)': '<a href="https://wiki.52poke.com/wiki/%E8%87%AA%E7%88%86%E7%A3%81%E6%80%AA" target="_blank" rel="noopener noreferrer">自爆磁怪(462)</a>',
    '快泳蛙(062)': '<a href="https://wiki.52poke.com/wiki/%E8%9A%8A%E9%A6%99%E6%B3%B3%E5%A3%AB" target="_blank" rel="noopener noreferrer">蚊香泳士(062)</a>',
    '金鱼王(119)': '<a href="https://wiki.52poke.com/wiki/%E9%87%91%E9%B1%BC%E7%8E%8B" target="_blank" rel="noopener noreferrer">金鱼王(119)</a>',
    '超能战士(475)': '<a href="https://wiki.52poke.com/wiki/%E8%89%BE%E8%B7%AF%E9%9B%B7%E6%9C%B5" target="_blank" rel="noopener noreferrer">艾路雷朵(475)</a>',
    '尖头鳗(368)': '<a href="https://wiki.52poke.com/wiki/%E6%A8%B1%E8%8A%B1%E9%B1%BC" target="_blank" rel="noopener noreferrer">樱花鱼(368)</a>',
    '水精灵(134)': '<a href="https://wiki.52poke.com/wiki/%E6%B0%B4%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">水伊布(134)</a>',
    '河马国王(199)': '<a href="https://wiki.52poke.com/wiki/%E5%91%86%E5%91%86%E7%8E%8B" target="_blank" rel="noopener noreferrer">呆呆王(199)</a>',
    '巨飞蝎(472)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A9%E8%9D%8E%E7%8E%8B" target="_blank" rel="noopener noreferrer">天蝎王(472)</a>',
    '冰神柱(378)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E5%90%89%E8%89%BE%E6%96%AF" target="_blank" rel="noopener noreferrer">雷吉艾斯(378)</a>',
    '电击魔(466)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E5%87%BB%E9%AD%94%E5%85%BD" target="_blank" rel="noopener noreferrer">电击魔兽(466)</a>',
    '卡波耶拉(237)': '<a href="https://wiki.52poke.com/wiki/%E6%88%98%E8%88%9E%E9%83%8E" target="_blank" rel="noopener noreferrer">战舞郎(237)</a>',
    '拉托斯(280)': '<a href="https://wiki.52poke.com/wiki/%E6%8B%89%E9%B2%81%E6%8B%89%E4%B8%9D" target="_blank" rel="noopener noreferrer">拉鲁拉丝(280)</a>',
    '卡比兽(143)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%A1%E6%AF%94%E5%85%BD" target="_blank" rel="noopener noreferrer">卡比兽(143)</a>',
    '海刺龙(117)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%B7%E5%88%BA%E9%BE%99" target="_blank" rel="noopener noreferrer">海刺龙(117)</a>',
    '钢铁螃蟹(376)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E9%87%91%E6%80%AA" target="_blank" rel="noopener noreferrer">巨金怪(376)</a>',
    '杰尼龟(007)': '<a href="https://wiki.52poke.com/wiki/%E6%9D%B0%E5%B0%BC%E9%BE%9F" target="_blank" rel="noopener noreferrer">杰尼龟(007)</a>',
    '小球飞鱼(458)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%90%83%E9%A3%9E%E9%B1%BC" target="_blank" rel="noopener noreferrer">小球飞鱼(458)</a>',
    '树藤怪(465)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E8%94%93%E8%97%A4" target="_blank" rel="noopener noreferrer">巨蔓藤(465)</a>',
    '比比鸟(017)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%94%E6%AF%94%E9%B8%9F" target="_blank" rel="noopener noreferrer">比比鸟(017)</a>',
    '臭泥(088)': '<a href="https://wiki.52poke.com/wiki/%E8%87%AD%E6%B3%A5" target="_blank" rel="noopener noreferrer">臭泥(088)</a>',
    '双臂恩古(375)': '<a href="https://wiki.52poke.com/wiki/%E9%87%91%E5%B1%9E%E6%80%AA" target="_blank" rel="noopener noreferrer">金属怪(375)</a>',
    '音符鹉(441)': '<a href="https://wiki.52poke.com/wiki/%E8%81%92%E5%99%AA%E9%B8%9F" target="_blank" rel="noopener noreferrer">聒噪鸟(441)</a>',
    '木天狗(275)': '<a href="https://wiki.52poke.com/wiki/%E7%8B%A1%E7%8C%BE%E5%A4%A9%E7%8B%97" target="_blank" rel="noopener noreferrer">狡猾天狗(275)</a>',
    '吉利鸟(225)': '<a href="https://wiki.52poke.com/wiki/%E4%BF%A1%E4%BD%BF%E9%B8%9F" target="_blank" rel="noopener noreferrer">信使鸟(225)</a>',
    '火精灵(136)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">火伊布(136)</a>',
    '古蜻蜓(469)': '<a href="https://wiki.52poke.com/wiki/%E8%BF%9C%E5%8F%A4%E5%B7%A8%E8%9C%93" target="_blank" rel="noopener noreferrer">远古巨蜓(469)</a>',
    '石章鱼(224)': '<a href="https://wiki.52poke.com/wiki/%E7%AB%A0%E9%B1%BC%E6%A1%B6" target="_blank" rel="noopener noreferrer">章鱼桶(224)</a>',
    '玛瑙水母(072)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E7%91%99%E6%B0%B4%E6%AF%8D" target="_blank" rel="noopener noreferrer">玛瑙水母(072)</a>',
    '雪魔女(478)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%AA%E5%A6%96%E5%A5%B3" target="_blank" rel="noopener noreferrer">雪妖女(478)</a>',
    '呆河马(080)': '<a href="https://wiki.52poke.com/wiki/%E5%91%86%E5%A3%B3%E5%85%BD" target="_blank" rel="noopener noreferrer">呆壳兽(080)</a>',
    '阿扁鱼(226)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E7%BF%85%E9%A3%9E%E9%B1%BC" target="_blank" rel="noopener noreferrer">巨翅飞鱼(226)</a>',
    '巨嘴秋(303)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%98%B4%E5%A8%83" target="_blank" rel="noopener noreferrer">大嘴娃(303)</a>',
    '草青蛙(253)': '<a href="https://wiki.52poke.com/wiki/%E6%A3%AE%E6%9E%97%E8%9C%A5%E8%9C%B4" target="_blank" rel="noopener noreferrer">森林蜥蜴(253)</a>',
    '波波树(188)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%BD%E5%AD%90%E8%8A%B1" target="_blank" rel="noopener noreferrer">毽子花(188)</a>',
    '火苗猴(390)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%81%AB%E7%84%B0%E7%8C%B4" target="_blank" rel="noopener noreferrer">小火焰猴(390)</a>',
    '伊布(133)': '<a href="https://wiki.52poke.com/wiki/%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">伊布(133)</a>',
    '布鲁(209)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%83%E9%B2%81" target="_blank" rel="noopener noreferrer">布鲁(209)</a>',
    '帕鲁蚌(366)': '<a href="https://wiki.52poke.com/wiki/%E7%8F%8D%E7%8F%A0%E8%B4%9D" target="_blank" rel="noopener noreferrer">珍珠贝(366)</a>',
    '盔甲蝎(348)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%AA%E5%8F%A4%E7%9B%94%E7%94%B2" target="_blank" rel="noopener noreferrer">太古盔甲(348)</a>',
    '猫老大(053)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%AB%E8%80%81%E5%A4%A7" target="_blank" rel="noopener noreferrer">猫老大(053)</a>',
    '小浣熊(263)': '<a href="https://wiki.52poke.com/wiki/%E8%9B%87%E7%BA%B9%E7%86%8A" target="_blank" rel="noopener noreferrer">蛇纹熊(263)</a>',
    '无壳龙(422)': '<a href="https://wiki.52poke.com/wiki/%E6%97%A0%E5%A3%B3%E6%B5%B7%E5%85%94" target="_blank" rel="noopener noreferrer">无壳海兔(422)</a>',
    '叉尾鼬(418)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%B3%E5%9C%88%E9%BC%AC" target="_blank" rel="noopener noreferrer">泳圈鼬(418)</a>',
    '魔尼小丑(439)': '<a href="https://wiki.52poke.com/wiki/%E9%AD%94%E5%B0%BC%E5%B0%BC" target="_blank" rel="noopener noreferrer">魔尼尼(439)</a>',
    '飞天螳螂(123)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%9E%E5%A4%A9%E8%9E%B3%E8%9E%82" target="_blank" rel="noopener noreferrer">飞天螳螂(123)</a>',
    '钝河狸(399)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E7%89%99%E7%8B%B8" target="_blank" rel="noopener noreferrer">大牙狸(399)</a>',
    '走路草(043)': '<a href="https://wiki.52poke.com/wiki/%E8%B5%B0%E8%B7%AF%E8%8D%89" target="_blank" rel="noopener noreferrer">走路草(043)</a>',
    '小拉达(019)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E6%8B%89%E8%BE%BE" target="_blank" rel="noopener noreferrer">小拉达(019)</a>',
    '艾莉鳄(159)': '<a href="https://wiki.52poke.com/wiki/%E8%93%9D%E9%B3%84" target="_blank" rel="noopener noreferrer">蓝鳄(159)</a>',
    '水鼠(183)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E5%8A%9B%E9%9C%B2" target="_blank" rel="noopener noreferrer">玛力露(183)</a>',
    '大嘴鹈鹕(279)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E5%98%B4%E9%B8%A5" target="_blank" rel="noopener noreferrer">大嘴鸥(279)</a>',
    '地贝龙(423)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%B7%E5%85%94%E5%85%BD" target="_blank" rel="noopener noreferrer">海兔兽(423)</a>',
    '巴路奇(236)': '<a href="https://wiki.52poke.com/wiki/%E6%97%A0%E7%95%8F%E5%B0%8F%E5%AD%90" target="_blank" rel="noopener noreferrer">无畏小子(236)</a>',
    '森林雪人(459)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%AA%E7%AC%A0%E6%80%AA" target="_blank" rel="noopener noreferrer">雪笠怪(459)</a>',
    '圈圈兔(327)': '<a href="https://wiki.52poke.com/wiki/%E6%99%83%E6%99%83%E6%96%91" target="_blank" rel="noopener noreferrer">晃晃斑(327)</a>',
    '噬人古花(346)': '<a href="https://wiki.52poke.com/wiki/%E6%91%87%E7%AF%AE%E7%99%BE%E5%90%88" target="_blank" rel="noopener noreferrer">摇篮百合(346)</a>',
    '鬼影娃娃(353)': '<a href="https://wiki.52poke.com/wiki/%E6%80%A8%E5%BD%B1%E5%A8%83%E5%A8%83" target="_blank" rel="noopener noreferrer">怨影娃娃(353)</a>',
    '蝶翅鱼(457)': '<a href="https://wiki.52poke.com/wiki/%E9%9C%93%E8%99%B9%E9%B1%BC" target="_blank" rel="noopener noreferrer">霓虹鱼(457)</a>',
    '椰蛋树(103)': '<a href="https://wiki.52poke.com/wiki/%E6%A4%B0%E8%9B%8B%E6%A0%91" target="_blank" rel="noopener noreferrer">椰蛋树(103)</a>',
    '硬甲古蝎(347)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%AA%E5%8F%A4%E7%BE%BD%E8%99%AB" target="_blank" rel="noopener noreferrer">太古羽虫(347)</a>',
    '哥达鸭(055)': '<a href="https://wiki.52poke.com/wiki/%E5%93%A5%E8%BE%BE%E9%B8%AD" target="_blank" rel="noopener noreferrer">哥达鸭(055)</a>',
    '大舌贝(090)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E8%88%8C%E8%B4%9D" target="_blank" rel="noopener noreferrer">大舌贝(090)</a>',
    '小水鼠(298)': '<a href="https://wiki.52poke.com/wiki/%E9%9C%B2%E5%8A%9B%E4%B8%BD" target="_blank" rel="noopener noreferrer">露力丽(298)</a>',
    '弹簧小猪(325)': '<a href="https://wiki.52poke.com/wiki/%E8%B7%B3%E8%B7%B3%E7%8C%AA" target="_blank" rel="noopener noreferrer">跳跳猪(325)</a>',
    '负电兔(312)': '<a href="https://wiki.52poke.com/wiki/%E8%B4%9F%E7%94%B5%E6%8B%8D%E6%8B%8D" target="_blank" rel="noopener noreferrer">负电拍拍(312)</a>',
    '红毛虫(265)': '<a href="https://wiki.52poke.com/wiki/%E5%88%BA%E5%B0%BE%E8%99%AB" target="_blank" rel="noopener noreferrer">刺尾虫(265)</a>',
    '超音蝠(041)': '<a href="https://wiki.52poke.com/wiki/%E8%B6%85%E9%9F%B3%E8%9D%A0" target="_blank" rel="noopener noreferrer">超音蝠(041)</a>',
    '尼多莉娜(030)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E5%A8%9C" target="_blank" rel="noopener noreferrer">尼多娜(030)</a>',
    '玫瑰花苞(406)': '<a href="https://wiki.52poke.com/wiki/%E5%90%AB%E7%BE%9E%E8%8B%9E" target="_blank" rel="noopener noreferrer">含羞苞(406)</a>',
    '飞翼兽(176)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E5%85%8B%E5%9F%BA%E5%8F%A4" target="_blank" rel="noopener noreferrer">波克基古(176)</a>',
    '无壳蜗牛(218)': '<a href="https://wiki.52poke.com/wiki/%E7%86%94%E5%B2%A9%E8%99%AB" target="_blank" rel="noopener noreferrer">熔岩虫(218)</a>',
    '大眼娃(238)': '<a href="https://wiki.52poke.com/wiki/%E8%BF%B7%E5%94%87%E5%A8%83" target="_blank" rel="noopener noreferrer">迷唇娃(238)</a>',
    '大食花(071)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E9%A3%9F%E8%8A%B1" target="_blank" rel="noopener noreferrer">大食花(071)</a>',
    '胖丁(039)': '<a href="https://wiki.52poke.com/wiki/%E8%83%96%E4%B8%81" target="_blank" rel="noopener noreferrer">胖丁(039)</a>',
    '铁甲犀牛(111)': '<a href="https://wiki.52poke.com/wiki/%E7%8B%AC%E8%A7%92%E7%8A%80%E7%89%9B" target="_blank" rel="noopener noreferrer">独角犀牛(111)</a>',
    '穿山鼠(027)': '<a href="https://wiki.52poke.com/wiki/%E7%A9%BF%E5%B1%B1%E9%BC%A0" target="_blank" rel="noopener noreferrer">穿山鼠(027)</a>',
    '心形鱼(370)': '<a href="https://wiki.52poke.com/wiki/%E7%88%B1%E5%BF%83%E9%B1%BC" target="_blank" rel="noopener noreferrer">爱心鱼(370)</a>',
    '未知(201)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%AA%E7%9F%A5%E5%9B%BE%E8%85%BE" target="_blank" rel="noopener noreferrer">未知图腾(201)</a>',
    '墨海马(116)': '<a href="https://wiki.52poke.com/wiki/%E5%A2%A8%E6%B5%B7%E9%A9%AC" target="_blank" rel="noopener noreferrer">墨海马(116)</a>',
    '小水狗(258)': '<a href="https://wiki.52poke.com/wiki/%E6%B0%B4%E8%B7%83%E9%B1%BC" target="_blank" rel="noopener noreferrer">水跃鱼(258)</a>',
    '伊露胖蜂(314)': '<a href="https://wiki.52poke.com/wiki/%E7%94%9C%E7%94%9C%E8%90%A4" target="_blank" rel="noopener noreferrer">甜甜萤(314)</a>',
    '三合一蜂巢(415)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%89%E8%9C%9C%E8%9C%82" target="_blank" rel="noopener noreferrer">三蜜蜂(415)</a>',
    '鬼斯(092)': '<a href="https://wiki.52poke.com/wiki/%E9%AC%BC%E6%96%AF" target="_blank" rel="noopener noreferrer">鬼斯(092)</a>',
    '鲤鱼王(129)': '<a href="https://wiki.52poke.com/wiki/%E9%B2%A4%E9%B1%BC%E7%8E%8B" target="_blank" rel="noopener noreferrer">鲤鱼王(129)</a>',
    '阿美蛛(283)': '<a href="https://wiki.52poke.com/wiki/%E6%BA%9C%E6%BA%9C%E7%B3%96%E7%90%83" target="_blank" rel="noopener noreferrer">溜溜糖球(283)</a>',
    '菊石兽(138)': '<a href="https://wiki.52poke.com/wiki/%E8%8F%8A%E7%9F%B3%E5%85%BD" target="_blank" rel="noopener noreferrer">菊石兽(138)</a>',
    '叶精灵(470)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%B6%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">叶伊布(470)</a>',
    '猴怪(056)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%B4%E6%80%AA" target="_blank" rel="noopener noreferrer">猴怪(056)</a>',
    '独角虫(013)': '<a href="https://wiki.52poke.com/wiki/%E7%8B%AC%E8%A7%92%E8%99%AB" target="_blank" rel="noopener noreferrer">独角虫(013)</a>',
    '鬼龙(487)': '<a href="https://wiki.52poke.com/wiki/%E9%AA%91%E6%8B%89%E5%B8%9D%E7%BA%B3" target="_blank" rel="noopener noreferrer">骑拉帝纳(487)</a>',
    '海皇牙(382)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%96%E6%AC%A7%E5%8D%A1" target="_blank" rel="noopener noreferrer">盖欧卡(382)</a>',
    '海象牙王(365)': '<a href="https://wiki.52poke.com/wiki/%E5%B8%9D%E7%89%99%E6%B5%B7%E7%8B%AE" target="_blank" rel="noopener noreferrer">帝牙海狮(365)</a>',
    '火鸡战士(257)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E7%84%B0%E9%B8%A1" target="_blank" rel="noopener noreferrer">火焰鸡(257)</a>',
    '梦兽(488)': '<a href="https://wiki.52poke.com/wiki/%E5%85%8B%E9%9B%B7%E8%89%B2%E5%88%A9%E4%BA%9A" target="_blank" rel="noopener noreferrer">克雷色利亚(488)</a>',
    '艾菲狐(196)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%AA%E9%98%B3%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">太阳伊布(196)</a>',
    '红圣菇(481)': '<a href="https://wiki.52poke.com/wiki/%E8%89%BE%E5%A7%86%E5%88%A9%E5%A4%9A" target="_blank" rel="noopener noreferrer">艾姆利多(481)</a>',
    '毒龙蝎(452)': '<a href="https://wiki.52poke.com/wiki/%E9%BE%99%E7%8E%8B%E8%9D%8E" target="_blank" rel="noopener noreferrer">龙王蝎(452)</a>',
    '玛纽拉(461)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E7%8B%83%E6%8B%89" target="_blank" rel="noopener noreferrer">玛狃拉(461)</a>',
    '拉迪阿斯(380)': '<a href="https://wiki.52poke.com/wiki/%E6%8B%89%E5%B8%9D%E4%BA%9A%E6%96%AF" target="_blank" rel="noopener noreferrer">拉帝亚斯(380)</a>',
    '樱桃花(421)': '<a href="https://wiki.52poke.com/wiki/%E6%A8%B1%E8%8A%B1%E5%84%BF" target="_blank" rel="noopener noreferrer">樱花儿(421)</a>',
    '双尾猴(424)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%8C%E5%B0%BE%E6%80%AA%E6%89%8B" target="_blank" rel="noopener noreferrer">双尾怪手(424)</a>',
    '地震鲶鱼(340)': '<a href="https://wiki.52poke.com/wiki/%E9%B2%B6%E9%B1%BC%E7%8E%8B" target="_blank" rel="noopener noreferrer">鲶鱼王(340)</a>',
    '冰精灵(471)': '<a href="https://wiki.52poke.com/wiki/%E5%86%B0%E4%BC%8A%E5%B8%83" target="_blank" rel="noopener noreferrer">冰伊布(471)</a>',
    '利爪地龙(444)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%96%E7%89%99%E9%99%86%E9%B2%A8" target="_blank" rel="noopener noreferrer">尖牙陆鲨(444)</a>',
    '暴骨龙(409)': '<a href="https://wiki.52poke.com/wiki/%E6%88%98%E6%A7%8C%E9%BE%99" target="_blank" rel="noopener noreferrer">战槌龙(409)</a>',
    '三合一磁怪(082)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%89%E5%90%88%E4%B8%80%E7%A3%81%E6%80%AA" target="_blank" rel="noopener noreferrer">三合一磁怪(082)</a>',
    '镜面图腾(437)': '<a href="https://wiki.52poke.com/wiki/%E9%9D%92%E9%93%9C%E9%92%9F" target="_blank" rel="noopener noreferrer">青铜钟(437)</a>',
    '地狱犬(229)': '<a href="https://wiki.52poke.com/wiki/%E9%BB%91%E9%B2%81%E5%8A%A0" target="_blank" rel="noopener noreferrer">黑鲁加(229)</a>',
    '化石翼龙(142)': '<a href="https://wiki.52poke.com/wiki/%E5%8C%96%E7%9F%B3%E7%BF%BC%E9%BE%99" target="_blank" rel="noopener noreferrer">化石翼龙(142)</a>',
    '菲奥奈(489)': '<a href="https://wiki.52poke.com/wiki/%E9%9C%8F%E6%AC%A7%E7%BA%B3" target="_blank" rel="noopener noreferrer">霏欧纳(489)</a>',
    '大口食人鲨(319)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E7%89%99%E9%B2%A8" target="_blank" rel="noopener noreferrer">巨牙鲨(319)</a>',
    '哈萨姆(212)': '<a href="https://wiki.52poke.com/wiki/%E5%B7%A8%E9%92%B3%E8%9E%B3%E8%9E%82" target="_blank" rel="noopener noreferrer">巨钳螳螂(212)</a>',
    '水狗(259)': '<a href="https://wiki.52poke.com/wiki/%E6%B2%BC%E8%B7%83%E9%B1%BC" target="_blank" rel="noopener noreferrer">沼跃鱼(259)</a>',
    '圆环猫(301)': '<a href="https://wiki.52poke.com/wiki/%E4%BC%98%E9%9B%85%E7%8C%AB" target="_blank" rel="noopener noreferrer">优雅猫(301)</a>',
    '羊咩咩(180)': '<a href="https://wiki.52poke.com/wiki/%E8%8C%B8%E8%8C%B8%E7%BE%8A" target="_blank" rel="noopener noreferrer">茸茸羊(180)</a>',
    '半莲毒蛾(269)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%92%E7%B2%89%E8%9B%BE" target="_blank" rel="noopener noreferrer">毒粉蛾(269)</a>',
    '猛火猴(391)': '<a href="https://wiki.52poke.com/wiki/%E7%8C%9B%E7%81%AB%E7%8C%B4" target="_blank" rel="noopener noreferrer">猛火猴(391)</a>',
    '天气小子(351)': '<a href="https://wiki.52poke.com/wiki/%E9%A3%98%E6%B5%AE%E6%B3%A1%E6%B3%A1" target="_blank" rel="noopener noreferrer">飘浮泡泡(351)</a>',
    '电磁鬼(479)': '<a href="https://wiki.52poke.com/wiki/%E6%B4%9B%E6%89%98%E5%A7%86" target="_blank" rel="noopener noreferrer">洛托姆(479)</a>',
    '夜乌鸦(198)': '<a href="https://wiki.52poke.com/wiki/%E9%BB%91%E6%9A%97%E9%B8%A6" target="_blank" rel="noopener noreferrer">黑暗鸦(198)</a>',
    '海星星(120)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%B7%E6%98%9F%E6%98%9F" target="_blank" rel="noopener noreferrer">海星星(120)</a>',
    '穿山王(028)': '<a href="https://wiki.52poke.com/wiki/%E7%A9%BF%E5%B1%B1%E7%8E%8B" target="_blank" rel="noopener noreferrer">穿山王(028)</a>',
    '火恐龙(005)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E6%81%90%E9%BE%99" target="_blank" rel="noopener noreferrer">火恐龙(005)</a>',
    '大舌头(108)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E8%88%8C%E5%A4%B4" target="_blank" rel="noopener noreferrer">大舌头(108)</a>',
    '钢盾兽(411)': '<a href="https://wiki.52poke.com/wiki/%E6%8A%A4%E5%9F%8E%E9%BE%99" target="_blank" rel="noopener noreferrer">护城龙(411)</a>',
    '卡蒂狗(058)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%A1%E8%92%82%E7%8B%97" target="_blank" rel="noopener noreferrer">卡蒂狗(058)</a>',
    '梦魔(200)': '<a href="https://wiki.52poke.com/wiki/%E6%A2%A6%E5%A6%96" target="_blank" rel="noopener noreferrer">梦妖(200)</a>',
    '小磁怪(081)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%A3%81%E6%80%AA" target="_blank" rel="noopener noreferrer">小磁怪(081)</a>',
    '音波兔(293)': '<a href="https://wiki.52poke.com/wiki/%E5%92%95%E5%A6%9E%E5%A6%9E" target="_blank" rel="noopener noreferrer">咕妞妞(293)</a>',
    '皮皮(035)': '<a href="https://wiki.52poke.com/wiki/%E7%9A%AE%E7%9A%AE" target="_blank" rel="noopener noreferrer">皮皮(035)</a>',
    '金铃(433)': '<a href="https://wiki.52poke.com/wiki/%E9%93%83%E9%93%9B%E5%93%8D" target="_blank" rel="noopener noreferrer">铃铛响(433)</a>',
    '勇吉拉(064)': '<a href="https://wiki.52poke.com/wiki/%E5%8B%87%E5%9F%BA%E6%8B%89" target="_blank" rel="noopener noreferrer">勇基拉(064)</a>',
    '电力兽(239)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B5%E5%87%BB%E6%80%AA" target="_blank" rel="noopener noreferrer">电击怪(239)</a>',
    '钢甲小子(304)': '<a href="https://wiki.52poke.com/wiki/%E5%8F%AF%E5%8F%AF%E5%A4%9A%E6%8B%89" target="_blank" rel="noopener noreferrer">可可多拉(304)</a>',
    '龙龙贝(372)': '<a href="https://wiki.52poke.com/wiki/%E7%94%B2%E5%A3%B3%E9%BE%99" target="_blank" rel="noopener noreferrer">甲壳龙(372)</a>',
    '掘地虫(290)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%9F%E5%B1%85%E5%BF%8D%E5%A3%AB" target="_blank" rel="noopener noreferrer">土居忍士(290)</a>',
    '梦拉(215)': '<a href="https://wiki.52poke.com/wiki/%E7%8B%83%E6%8B%89" target="_blank" rel="noopener noreferrer">狃拉(215)</a>',
    '旋尾猫(431)': '<a href="https://wiki.52poke.com/wiki/%E9%AD%85%E5%8A%9B%E5%96%B5" target="_blank" rel="noopener noreferrer">魅力喵(431)</a>',
    '夜魔人(477)': '<a href="https://wiki.52poke.com/wiki/%E9%BB%91%E5%A4%9C%E9%AD%94%E7%81%B5" target="_blank" rel="noopener noreferrer">黑夜魔灵(477)</a>',
    '白海狮(087)': '<a href="https://wiki.52poke.com/wiki/%E7%99%BD%E6%B5%B7%E7%8B%AE" target="_blank" rel="noopener noreferrer">白海狮(087)</a>',
    '樱桃芽(420)': '<a href="https://wiki.52poke.com/wiki/%E6%A8%B1%E8%8A%B1%E5%AE%9D" target="_blank" rel="noopener noreferrer">樱花宝(420)</a>',
    '伯秋狗(261)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%9F%E7%8B%BC%E7%8A%AC" target="_blank" rel="noopener noreferrer">土狼犬(261)</a>',
    '化石盔(140)': '<a href="https://wiki.52poke.com/wiki/%E5%8C%96%E7%9F%B3%E7%9B%94" target="_blank" rel="noopener noreferrer">化石盔(140)</a>',
    '月亮神石(337)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%88%E7%9F%B3" target="_blank" rel="noopener noreferrer">月石(337)</a>',
    '岩神柱(377)': '<a href="https://wiki.52poke.com/wiki/%E9%9B%B7%E5%90%89%E6%B4%9B%E5%85%8B" target="_blank" rel="noopener noreferrer">雷吉洛克(377)</a>',
    '大甲(127)': '<a href="https://wiki.52poke.com/wiki/%E5%87%AF%E7%BD%97%E6%96%AF" target="_blank" rel="noopener noreferrer">凯罗斯(127)</a>',
    '千针豚(211)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%83%E9%92%88%E9%B1%BC" target="_blank" rel="noopener noreferrer">千针鱼(211)</a>',
    '皮可西(036)': '<a href="https://wiki.52poke.com/wiki/%E7%9A%AE%E5%8F%AF%E8%A5%BF" target="_blank" rel="noopener noreferrer">皮可西(036)</a>',
    '草蜥蜴(252)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%A8%E5%AE%88%E5%AE%AB" target="_blank" rel="noopener noreferrer">木守宫(252)</a>',
    '瓦卡火鸡(256)': '<a href="https://wiki.52poke.com/wiki/%E5%8A%9B%E5%A3%AE%E9%B8%A1" target="_blank" rel="noopener noreferrer">力壮鸡(256)</a>',
    '南瓜仙人球(331)': '<a href="https://wiki.52poke.com/wiki/%E5%88%BA%E7%90%83%E4%BB%99%E4%BA%BA%E6%8E%8C" target="_blank" rel="noopener noreferrer">刺球仙人掌(331)</a>',
    '小火鸡(255)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E7%A8%9A%E9%B8%A1" target="_blank" rel="noopener noreferrer">火稚鸡(255)</a>',
    '粘液蜗牛(219)': '<a href="https://wiki.52poke.com/wiki/%E7%86%94%E5%B2%A9%E8%9C%97%E7%89%9B" target="_blank" rel="noopener noreferrer">熔岩蜗牛(219)</a>',
    '凯西(063)': '<a href="https://wiki.52poke.com/wiki/%E5%87%AF%E8%A5%BF" target="_blank" rel="noopener noreferrer">凯西(063)</a>',
    '镜面偶(436)': '<a href="https://wiki.52poke.com/wiki/%E9%93%9C%E9%95%9C%E6%80%AA" target="_blank" rel="noopener noreferrer">铜镜怪(436)</a>',
    '王企鹅(394)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E7%9A%87%E5%AD%90" target="_blank" rel="noopener noreferrer">波皇子(394)</a>',
    '小火龙(004)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%81%AB%E9%BE%99" target="_blank" rel="noopener noreferrer">小火龙(004)</a>',
    '小花兽(153)': '<a href="https://wiki.52poke.com/wiki/%E6%9C%88%E6%A1%82%E5%8F%B6" target="_blank" rel="noopener noreferrer">月桂叶(153)</a>',
    '坚果怪(274)': '<a href="https://wiki.52poke.com/wiki/%E9%95%BF%E9%BC%BB%E5%8F%B6" target="_blank" rel="noopener noreferrer">长鼻叶(274)</a>',
    '迷你龙(147)': '<a href="https://wiki.52poke.com/wiki/%E8%BF%B7%E4%BD%A0%E9%BE%99" target="_blank" rel="noopener noreferrer">迷你龙(147)</a>',
    '叶衣虫(413)': '<a href="https://wiki.52poke.com/wiki/%E7%BB%93%E8%8D%89%E8%B4%B5%E5%A6%87" target="_blank" rel="noopener noreferrer">结草贵妇(413)</a>',
    '小电狮(403)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E7%8C%AB%E6%80%AA" target="_blank" rel="noopener noreferrer">小猫怪(403)</a>',
    '小拳石(074)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E6%8B%B3%E7%9F%B3" target="_blank" rel="noopener noreferrer">小拳石(074)</a>',
    '烈雀(021)': '<a href="https://wiki.52poke.com/wiki/%E7%83%88%E9%9B%80" target="_blank" rel="noopener noreferrer">烈雀(021)</a>',
    '波波海象(363)': '<a href="https://wiki.52poke.com/wiki/%E6%B5%B7%E8%B1%B9%E7%90%83" target="_blank" rel="noopener noreferrer">海豹球(363)</a>',
    '大钳蟹(098)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E9%92%B3%E8%9F%B9" target="_blank" rel="noopener noreferrer">大钳蟹(098)</a>',
    '腕力(066)': '<a href="https://wiki.52poke.com/wiki/%E8%85%95%E5%8A%9B" target="_blank" rel="noopener noreferrer">腕力(066)</a>',
    '幼甲龙(246)': '<a href="https://wiki.52poke.com/wiki/%E5%B9%BC%E5%9F%BA%E6%8B%89%E6%96%AF" target="_blank" rel="noopener noreferrer">幼基拉斯(246)</a>',
    '妙蛙草(002)': '<a href="https://wiki.52poke.com/wiki/%E5%A6%99%E8%9B%99%E8%8D%89" target="_blank" rel="noopener noreferrer">妙蛙草(002)</a>',
    '可拉可拉(104)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%A1%E6%8B%89%E5%8D%A1%E6%8B%89" target="_blank" rel="noopener noreferrer">卡拉卡拉(104)</a>',
    '喵喵(052)': '<a href="https://wiki.52poke.com/wiki/%E5%96%B5%E5%96%B5" target="_blank" rel="noopener noreferrer">喵喵(052)</a>',
    '布比(240)': '<a href="https://wiki.52poke.com/wiki/%E9%B8%AD%E5%98%B4%E5%AE%9D%E5%AE%9D" target="_blank" rel="noopener noreferrer">鸭嘴宝宝(240)</a>',
    '甲盾兽(410)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%BE%E7%94%B2%E9%BE%99" target="_blank" rel="noopener noreferrer">盾甲龙(410)</a>',
    '电电羊(179)': '<a href="https://wiki.52poke.com/wiki/%E5%92%A9%E5%88%A9%E7%BE%8A" target="_blank" rel="noopener noreferrer">咩利羊(179)</a>',
    '夜游灵(355)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%9C%E5%B7%A1%E7%81%B5" target="_blank" rel="noopener noreferrer">夜巡灵(355)</a>',
    '火岚兽(155)': '<a href="https://wiki.52poke.com/wiki/%E7%81%AB%E7%90%83%E9%BC%A0" target="_blank" rel="noopener noreferrer">火球鼠(155)</a>',
    '小海鸥(278)': '<a href="https://wiki.52poke.com/wiki/%E9%95%BF%E7%BF%85%E9%B8%A5" target="_blank" rel="noopener noreferrer">长翅鸥(278)</a>',
    '赛尼珊瑚(222)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%AA%E9%98%B3%E7%8F%8A%E7%91%9A" target="_blank" rel="noopener noreferrer">太阳珊瑚(222)</a>',
    '卡咪龟(008)': '<a href="https://wiki.52poke.com/wiki/%E5%8D%A1%E5%92%AA%E9%BE%9F" target="_blank" rel="noopener noreferrer">卡咪龟(008)</a>',
    '蛋蛋(102)': '<a href="https://wiki.52poke.com/wiki/%E8%9B%8B%E8%9B%8B" target="_blank" rel="noopener noreferrer">蛋蛋(102)</a>',
    '惊角鹿(234)': '<a href="https://wiki.52poke.com/wiki/%E6%83%8A%E8%A7%92%E9%B9%BF" target="_blank" rel="noopener noreferrer">惊角鹿(234)</a>',
    '诺可鳄(158)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E9%94%AF%E9%B3%84" target="_blank" rel="noopener noreferrer">小锯鳄(158)</a>',
    '派拉斯(046)': '<a href="https://wiki.52poke.com/wiki/%E6%B4%BE%E6%8B%89%E6%96%AF" target="_blank" rel="noopener noreferrer">派拉斯(046)</a>',
    '大葱鸭(083)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E8%91%B1%E9%B8%AD" target="_blank" rel="noopener noreferrer">大葱鸭(083)</a>',
    '叶藤蛇(495)': '<a href="https://wiki.52poke.com/wiki/%E8%97%A4%E8%97%A4%E8%9B%87" target="_blank" rel="noopener noreferrer">藤藤蛇(495)</a>',
    '大水鼠(184)': '<a href="https://wiki.52poke.com/wiki/%E7%8E%9B%E5%8A%9B%E9%9C%B2%E4%B8%BD" target="_blank" rel="noopener noreferrer">玛力露丽(184)</a>',
    '长舌怪(463)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A7%E8%88%8C%E8%88%94" target="_blank" rel="noopener noreferrer">大舌舔(463)</a>',
    '3D龙Z(474)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%9A%E8%BE%B9%E5%85%BD%EF%BC%BA" target="_blank" rel="noopener noreferrer">多边兽乙型(474)</a>',
    '亮翅蛾(414)': '<a href="https://wiki.52poke.com/wiki/%E7%BB%85%E5%A3%AB%E8%9B%BE" target="_blank" rel="noopener noreferrer">绅士蛾(414)</a>',
    '大钳虫(207)': '<a href="https://wiki.52poke.com/wiki/%E5%A4%A9%E8%9D%8E" target="_blank" rel="noopener noreferrer">天蝎(207)</a>',
    '毒臭釉(434)': '<a href="https://wiki.52poke.com/wiki/%E8%87%AD%E9%BC%AC%E5%99%97" target="_blank" rel="noopener noreferrer">臭鼬噗(434)</a>',
    '百变怪(132)': '<a href="https://wiki.52poke.com/wiki/%E7%99%BE%E5%8F%98%E6%80%AA" target="_blank" rel="noopener noreferrer">百变怪(132)</a>',
    '刚比兽(446)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%8F%E5%8D%A1%E6%AF%94%E5%85%BD" target="_blank" rel="noopener noreferrer">小卡比兽(446)</a>',
    '毒蟾斗士(453)': '<a href="https://wiki.52poke.com/wiki/%E4%B8%8D%E8%89%AF%E8%9B%99" target="_blank" rel="noopener noreferrer">不良蛙(453)</a>',
    '尼多兰(029)': '<a href="https://wiki.52poke.com/wiki/%E5%B0%BC%E5%A4%9A%E5%85%B0" target="_blank" rel="noopener noreferrer">尼多兰(029)</a>',
    '蓑衣虫(412)': '<a href="https://wiki.52poke.com/wiki/%E7%BB%93%E8%8D%89%E5%84%BF" target="_blank" rel="noopener noreferrer">结草儿(412)</a>',
    '毛球(048)': '<a href="https://wiki.52poke.com/wiki/%E6%AF%9B%E7%90%83" target="_blank" rel="noopener noreferrer">毛球(048)</a>',
    '地龙宝宝(443)': '<a href="https://wiki.52poke.com/wiki/%E5%9C%86%E9%99%86%E9%B2%A8" target="_blank" rel="noopener noreferrer">圆陆鲨(443)</a>',
    '吸盘魔偶(122)': '<a href="https://wiki.52poke.com/wiki/%E9%AD%94%E5%A2%99%E4%BA%BA%E5%81%B6" target="_blank" rel="noopener noreferrer">魔墙人偶(122)</a>',
    '蔓藤怪(114)': '<a href="https://wiki.52poke.com/wiki/%E8%94%93%E8%97%A4%E6%80%AA" target="_blank" rel="noopener noreferrer">蔓藤怪(114)</a>',
    '幼龙蝎(451)': '<a href="https://wiki.52poke.com/wiki/%E9%92%B3%E5%B0%BE%E8%9D%8E" target="_blank" rel="noopener noreferrer">钳尾蝎(451)</a>',
    '胖胖翁(396)': '<a href="https://wiki.52poke.com/wiki/%E5%A7%86%E5%85%8B%E5%84%BF" target="_blank" rel="noopener noreferrer">姆克儿(396)</a>',
    '妙蛙种子(001)': '<a href="https://wiki.52poke.com/wiki/%E5%A6%99%E8%9B%99%E7%A7%8D%E5%AD%90" target="_blank" rel="noopener noreferrer">妙蛙种子(001)</a>',
    '奇科莉塔(152)': '<a href="https://wiki.52poke.com/wiki/%E8%8F%8A%E8%8D%89%E5%8F%B6" target="_blank" rel="noopener noreferrer">菊草叶(152)</a>',
    '侯企鹅(393)': '<a href="https://wiki.52poke.com/wiki/%E6%B3%A2%E5%8A%A0%E6%9B%BC" target="_blank" rel="noopener noreferrer">波加曼(393)</a>',
    '恶魔犬(228)': '<a href="https://wiki.52poke.com/wiki/%E6%88%B4%E9%B2%81%E6%AF%94" target="_blank" rel="noopener noreferrer">戴鲁比(228)</a>',
    '鬼蝉蛹(292)': '<a href="https://wiki.52poke.com/wiki/%E8%84%B1%E5%A3%B3%E5%BF%8D%E8%80%85" target="_blank" rel="noopener noreferrer">脱壳忍者(292)</a>',
    '刺角昆(268)': '<a href="https://wiki.52poke.com/wiki/%E7%9B%BE%E7%94%B2%E8%8C%A7" target="_blank" rel="noopener noreferrer">盾甲茧(268)</a>'
}

const pokemonDictKeys = Object.keys(pokemonDict);

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

function __cookie_getRepairItemThreshold() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD");
    if (value === undefined) {
        return 100;
    }
    return parseInt(value);
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

/**
 * 在页面的最下方构建一个NPC的消息表格。
 * @param npcName NPC名字，对应字典中的预定义
 * @private
 */
function __page_constructNpcMessageTable(npcName) {
    let NPC = _NPC_DICT[npcName];
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

/**
 * 异步读取并解析个人状态中的基础信息，完成后回调传入的函数。
 * @param id ID
 * @param pass PASSWORD
 * @param callback 回调函数
 * @private
 */
function __ajax_readPersonalInformation(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "mydata.cgi",
        data: {id: id, pass: pass, mode: 'STATUS_PRINT'},
        success: function (data) {
            let statusTable = $(data).find('table').first().find('table').first();
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
            let town = $(statusTable.find('td')[31]).text();        // gb2312编码的内容通过ajax请求处理是个讨厌的事情
            let exp = $(statusTable.find('td')[58]).text();
            let goldText = $(statusTable.find('td')[60]).text();
            let gold = goldText.substring(0, goldText.indexOf(" G"));

            let information = {
                "id": id, "pass": pass,
                "LV": level,
                "HP": currentHealth, "MAX_HP": maxHealth, "MP": currentMana, "MAX_MP": maxMana,
                "AT": att, "DF": def, "SA": int, "SD": spi, "SP": spe,
                "EXP": exp, "GOLD": gold
            };
            callback(information);
        }
    });
}

/**
 * 异步读取并解析主页的个人状态，完成后回调传入的函数。
 * @param id ID
 * @param pass PASS
 * @param callback 回调函数
 * @private
 */
function __ajax_readPersonalStatus(id, pass, callback) {
    $.ajax({
        type: "POST",
        url: "status.cgi",
        data: {id: id, pass: pass, mode: "STATUS"},
        success: function (data) {
            let townId = $(data).find('input[name="town"]:first').attr('value');
            let status = {
                "id": id, "pass": pass,
                "TOWN_ID": townId
            };
            callback(status);
        }
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
            for (let i = 0; i < pokemonDictKeys.length; i++) {
                if (newText.includes(pokemonDictKeys[i])) {
                    newText = newText.replace(pokemonDictKeys[i], pokemonDict[pokemonDictKeys[i]]);
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
    $("option[value='LETTER']").text("口袋助手设置");
    $("option[value='LETTER']").attr("style", "background:#20c0ff");
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
    $('#blacksmithButton').attr('value', blacksmithButtonText);
    $('input[value="MY_ARM"]').attr('value', 'MY_ARM2');

    // 修改返回银行按钮的行为，直接变成全部存入
    $('#bankButton').parent().prepend('<input type="hidden" name="azukeru" value="all">');
    $('#bankButton').attr('value', bankButtonText);
    $('input[value="BANK"]').attr('value', 'BANK_SELL');

    // 修改返回住宿按钮
    $('#innButton').attr('value', innButtonText);

    // 修改返回按钮
    $('#returnButton').attr('value', returnButtonText);

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
    } else {
        // 不需要修理按钮
        $('#blacksmithButton').parent().remove();
        var returnCode = __battle_checkIfShouldGoToInn(htmlText, endure);
        if (returnCode == 1) {
            // 住宿优先
            $("#innButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
        }
        if (returnCode == 2) {
            // 存钱优先
            $("#bankButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
        }
        if (returnCode == 3) {
            // 返回优先
            $("#returnButton").attr('tabIndex', 1);
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
    if (depositEveryBattleTimes > 0 && recoverItemEndure % depositEveryBattleTimes == 0) {
        // 存钱战数到了
        return 2;
    }
    var playerName = "";
    var remaingHealth = 0;
    var maxHealth = 0;
    $("td:parent").each(function (index, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf("https://pocketrose.itsns.net.cn/pocketrose/") != -1) {
            // 通过第一个头像找到玩家的名字
            if (playerName == "") {
                playerName = img.attr("alt");
            }
        }
        if (playerName == $(element).text()) {
            var healthElement = $(element).next();
            var healthText = healthElement.text();
            var pos = healthText.indexOf("/");
            remaingHealth = healthText.substring(0, pos - 1);
            maxHealth = healthText.substring(pos + 1);
        }
    });
    // 生命力低于最大值的60%，住宿推荐
    if (remaingHealth <= maxHealth * __cookie_getHealthLoseAutoLodgeRatio()) {
        return 1;
    }
    if (depositEveryBattleTimes > 0) {
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
}

// 城市 -> 宠物图鉴
function __town_petMap(htmlText) {
    __page_constructNpcMessageTable("七七");
    __page_writeNpcMessage("我打小数学就是体育老师教的，学的特别好。数一数图鉴数量这种事，交给我完全没有问题。");

    var petIdText = "";             // 宠物图鉴编号及数量的文本
    $("td:parent").each(function (_i, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf(POCKETROSE_DOMAIN + "/image/386/") != -1) {
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
        __ajax_readPersonalStatus(id, pass, function (status) {
            let townId = status["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ARM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回武器屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnPRO").click(function () {
        __ajax_readPersonalStatus(id, pass, function (status) {
            let townId = status["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "PRO_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回防具屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnACC").click(function () {
        __ajax_readPersonalStatus(id, pass, function (status) {
            let townId = status["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ACC_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回饰品屋");
            $("input[type='submit']").trigger("click");
        });
    });
    $("#returnITM").click(function () {
        __ajax_readPersonalStatus(id, pass, function (status) {
            let townId = status["TOWN_ID"];
            $("form[action='status.cgi']").append("<input type=hidden name=town value=" + townId + ">");
            $("form[action='status.cgi']").append("<input type=hidden name=con_str value=50>");
            $("input[name='mode']").attr("value", "ITEM_SHOP");
            $("form[action='status.cgi']").attr("action", "town.cgi");
            $("input[type='submit']").attr("value", "回物品屋");
            $("input[type='submit']").trigger("click");
        });
    });
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
    $("input:submit[value='返回城市']").attr("id", "returnButton");
    __page_constructNpcMessageTable("夜九年");
    __page_writeNpcMessage("在这里我来协助各位维护本机（浏览器）的口袋相关设置：<br>");

    let b1 = __cookie_getEnablePokemonWiki();
    let s1 = "<select name='s1' id='s1'>";
    s1 += "<option class='o1' value='1'>启用</option>";
    s1 += "<option class='o1' value='0'>禁用</option>";
    s1 += "</select>";
    __page_writeNpcMessage("<li>宝可梦百科超链 " + s1 + " <a href='javascript:void(0)' id='a1'>设置</a></li>");


    let b2 = __cookie_getEnableSoldAutoDeposit();
    let s2 = "<select name='s2' id='s2'>";
    s2 += "<option class='o2' value='1'>启用</option>";
    s2 += "<option class='o2' value='0'>禁用</option>";
    s2 += "</select>";
    __page_writeNpcMessage("<li>售卖后自动存钱 " + s2 + " <a href='javascript:void(0)' id='a2'>设置</a></li>");


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
    __page_writeNpcMessage("<li>掉血后自动住宿 " + s3 + " <a href='javascript:void(0)' id='a3'>设置</a></li>");

    let b4 = __cookie_getRepairItemThreshold();
    let s4 = "<select name='s4' id='s4'>";
    s4 += "<option class='o4' value='10'>耐久10</option>";
    s4 += "<option class='o4' value='20'>耐久20</option>";
    s4 += "<option class='o4' value='50'>耐久50</option>";
    s4 += "<option class='o4' value='100'>耐久100</option>";
    s4 += "</select>";
    __page_writeNpcMessage("<li>修理装备耐久限 " + s4 + " <a href='javascript:void(0)' id='a4'>设置</a></li>");

    $(".o1[value='" + Number(b1) + "']").prop("selected", true);
    $(".o2[value='" + Number(b2) + "']").prop("selected", true);
    $(".o3[value='" + b3 + "']").prop("selected", true);
    $(".o4[value='" + b4 + "']").prop("selected", true);

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
    $("#a4").click(function () {
        Cookies.set("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD", $("#s4").val(), {expires: 36500});
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "LETTER");
        $("#returnButton").trigger("click");
    });
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

// 个人状态 -> 物品使用．装备
function __personalStatus_equipment(htmlText) {
    $("td:parent").each(function (_i, e) {
        if ($(e).text() == "所持金") {
            $(e).parent().parent().append("<tr><td colspan='6' bgcolor='#E8E8D0' id='extMenuLocation'></td></tr>");
        }
    });
    var extMenu = "";
    extMenu += "<li><a href='javascript:void(0)' id='goIntoBag'>进入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='goIntoCage'>进入黄金笼子</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllGemsIntoBag'>所有的宝石放入百宝袋</a></li>"
    extMenu += "<li><a href='javascript:void(0)' id='putAllItemsIntoBag'>所有非必要装备/物品放入百宝袋</a></li>"
    $("#extMenuLocation").html(extMenu);

    $("input[type='checkbox']").each(function (_idx, inputElement) {
        let inputTableCell = $(inputElement).parent();
        let category = $(inputTableCell).next().next().next().text();
        if (category == "武器" || category == "防具" || category == "饰品") {
            // 计算装备满级所需要的最高经验
            let name = $(inputTableCell).next().next().text();
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
        if (category == "武器" || category == "防具" || category == "饰品") {
            if (__utilities_checkIfEquipmentFullExperience(name, power, exp)) {
                let nameHtml = $(td).next().html();
                nameHtml = "<font color='red'><b>[满]</b></font>" + nameHtml;
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