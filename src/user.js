/**
 * ============================================================================
 * [ 用 户 相 关 功 能 ]
 * ============================================================================
 */

import * as pocket from "./pocket";

/**
 * Credential data structure for describing id/pass fetched from HTML.
 */
export class Credential {

    #id;
    #pass;

    constructor(id, pass) {
        this.#id = id;
        this.#pass = pass;
    }

    /**
     * Get credential id property.
     * @returns {string}
     */
    get id() {
        return this.#id;
    }

    /**
     * Get credential pass property.
     * @returns {string}
     */
    get pass() {
        return this.#pass;
    }

    asRequest() {
        return {"id": this.#id, "pass": this.#pass};
    }
}

/**
 * Generate Credential object from current HTML form.
 * @returns {Credential}
 */
export function generateCredential() {
    let id = $("input:hidden[name='id']:first").attr("value");
    let pass = $("input:hidden[name='pass']:first").attr("value");
    return new Credential(id, pass);
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
        return "<img src='" + portrait + "' width='64' height='64' alt='" + this.#name + "'>";
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
    "花子": new NPC("花子", "1126")
};

export function loadNPC(name) {
    return NPCS[name];
}