import {Coordinate} from "../common/common_util";

/**
 * 口袋城市数据结构
 */
export class Town {

    #id;
    #name;
    #description;
    #coordinate;

    constructor(id, name, description, coordinate) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#coordinate = coordinate;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

    /**
     * Return town coordinate.
     * @returns {Coordinate}
     */
    get coordinate() {
        return this.#coordinate;
    }

    longText() {
        return "(" + this.#id + ") " + this.#name + " " + this.#coordinate.longText();
    }
}

export const TOWNS = {
    "1": new Town("1", "贤者之城",
        "精灵族的王都，在精灵语中意为山谷中的隐居之城，因数位异族出身的贤者都选择在此谢世而得名。种植着珍贵草药的山谷另一端有巨大的水坝，传说曾三次以毁灭性方式成功驱赶妄图入侵的军队。",
        new Coordinate(14, 0)),

    "2": new Town("2", "翡冷翠",
        "大陆西海岸城市， 著名的纺织业都市，也有可耕作的土地以及贸易的港口，农业和商业都比较发达，故而坎德人的事业长存。",
        new Coordinate(1, 11)),

    "3": new Town("3", "诺曼",
        "滨海城市，曾是大陆最大的造船业基地，后因战火而数度覆没，现在虽然仍建造船只，但规模远逊昔日。",
        new Coordinate(2, 12)),

    "4": new Town("4", "潘帕斯",
        "肥沃的土地，丰富的水源，传统型农业都市也一直是粮棉产地和经济发达地区。素有“大陆粮仓”及“天府之国”之称。自古有在二月举行祭拜农神五旬节庆典。而九月举行的大型农牧业交易会也是整个大陆最繁盛的聚会之一。",
        new Coordinate(3, 8)),

    "5": new Town("5", "卡鲁",
        "山顶矮人的重要居城要塞，依山而筑坚固无比，在这里曾掀起过高山矮人和丘陵矮人手足阋墙的矮人门战役。",
        new Coordinate(1, 6)),

    "6": new Town("6", "格林尼治",
        "自称是人类最古老的村落，因临近矮人王国而时常成为斗争的前源，传统上从事护送商队穿越沙漠的工作，但信誉始终是最大问题。",
        new Coordinate(1, 3)),

    "7": new Town("7", "萨拉镇",
        "多种族混居的城市，各种珍稀物品的输入输出地，唯一即使在战争中也会全年都对其他种族开放的城市，尽管如此，仍然能感到某种难以言明的不调合感。",
        new Coordinate(3, 5)),

    "8": new Town("8", "海文",
        "矮人族连接山区和草原的重要中转站，春季会在附近原野举行大型交易会，是无论什么种族也会受到平等接待的地方。",
        new Coordinate(4, 11)),

    "9": new Town("9", "黄昏之都",
        "精灵们称呼此地为“艾本德”精灵语意为“神圣的黄昏”。据说环绕城市的一草一木都是古代精灵的化身，在此地时常可见到上年纪的精灵，足以证明精灵并非不老不死，在精灵族的传说中，此地将是本族最终安睡之地。",
        new Coordinate(5, 14)),

    "10": new Town("10", "圣克鲁斯堡",
        "旧神殿所在之地，新旧城都充满魅力，既是著名观光都市，也是重要的宗教圣地，这里有着全大陆信仰的中心“光之神殿”。",
        new Coordinate(5, 6)),

    "11": new Town("11", "泰法城",
        "精灵所修建的完整灌溉系统的农业城市，重要的粮食蔬果生产地，此地出产的各种水果酒都享有盛名，每年夏末举行的祭典会有限制的邀请其他种族成员参加，这对向来以自傲排他的精灵传统而言已经是相当开放的行为了。",
        new Coordinate(5, 8)),

    "12": new Town("12", "枫丹",
        "原帝国冬都，又名白露城，号称四百年无战之都。大陆联合商会所在地，无数传说的源头，号称大冒险大恋爱的起点。",
        new Coordinate(6, 10)),

    "13": new Town("13", "自由港_赞特",
        "大陆南岸著名的自由城市，也是全大陆最大的贸易港。不属于大陆任何势力，由当地人组成的三级议会管理着城市，拥有绝对的自治。自古就流传着在此能通过各种渠道买到各种你所能想象以及想象不到的东西。",
        new Coordinate(5, 0)),

    "14": new Town("14", "火之都",
        "军事化气氛浓厚的矮人都市，热火朝天的锻造之城，因为临近火山口，故得此名，囤积的兵器充斥山腹改造的仓库。",
        new Coordinate(5, 2)),

    "15": new Town("15", "土之域",
        "山中小都市,露出地面的矮人都市，传说为人类遗留，但地点却远离人类文明影响的范围，接近地精族，故而专攻兵器装饰用宝石的研磨。",
        new Coordinate(10, 2)),

    "16": new Town("16", "瓦伦要塞",
        "边境要塞, 因邻接半兽人土地，军事化气氛浓厚，几乎是全男子编制的要塞都市，但重要的食粮输入也是通 过此地进行，所以时常充满着怪异的紧张气氛。",
        new Coordinate(11, 11)),

    "17": new Town("17", "梵",
        "居住着人马族重要长老的小城，洋溢着仿佛时光停滞般悠闲气氛的山中秘境，人马族的贤者之塔也建造在此，因为其中藏着重要的预言书，故而对其他种族严格戒备。",
        new Coordinate(7, 3)),

    "18": new Town("18", "日尔曼尼亚",
        "野蛮人重要的据点，虽然生活着半数以上的平民，同时也是半军事化的壁垒，秋季有长达半个月的狩猎大会。",
        new Coordinate(7, 8)),

    "19": new Town("19", "水之城",
        "又称“废弃的水之城壁”，在与大湖连接的村子里，有着明显是人类遗迹的建筑，被当作是便利的集会场所使用着，传说这里有半兽人唯一的藏书室。",
        new Coordinate(9, 5)),

    "20": new Town("20", "埃达",
        "防备着矮人城市圈的小型要塞，地震曾多次摧毁整个城市，目前的城市建造在矮人族废弃的矿洞之中，大概会因为维持费过高被放弃吧。",
        new Coordinate(11, 5)),

    "21": new Town("21", "柯利亚",
        "和矮人都市圈连接的小城市，农耕传统悠久，盛产香菜之类的烹饪用料，饮食业发达，目前正致力推广清淡素食。",
        new Coordinate(12, 4)),

    "22": new Town("22", "格兰特",
        "人马族密语中伟大的意思，是极为独特的人马族栖息之地，宁静的学问之都，有整个大陆最大的图书馆和第 一代大魔法师爱德华的陵墓，发现温泉后，也逐渐发展起疗养旅游业。",
        new Coordinate(11, 7)),

    "23": new Town("23", "斯坎",
        "最靠近食人魔所在的城市，由纯法师血统者构成的研究者群体建造，为的是就近监视、研究最古老的食人魔 种族，又称\"性格扭曲者之城\"。",
        new Coordinate(10, 8)),

    "24": new Town("24", "龙牙堡",
        "又名龙之牙，野蛮人，人类和其他种族战争中建立的要塞，城市盘踞建造在山岩上，因地势险要，历来在此发生的战斗不计其数。死伤者鲜血早已渗透了要塞附近的土壤，远远望去，裸露的岩石形貌狰狞，周围隐透血色，宛如泣血龙牙。",
        new Coordinate(8, 9)),

    "25": new Town("25", "海布里",
        "半兽人 贝里萨利乌斯族生活的集落，是半兽人中最为勇猛、尚武的一支，如今正遭遇百年不遇的人口锐减，百年前曾和人类共同作战，据信村中仍有混血的后代，出产美酒，被誉为大陆第一的珍酿。",
        new Coordinate(7, 11)),

    "26": new Town("26", "风之谷",
        "又一邻接人马族据点的村落，非常偏僻隐蔽，传说中三族勇者用来存放光明神器的地点，唯有神器仍在，才能镇丄压黑暗势力卷土重来，奇妙的是矮人族却将此地视为不祥之地。",
        new Coordinate(8, 12)),

    "27": new Town("27", "不归森林",
        "传说最初是吞噬无数人性命的黑色森林，又传是埋葬着化身为魔的战败神的坟墓，但是真相已经湮没在历史和频繁发生的地震中，因为设有保护性禁制结界，所以体力系和黑暗系在此地进行战斗会很吃亏。",
        new Coordinate(9, 13)),

    "28": new Town("28", "特罗尔",
        "以神话中的食人巨妖命名的城市，地处沙漠区内最外侧绿州边缘，是唯一非人类占多数的人类都市，又称暗 之都，在食人魔的势力圈里奇妙地存在着，流行着既非人类又非食人魔共存不可思议的生活方式。",
        new Coordinate(13, 14))
};

export function getTownByCoordinate(coordinate) {
    const townIds = Object.keys(TOWNS);
    for (let i = 0; i < townIds.length; i++) {
        const townId = townIds[i];
        const town = TOWNS[townId];
        if (town.coordinate.equals(coordinate)) {
            return town;
        }
    }
    return null;
}

export function getTownsAsList() {
    return Object.values(TOWNS);
}

/**
 * Get town by specified id.
 * @param townId
 * @returns {undefined|Town}
 */
export function getTown(townId) {
    return TOWNS[townId];
}

/**
 * Find town by name.
 * @param name town name.
 * @returns {undefined|Town}
 */
export function findTownByName(name) {
    const townList = getTownsAsList();
    for (let i = 0; i < townList.length; i++) {
        const town = townList[i];
        if (name.includes(town.name)) {
            return town;
        }
    }
    return undefined;
}

export function findTownBySecret(secret) {
    const candidates = [];
    const townIds = Object.keys(TOWNS);
    for (const townId of townIds) {
        const town = TOWNS[townId];
        if (town.description.includes(secret)) {
            candidates.push(town);
        }
    }
    return candidates;
}

export function generateTownSelectionTableStyleB() {
    let html = "";
    html += "<table style='background-color:#888888;width:100%'><tbody style='background-color:#F8F0E0'>";
    html += "<tr>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "<th style='background-color:#E8E8D0'>选择</th>" +
        "<th style='background-color:#EFE0C0'>目的地</th>" +
        "<th colspan='2' style='background-color:#E0D0B0'>坐标</th>" +
        "</tr>";


    const townList = getTownsAsList();
    for (let i = 0; i < 7; i++) {
        const row = [];
        row.push(townList[i * 4]);
        row.push(townList[i * 4 + 1]);
        row.push(townList[i * 4 + 2]);
        row.push(townList[i * 4 + 3]);

        html += "<tr>";
        for (let j = 0; j < row.length; j++) {
            const town = row[j];
            html += "<td style='background-color:#E8E8D0'><input type='radio' class='townClass' name='townId' value='" + town.id + "'></td>";
            html += "<td style='background-color:#EFE0C0'>" + town.name + "</td>";
            html += "<td style='background-color:#E0D0B0'>" + town.coordinate.x + "</td>";
            html += "<td style='background-color:#E0D0B0'>" + town.coordinate.y + "</td>";
        }
        html += "</tr>";
    }

    html += "</tbody></table>";
    html += "<br>";

    return html;
}