/**
 * ============================================================================
 * [ 工 具 模 块 ]
 * ----------------------------------------------------------------------------
 * 对js不熟，如果有现成的函数，就尽量替换。
 * ============================================================================
 */

export function substringBefore(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(0, idx);
}

export function substringAfter(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(idx + searchString.length);
}

export function substringBetween(text, leftString, rightString) {
    return substringBefore(substringAfter(text, leftString), rightString);
}

export function substringBeforeSlash(text) {
    if (text.includes(" /")) {
        return substringBefore(text, " /");
    }
    if (text.includes("/")) {
        return substringBefore(text, "/");
    }
    return text;
}

export function substringAfterSlash(text) {
    if (text.includes("/ ")) {
        return substringAfter(text, "/ ");
    }
    if (text.includes("/")) {
        return substringAfter(text, "/");
    }
    return text;
}

export function latencyExecute(timeout, handler) {
    if ($("#count_up_timer").length > 0) {
        let count = timeout / 1000;
        const timer = setInterval(function () {
            $("#count_up_timer").text(Math.max(count--, 0));
        }, 1000);
        setTimeout(function () {
            clearInterval(timer);
            $("#count_up_timer").text("-");
            handler();
        }, timeout);
    } else {
        setTimeout(handler, timeout);
    }
}

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