/**
 * Credential data structure for describing id/pass fetched from HTML.
 */
export class Credential {

    readonly #id;
    readonly #pass;

    constructor(id: string, pass: string) {
        this.#id = id;
        this.#pass = pass;
    }

    /**
     * Get credential id property.
     * @returns {string}
     */
    get id(): string {
        return this.#id;
    }

    /**
     * Get credential pass property.
     * @returns {string}
     */
    get pass(): string {
        return this.#pass;
    }

    /**
     * Convert credential to request map.
     * @returns {{id:string, pass:string}}
     */
    asRequest() {
        return {"id": this.#id, "pass": this.#pass};
    }
}