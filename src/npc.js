import * as pocket from "./pocket";

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
    "饭饭": new NPC("饭饭", "3139")
};

export function loadNPC(name) {
    return NPCS[name];
}