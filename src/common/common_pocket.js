import * as util from "./common_util";

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