// ============================================================================
// 口 袋 助 手 郑 重 承 诺
// ----------------------------------------------------------------------------
// 所有验证码破解的相关领域都设立为禁区，我们绝对不触碰验证码破解！
// ============================================================================

import * as pokemon from "./pokemon/pokemon";
import * as setup from "./setup/setup";
import {BattleRequestInterceptor} from "./battle/battle";
import {CastleRequestInterceptor} from "./castle/castle";
import {PersonalRequestInterceptor} from "./personal/personal";
import {TownRequestInterceptor} from "./town/town";
import {MapRequestInterceptor} from "./map/map";
import {InformationRequestInterceptor} from "./information/information";

const CGI_MAPPING = {
    "/battle.cgi": new BattleRequestInterceptor(),
    "/mydata.cgi": new PersonalRequestInterceptor(),
    "/status.cgi": new PersonalRequestInterceptor(),
    "/town.cgi": new TownRequestInterceptor(),
    "/castlestatus.cgi": new CastleRequestInterceptor(),
    "/castle.cgi": new CastleRequestInterceptor(),
    "/map.cgi": new MapRequestInterceptor(),
    "/town_print.cgi": new InformationRequestInterceptor()
};

$(function () {
    pocketrose('pocketrose')
});

function pocketrose(page) {
    if (!location.href.includes(page)) {
        return;
    }
    $(document).ready(function () {
        if (setup.isPokemonWikiEnabled()) {
            pokemon.processPokemonWikiReplacement();
        }

        // Lookup CGI request interceptor and process the request if found.
        const keywords = Object.keys(CGI_MAPPING);
        for (let i = 0; i < keywords.length; i++) {
            const keyword = keywords[i];
            if (location.href.includes(keyword)) {
                CGI_MAPPING[keyword].process();
            }
        }
    });
}
