export const DOMAIN = "https://pocketrose.itsns.net.cn/pocketrose";

const POCKET_NPC_IMAGES = {
    "老板娘": DOMAIN + "/image/etc/30.gif",
    "饭饭": DOMAIN + "/image/head/3139.gif"
};

export function getNPCImageHTML(name) {
    const image = POCKET_NPC_IMAGES[name];
    if (image === undefined) {
        return undefined;
    }
    return "<img src='" + image + "' width='64' height='64' alt='" + name + "'>";
}