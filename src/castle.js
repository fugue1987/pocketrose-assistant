/**
 * ============================================================================
 * [ 城 堡 相 关 功 能 ]
 * ============================================================================
 */

import * as map from "./map";
import * as network from "./network";

/**
 * 城堡的数据结构
 */
export class Castle {

    #name;              // 城堡名字
    #owner;             // 城堡主人
    #coordinate;        // 城堡坐标

    constructor(name, owner, coordinate) {
        this.#name = name;
        this.#owner = owner;
        this.#coordinate = coordinate;
    }

    /**
     * Get castle name.
     * @returns {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * Get castle owner.
     * @returns {string}
     */
    get owner() {
        return this.#owner;
    }

    /**
     * Get castle _coordinate
     * @returns {Coordinate}
     */
    get coordinate() {
        return this.#coordinate;
    }
}

/**
 * 读取所有的城堡信息并回调。
 * @param callback 回调函数
 */
export function getAllCastles(callback) {

    network.sendGetRequest("", function (html) {

        const castles = {};

        $(html).find("td").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith(" (自购)")) {
                const name = $(td).prev().text();
                const owner = text.substring(0, text.indexOf(" (自购)"));
                const location = $(td).next().text();
                const parsedLocation = location.substring(1, location.length - 1).split(",");
                const coordinate = new map.Coordinate(parseInt(parsedLocation[0]), parseInt(parsedLocation[1]));
                castles[owner] = new Castle(name, owner, location);
            }
        });

        callback(castles, {"html": html});
    });
}
