/**
 * ============================================================================
 * [ 宠 物 图 鉴 模 块 ]
 * ============================================================================
 */

import * as page from "../common/common_page";
import * as constant from "../common/common_constant";

export class TownPetMapHouse {

    process() {
        page.removeGoogleAnalyticsScript();
        page.removeUnusedHyperLinks();
        doProcess();
    }
}

// ----------------------------------------------------------------------------
// P R I V A T E   F U N C T I O N S
// ----------------------------------------------------------------------------

function doProcess() {
    let petIdText = "";             // 宠物图鉴编号及数量的文本
    $("td:parent").each(function (_i, element) {
        const img = $(element).children("img");
        const src = img.attr("src");
        if (src !== undefined && src.indexOf(constant.DOMAIN + "/image/386/") !== -1) {
            const code = img.attr("alt");
            const count = $(element).next();

            petIdText += code;
            petIdText += "/";
            petIdText += count.text();
            petIdText += "  ";
        }
    });
    if (petIdText !== "") {
        $("td:contains('可以在这里看到收集到的图鉴')")
            .filter(function () {
                return $(this).text().startsWith("可以在这里看到收集到的图鉴");
            })
            .attr("id", "messageBoard");
        $("#messageBoard").css("color", "white");

        let html = $("#messageBoard").html();
        html += "<br>" + petIdText;
        $("#messageBoard").html(html);
    }
}