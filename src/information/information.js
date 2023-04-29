import * as page from "../common/common_page";

export class InformationRequestInterceptor {

    process() {
        page.removeUnusedHyperLinks();
        page.removeGoogleAnalyticsScript();
        doProcess();
    }

}

function doProcess() {
    $("td:contains('枫丹')")
        .filter(function () {
            return $(this).text() === "枫丹";
        })
        .next()
        .next()
        .find("font:first")
        .text("- GOLD");
}