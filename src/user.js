/**
 * ============================================================================
 * [ 用 户 相 关 功 能 ]
 * ============================================================================
 */

import * as pocket from "./pocket";
import * as network from "./network";
import * as util from "./util";

export class Role {

    _name;
    _location;
    _coordinate;
    _castleName;
    _townName;

    constructor() {
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
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
            $(html).find("td").each(function (_idx, td) {
                const text = $(td).text();
                if (text.startsWith("姓名 ：")) {
                    roleLoader.#parseName(role, text);
                }
                if (text === "现在位置") {
                    roleLoader.#parseLocation(role, $(td).next().text());
                }
            });
            if (callback !== undefined) {
                callback(role);
            }
        });
    }

    #parseName(role, text) {
        let s = util.substringAfter(text, "姓名 ： ");
        s = util.substringBefore(s, " (");
        role.name = s;
    }

    #parseLocation(role, text) {
        if (text.includes("(") && text.includes(")")) {
            // 在城堡
            role.location = "CASTLE";
            const s = util.substringBetween(text, "(", ")");
            const x = util.substringBefore(s, ",");
            const y = util.substringAfter(s, ",");
            role.coordinate = new util.Coordinate(parseInt(x), parseInt(y));
            role.castleName = util.substringBefore(text, " (");
        } else {
            // 在城市或者野外
            if (text === "野外") {
                role.location = "WILD";
            } else {
                role.location = "TOWN";
                const town = pocket.findTownByName(text);
                if (town !== undefined) {
                    role.coordinate = town.coordinate;
                    role.townName = town.name;
                }
            }
        }
    }
}

