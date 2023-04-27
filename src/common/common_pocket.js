import * as util from "./common_util";

export const DOMAIN = "https://pocketrose.itsns.net.cn/pocketrose";

export const POCKET_NPC_IMAGES = {
    "武器屋老板娘": DOMAIN + "/image/etc/27.gif",
    "客栈老板娘": DOMAIN + "/image/etc/30.gif",

    "夜三": DOMAIN + "/image/head/1117.gif",
    "花子": DOMAIN + "/image/head/1126.gif",
    "骨头": DOMAIN + "/image/head/1160.gif",
    "七七": DOMAIN + "/image/head/1368.gif",
    "夜九": DOMAIN + "/image/head/1561.gif",
    "路路": DOMAIN + "/image/head/2201.gif",
    "饭饭": DOMAIN + "/image/head/3139.gif",
    "亲戚": DOMAIN + "/image/head/3188.gif",
    "莫莫": DOMAIN + "/image/head/4200.gif",
    "青鸟": DOMAIN + "/image/head/7184.gif",
    "末末": DOMAIN + "/image/head/8173.gif",
    "白皇": DOMAIN + "/image/head/11134.gif"
};

export function getNPCImageHTML(name) {
    const image = POCKET_NPC_IMAGES[name];
    if (image === undefined) {
        return undefined;
    }
    let s = util.substringAfterLast(image, "/");
    s = util.substringBefore(s, ".gif");
    return "<img src='" + image + "' width='64' height='64' alt='" + name + "' id='p_" + s + "'>";
}

export const _PROHIBIT_SELLING_ITEM_DICT = [
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
    "玉佩"
];

export function isProhibitSellingItem(name) {
    if (name === undefined || name === "") {
        return false;
    }
    for (let i = 0; i < _PROHIBIT_SELLING_ITEM_DICT.length; i++) {
        const it = _PROHIBIT_SELLING_ITEM_DICT[i];
        if (name.endsWith(it)) {
            return true;
        }
    }
    return false;
}

/**
 * ============================================================================
 * [ 口 袋 的 相 关 定 义 ]
 * ============================================================================
 */

export const _CITY_DICT = {
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
export const _WEAPON_DICT = [
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
export const _ARMOR_DICT = [
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
export const _ACCESSORY_DICT = [
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
export function isUnavailableTreasureHintMap(x, y) {
    if (x < 0 || y < 0) {
        return true;
    }
    return __isCityCoordinate(x, y);
}
