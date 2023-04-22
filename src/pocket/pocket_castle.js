import * as network from "../network";
import * as util from "../common/util";
import * as geo from "../geo";

/**
 * 城堡的数据结构
 */
export class PocketCastle {

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

    longText() {
        return this.#name + "/" + this.#owner + "/" + this.#coordinate.longText();
    }
}

/**
 * 读取所有的城堡信息并回调。
 * @param callback 回调函数
 */
function getAllCastles(callback) {

    network.sendGetRequest("castle_print.cgi", function (html) {

        const castles = {};

        $(html).find("td").each(function (_idx, td) {
            const text = $(td).text();
            if (text.endsWith(" (自购)")) {
                const name = $(td).prev().text();
                const owner = text.substring(0, text.indexOf(" (自购)"));
                let location = $(td).next().text();
                location = util.substringBetween(location, "(", ")");
                let x = util.substringBefore(location, ",");
                let y = util.substringAfter(location, ",");
                const coordinate = new geo.Coordinate(parseInt(x), parseInt(y));
                castles[owner] = new PocketCastle(name, owner, coordinate);
            }
        });

        callback(castles);
    });
}

/**
 * 根据姓名查找对应的城堡信息
 * @param player 姓名
 * @returns {Promise<PocketCastle>}
 */
export async function loadCastle(player) {
    const doLoadCastle = (player) => {
        return new Promise((resolve) => {
            getAllCastles(function (castles) {
                const castle = castles[player];
                resolve(castle);
            });
        });
    };
    return await doLoadCastle(player);
}