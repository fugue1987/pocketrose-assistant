// ==UserScript==
// @name         pocketrose assistant
// @namespace    https://pocketrose.itsns.net.cn/
// @description  Intercepts and modifies pocketrose CGI requests
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      mit
// @author       xiaohaiz,fugue
// @version      1.6.0.RC4
// @grant        unsafeWindow
// @match        *://pocketrose.itsns.net.cn/*
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/js-cookie/3.0.1/js.cookie.min.js
// @run-at       document-start
// @unwrap
// ==/UserScript==

// ============================================================================
// 口 袋 助 手 郑 重 承 诺
// ----------------------------------------------------------------------------
// 所有验证码破解的相关领域都设立为禁区，我们绝对不触碰验证码破解！
// ============================================================================

import * as battle from "./battle/battle";
import * as castle from "./castle/castle";
import * as pokemon from "./pokemon/pokemon";
import {TownRequestInterceptor} from "./town/town";
import {WildRequestInterceptor} from "./map/map";
import {PersonalRequestInterceptor} from "./personal/personal";
import * as setup from "./setup/setup";

const CGI_MAPPING = {
    "/battle.cgi": new battle.BattleRequestInterceptor(),
    "/mydata.cgi": new PersonalRequestInterceptor(),
    "/status.cgi": new PersonalRequestInterceptor(),
    "/town.cgi": new TownRequestInterceptor(),
    "/castlestatus.cgi": new castle.CastleRequestInterceptor(),
    "/castle.cgi": new castle.CastleRequestInterceptor(),
    "/map.cgi": new WildRequestInterceptor()
};

$(function () {
    pocketrose('pocketrose')
});

function pocketrose(page) {
    if (location.href.includes(page)) {
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
        })
    }
}
