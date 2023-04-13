/**
 * ============================================================================
 * [ 口 袋 的 相 关 定 义 ]
 * ============================================================================
 */

export const DOMAIN = "https://pocketrose.itsns.net.cn/pocketrose";

/**
 * 口袋城市数据结构
 */
export class Town {

    #id;
    #name;
    #description;
    #coordinate;

    constructor(id, name, description, coordinate) {
        this.#id = id;
        this.#name = name;
        this.#description = description;
        this.#coordinate = coordinate;
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get description() {
        return this.#description;
    }

    get coordinate() {
        return this.#coordinate;
    }

    longText() {
        return "(" + this.#id + ") " + this.#name + " " + this.#coordinate.longText();
    }
}