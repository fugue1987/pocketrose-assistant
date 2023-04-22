import * as network from "../common/common_network";
import * as util from "../common/common_util";

export class Spell {
    id;
    name;
    power;
    accuracy;
    pp;

    get score() {
        return this.power * this.accuracy;
    }
}

export class SpellList {
    #spellList;

    constructor() {
        this.#spellList = [];
    }

    push(spell) {
        this.#spellList.push(spell);
    }

    asList() {
        return this.#spellList;
    }
}

export function parseSpellList(pageHTML) {
    const spellList = new SpellList();
    const select = $(pageHTML).find("select[name='ktec_no']");
    $(select).find("option").each(function (_idx, option) {
        const spell = new Spell();
        const id = $(option).val();
        if (id !== "") {
            spell.id = id;
            let s = $(option).text().trim();
            spell.name = util.substringBefore(s, "(");
            s = util.substringBetween(s, "(", ")");
            const ss = s.split(" | ");
            spell.power = parseInt(util.substringAfter(ss[0], "威力:"));
            spell.accuracy = parseInt(util.substringAfter(ss[1], "确率:"));
            spell.pp = parseInt(util.substringAfter(ss[2], "消费MP:"));
            spellList.push(spell);
        }
    });
    return spellList;
}

/**
 * Load role spell list.
 * @param credential
 * @returns {Promise<SpellList>}
 */
export async function loadSpellList(credential) {
    const doLoadSpellList = (credential) => {
        return new Promise((resolve) => {
            const request = credential.asRequest();
            request["mode"] = "MAGIC";
            network.sendPostRequest("mydata.cgi", request, function (html) {
                const spellList = parseSpellList(html);
                resolve(spellList);
            });
        });
    };
    return await doLoadSpellList(credential);
}