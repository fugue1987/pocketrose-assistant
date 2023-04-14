/**
 * ============================================================================
 * [ 角 色 相 关 功 能 模 块 ]
 * ----------------------------------------------------------------------------
 * 1. 角色数据结构定义
 * ============================================================================
 */

import * as geo from "./geo";
import * as network from "./network";
import * as pocket from "./pocket";
import * as util from "./util";

export class Role {

    _name;              // 角色姓名
    _location;          // 所在位置(TOWN|CASTLE|WILD)
    _coordinate;        // 所在坐标(location=CASTLE)
    _castleName;        // 城堡名称(location=CASTLE)
    _townName;          // 城市名称(location=TOWN)

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

/**
 * Load role of specified credential.
 * @param credential User credential.
 * @returns {Role}
 */
export function loadRole(credential) {
    const role = new Role();
    const doLoadRole = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "STATUS_PRINT";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                resolve(html);
            });
        });
    };
    const doParseRole = (role, html) => {
        $(html).find("td").each(function (_idx, td) {
            const text = $(td).text();
            if (text.startsWith("姓名 ：")) {
                let s = util.substringAfter(text, "姓名 ： ");
                s = util.substringBefore(s, " (");
                role.name = s;
            }
            if (text === "现在位置") {
                const locationText = $(td).next().text();
                if (locationText.includes("(") && locationText.includes(")")) {
                    // 在城堡
                    role.location = "CASTLE";
                    const s = util.substringBetween(locationText, "(", ")");
                    const x = util.substringBefore(s, ",");
                    const y = util.substringAfter(s, ",");
                    role.coordinate = new geo.Coordinate(parseInt(x), parseInt(y));
                    role.castleName = util.substringBefore(locationText, " (");
                } else {
                    // 在城市或者野外
                    if (locationText === "野外") {
                        role.location = "WILD";
                    } else {
                        role.location = "TOWN";
                        const town = pocket.findTownByName(locationText);
                        if (town !== undefined) {
                            role.coordinate = town.coordinate;
                            role.townName = town.name;
                        }
                    }
                }
            }
        });
    };

    doLoadRole(credential).then(html => {
        doParseRole(role, html);
    });

    return role;
}