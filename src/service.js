/**
 * ============================================================================
 * [ 口 袋 服 务 模 块 ]
 * ============================================================================
 */

import * as message from "./message";
import * as network from "./network";

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
                const successMessage = $(html).find("h2:first").text();
                message.writeMessageBoard(successMessage);
                resolve();
            });
        });
    }
    return await doConsecratePet(credential, petIndex);
}