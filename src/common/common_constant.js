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