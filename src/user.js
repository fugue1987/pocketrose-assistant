/**
 * ============================================================================
 * [ 用 户 相 关 功 能 ]
 * ============================================================================
 */

import * as pocket from "./pocket";
import * as map from "./map";
import * as network from "./network";
import * as util from "./util";

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

export class Role {

    _location;
    _coordinate;
    _castleName;
    _townName;

    constructor() {
    }

    get location() {
        return this._location;
    }

    set location(value) {
        this._location = value;
    }

    get coordinate() {
        return this._coordinate;
    }

    set coordinate(value) {
        this._coordinate = value;
    }

    get castleName() {
        return this._castleName;
    }

    set castleName(value) {
        this._castleName = value;
    }

    get townName() {
        return this._townName;
    }

    set townName(value) {
        this._townName = value;
    }
}

export class RoleLoader {

    #credential;

    constructor(credential) {
        this.#credential = credential;
    }

    load(callback) {
        const roleLoader = this;
        const request = this.#credential.asRequest();
        request["mode"] = "STATUS_PRINT";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            const role = new Role();
            $("td:parent").each(function (_idx, td) {
                const text = $(td).next();
                if (text === "现在位置") {
                    roleLoader.#parseLocation(role, $(td).next().text());
                }
            });
            if (callback !== undefined) {
                callback(role);
            }
        });
    }

    #parseLocation(role, text) {
        if (text.includes("(") && text.includes(")")) {
            // 在城堡
            role.location("CASTLE");
            const s = util.substringBetween(text, "(", ")");
            const x = util.substringBefore(s, ",");
            const y = util.substringAfter(s, ",");
            role.coordinate(new map.Coordinate(parseInt(x), parseInt(y)));
            role.castleName(util.substringBefore(text, " ("));
        } else {
            // 在城市或者野外
            if (text === "野外") {
                role.location("WILD");
            } else {
                role.location("TOWN");
                const town = pocket.findTownByName(text);
                if (town !== undefined) {
                    role.coordinate(town.coordinate);
                    role.townName(town.name);
                }
            }
        }
    }
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
    "花子": new NPC("花子", "1126"),
    "饭饭": new NPC("饭饭", "3139")
};

export function loadNPC(name) {
    return NPCS[name];
}