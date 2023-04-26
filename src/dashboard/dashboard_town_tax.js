/**
 * ============================================================================
 * 城 市 首 页 收 益
 * ============================================================================
 */

import * as page from "../common/common_page";
import * as util from "../common/common_util";
import * as network from "../common/common_network";

export class DashboardTownTax {

    process() {
        doProcess();
    }
}

function doProcess() {
    const td = $("th:contains('收益')")
        .filter(function () {
            return $(this).text() === "收益";
        })
        .next();
    let s = $(td).text();
    if (s !== "-") {
        const tax = parseInt(s);
        if (tax >= 50000) {
            $(td).html("<input type='button' id='townTaxButton' value='" + tax + "'>");
        }
    }

    if ($("#townTaxButton").length > 0) {
        s = $("option[value='LOCAL_RULE']").text();
        const roleCountry = util.substringBefore(s, "国法");
        const townCountry = $("th:contains('支配下')")
            .filter(function () {
                return $(this).text() === "支配下";
            })
            .next()
            .text();
        if (roleCountry !== townCountry) {
            $("#townTaxButton").prop("disabled", true);
        }

        if (!$("#townTaxButton").prop("disabled")) {
            const townId = $("input:hidden[name='townid']").val();
            __bindTownTaxButton(townId);
        }
    }
}

function __bindTownTaxButton(townId) {
    const credential = page.generateCredential();
    $("#townTaxButton").click(function () {
        const request = credential.asRequest();
        request["town"] = townId;
        request["mode"] = "MAKE_TOWN";
        network.sendPostRequest("country.cgi", request, function () {
            $("#refreshButton").trigger("click");
        });
    });
}