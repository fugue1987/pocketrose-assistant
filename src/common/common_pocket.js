import * as util from "./common_util";
import * as pocket from "../pocket";

export const DOMAIN = "https://pocketrose.itsns.net.cn/pocketrose";

const POCKET_NPC_IMAGES = {
    "武器屋老板娘": DOMAIN + "/image/etc/27.gif",
    "客栈老板娘": DOMAIN + "/image/etc/30.gif",

    "花子": DOMAIN + "/image/head/1126.gif",
    "骷髅": DOMAIN + "/image/head/1160.gif",
    "夜九年": DOMAIN + "/image/head/1561.gif",
    "饭饭": DOMAIN + "/image/head/3139.gif",
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

export const NPC_DEFINITION = {
    '夜九年': {
        'image': pocket.DOMAIN + '/image/head/1561.gif',
        'intro': ''
    },
    '夜苍凉': {
        'image': pocket.DOMAIN + '/image/head/1117.gif',
        'intro': ''
    },
    '青鸟': {
        'image': pocket.DOMAIN + '/image/head/7184.gif',
        'intro': ''
    },
    '末末': {
        'image': pocket.DOMAIN + '/image/head/8173.gif',
        'intro': ''
    },
    '白皇': {
        'image': pocket.DOMAIN + '/image/head/11134.gif',
        'intro': ''
    },
    '七七': {
        'image': pocket.DOMAIN + '/image/head/1368.gif',
        'intro': ''
    },
    '妮可': {
        'image': pocket.DOMAIN + '/image/head/4237.gif',
        'intro': ''
    },
    '花子': {
        'image': pocket.DOMAIN + '/image/head/1126.gif',
        'intro': ''
    }
};

export function getNPC(name) {
    return NPC_DEFINITION[name];
}

/**
 * NPC数据结构
 */
export class NPC {

    #name;
    #code;

    constructor(name, code) {
        this.#name = name;
        this.#code = code;
    }

    get name() {
        return this.#name;
    }

    get code() {
        return this.#code;
    }

    get imageHTML() {
        const portrait = pocket.DOMAIN + "/image/head/" + this.#code + ".gif";
        return "<img src='" + portrait + "' width='64' height='64' id='npc_" + this.#code + "' alt='" + this.#name + "'>";
    }
}

const NPCS = {
    "夜九年": new NPC("夜九年", "1561"),
    "夜苍凉": new NPC("夜苍凉", "1117"),
    "青鸟": new NPC("青鸟", "7184"),
    "末末": new NPC("末末", "8173"),
    "白皇": new NPC("白皇", "11134"),
    "七七": new NPC("七七", "1368"),
    "妮可": new NPC("妮可", "4237"),
    "钱小小": new NPC("钱小小", "1567"),
    "花子": new NPC("花子", "1126"),
    "饭饭": new NPC("饭饭", "3139"),
    "Hind": new NPC("Hind", "7179"),
};

export function _old_loadNPC(name) {
    return NPCS[name];
}