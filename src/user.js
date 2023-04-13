/**
 * ============================================================================
 * [ 用 户 相 关 功 能 ]
 * ============================================================================
 */

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
     * @returns string
     */
    get id() {
        return this.#id;
    }

    /**
     * Get credential pass property.
     * @returns string
     */
    get pass() {
        return this.#pass;
    }

}

