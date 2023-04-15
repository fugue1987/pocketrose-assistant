/**
 * ============================================================================
 * [ 地 图 移 动 相 关 功 能 模 块 ]
 * ============================================================================
 */

export class MoveEventManager {

    #listener;

    constructor(listener) {
        this.#listener = listener;
    }

    publishEvent(id, data) {
        this.#listener(id, data);
    }

}