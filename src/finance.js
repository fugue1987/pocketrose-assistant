/**
 * ============================================================================
 * [ 资 金 相 关 模 块 ]
 * ----------------------------------------------------------------------------
 * 1. castleWithdraw = 从城堡取钱
 * ============================================================================
 */

import * as network from "./network";

export const castleWithdraw = (credential, amount) => {
    return new Promise((resolve) => {
        const request = credential.asRequest();
        request["mode"] = "CASTLEBANK_BUY";
        request["dasu"] = amount;
        network.sendPostRequest("castle.cgi", request, function () {
            resolve();
        });
    });
}

