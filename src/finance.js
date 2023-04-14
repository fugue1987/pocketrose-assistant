/**
 * ============================================================================
 * [ 资 金 相 关 模 块 ]
 * ----------------------------------------------------------------------------
 * 1. withdrawFromCastleBank = 从城堡取钱
 * ============================================================================
 */

import * as network from "./network";

/**
 * 计算现金和期望值的差额数量（单位万）
 * @param cash
 * @param expect
 */
export function calculateCashDifferenceAmount(cash, expect) {
    if (cash >= expect) {
        return 0;
    }
    return Math.ceil((expect - cash) / 10000);
}

/**
 * 存钱到城市的银行
 * @param credential 用户凭证
 * @param amount 存入金额，undefined意味全部存入
 */
export function depositIntoTownBank(credential, amount) {
    if (amount !== undefined && amount < 0) {
        return;
    }
    const doDeposit = (credential, amount) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "BANK_SELL";
            if (amount !== undefined) {
                request["azukeru"] = amount;
            } else {
                request["azukeru"] = "all";
            }
            network.sendPostRequest("town.cgi", request, function () {
                resolve();
            });
        });
    };
    doDeposit(credential, amount).then();
}

/**
 * 从城堡取钱
 * @param credential 用户凭证
 * @param amount 取钱的金额
 */
export function withdrawFromCastleBank(credential, amount) {
    if (amount === undefined || amount <= 0) {
        return;
    }
    const doWithdrawFromCastleBank = (credential, amount) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "CASTLEBANK_BUY";
            request["dasu"] = amount;
            network.sendPostRequest("castle.cgi", request, function () {
                resolve();
            });
        });
    }
    doWithdrawFromCastleBank(credential, amount).then();
}
