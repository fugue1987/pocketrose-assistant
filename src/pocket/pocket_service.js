/**
 * ============================================================================
 * [ 口 袋 服 务 模 块 ]
 * ============================================================================
 */

import * as message2 from "../common/common_message";
import * as network from "../common/common_network";

/**
 * 献祭宠物（超级封印）
 * @param credential 用户凭证
 * @param petIndex 宠物所在下标
 * @returns {Promise<void>}
 */
export async function consecratePet(credential, petIndex) {
    const doConsecratePet = function (credential, petIndex) {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["select"] = petIndex;
            request["mode"] = "PETBORN6";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                message2.processResponseHTML(html);
                resolve();
            });
        });
    }
    return await doConsecratePet(credential, petIndex);
}

/**
 * 在城市住宿恢复体力和魔力
 * @param credential 用户凭证
 * @returns {Promise<void>}
 */
export async function lodgeTown(credential) {
    const doLodgeTown = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "RECOVERY";
            network.sendPostRequest("town.cgi", request, function () {
                resolve();
            });
        });
    };
    return await doLodgeTown(credential);
}

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
                    message2.publishMessageBoard("你在城市银行存入了全部现金。");
                    resolve();
                });
            } else {
                if (amount <= 0) {
                    resolve();
                } else {
                    request["azukeru"] = amount;
                    network.sendPostRequest("town.cgi", request, function () {
                        message2.publishMessageBoard("你在城市银行存入了" + amount + "万现金。");
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
                    message2.publishMessageBoard("你从城市银行提取了" + amount + "万现金。");
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
                    message2.publishMessageBoard("你从城堡提款机提取了" + amount + "万现金。");
                    resolve();
                });
            }
        });
    }
    await doWithdrawFromCastleBank(credential, amount);
}

/**
 * Return castle warehouse page HTML.
 * @param credential
 * @returns {Promise<string>}
 */
export async function castleWarehouse(credential) {
    const action = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "CASTLE_ITEM";
            network.sendPostRequest("castle.cgi", request, function (html) {
                resolve(html);
            });
        });
    };
    return await action(credential);
}