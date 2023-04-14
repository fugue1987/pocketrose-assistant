/**
 * ============================================================================
 * [ 用 户 相 关 功 能 ]
 * ============================================================================
 */

import * as pocket from "./pocket";
import * as network from "./network";
import * as util from "./util";
import {Coordinate} from "./geo";
import {Role} from "./role";

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
            role.coordinate = new Coordinate(parseInt(x), parseInt(y));
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

