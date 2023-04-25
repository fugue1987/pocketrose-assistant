import * as network from "../common/common_network";
import * as util from "../common/common_util";

export class BankAccount {
    name;
    cash;
    saving;
}

/**
 * Get bank account of specified user.
 * @param credential
 * @returns {Promise<BankAccount>}
 */
export async function getBankAccount(credential) {
    const action = (credential) => {
        return new Promise(resolve => {
            const request = credential.asRequest();
            request["con_str"] = "50";
            request["mode"] = "BANK";
            network.sendPostRequest("town.cgi", request, function (html) {
                const account = new BankAccount();
                const font = $(html).find("font:contains('现在的所持金'):first");
                let s = $(font).text();
                s = util.substringBefore(s, "现在的所持金");
                account.name = s.substring(1);
                account.cash = parseInt($(font).find("font:first").text());
                account.saving = parseInt($(font).find("font:last").text());
                resolve(account);
            });
        });
    };
    return await action(credential);
}