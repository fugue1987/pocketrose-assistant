/**
 * ============================================================================
 * [ 资 金 相 关 模 块 ]
 * ----------------------------------------------------------------------------
 * # depositIntoTownBank = 存入城市银行
 * # withdrawFromTownBank = 从城市银行取钱
 * # withdrawFromCastleBank = 从城堡取钱
 * ============================================================================
 */

import * as message from "./message";
import * as network from "./common/common_network";

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
 * @returns {Promise<void>}
 */
export async function depositIntoTownBank(credential, amount) {
    const doDeposit = (credential, amount) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "BANK_SELL";
            if (amount === undefined) {
                request["azukeru"] = "all";
                network.sendPostRequest("town.cgi", request, function () {
                    message.publishMessageBoard(message._message_town_deposit);
                    resolve();
                });
            } else {
                if (amount <= 0) {
                    resolve();
                } else {
                    request["azukeru"] = amount;
                    network.sendPostRequest("town.cgi", request, function () {
                        message.publishMessageBoard(message._message_town_deposit, {"amount": amount});
                        resolve();
                    });
                }
            }
        });
    };
    await doDeposit(credential, amount);
}

/**
 * 从城市银行取钱
 * @param credential 用户凭证
 * @param amount 取钱的金额，单位万
 * @returns {Promise<void>}
 */
export async function withdrawFromTownBank(credential, amount) {
    const doWithdrawFromTownBank = (credential, amount) => {
        return new Promise((resolve) => {
            if (amount === undefined || amount <= 0) {
                resolve();
            } else {
                const request = credential.asRequest();
                request["mode"] = "BANK_BUY";
                request["dasu"] = amount;
                network.sendPostRequest("town.cgi", request, function () {
                    message.publishMessageBoard(message._message_town_withdraw, {"amount": amount});
                    resolve();
                });
            }
        });
    };
    await doWithdrawFromTownBank(credential, amount);
}

/**
 * 从城堡取钱
 * @param credential 用户凭证
 * @param amount 取钱的金额
 * @returns {Promise<void>}
 */
export async function withdrawFromCastleBank(credential, amount) {
    const doWithdrawFromCastleBank = (credential, amount) => {
        return new Promise((resolve) => {
            if (amount === undefined || amount <= 0) {
                resolve();
            } else {
                const request = credential.asRequest();
                request["mode"] = "CASTLEBANK_BUY";
                request["dasu"] = amount;
                network.sendPostRequest("castle.cgi", request, function () {
                    message.publishMessageBoard(message._message_castle_withdraw, {"amount": amount});
                    resolve();
                });
            }
        });
    }
    await doWithdrawFromCastleBank(credential, amount);
}
