import * as constant from "../common/common_constant";

export function createMessageBoard(imageHTML, containerId) {
    if (imageHTML === undefined) {
        imageHTML = constant.getNPCImageHTML("老板娘");
    }
    const messageBoardHTML = "" +
        "<table style='background-color:#888888;width:100%'>" +
        "    <tbody>" +
        "    <tr>" +
        "        <td style='background-color:#F8F0E0'>" +
        "            <table style='background-color:#888888;border-width:0'>" +
        "                <tbody>" +
        "                <tr>" +
        "                    <td style='background-color:#F8F0E0'>" + imageHTML + "</td>" +
        "                    <td style='background-color:#000000;color:white;width:100%' id='messageBoard'></td>" +
        "                </tr>" +
        "                </tbody>" +
        "            </table>" +
        "        </td>" +
        "    </tr>" +
        "    </tbody>" +
        "</table>";
    $("#" + containerId).html(messageBoardHTML);
}

export function initializeMessageBoard(message) {
    if ($("#messageBoard").length > 0) {
        $("#messageBoard").html(message);
    }
}

export function publishMessageBoard(message) {
    if ($("#messageBoard").length > 0) {
        let html = $("#messageBoard").html();
        const now = new Date();
        const timeHtml = "<span style='color:#ADFF2F'>(" + now.toLocaleString() + ")</span>";
        html = html + "<li>" + timeHtml + " " + message + "</li>";
        $("#messageBoard").html(html);
    }
}

export function processResponseHTML(html) {
    if ($(html).text().includes("ERROR !")) {
        const errorMessage = $(html).find("font b").text();
        publishMessageBoard("<b style='color:red'>" + errorMessage + "</b>");
    } else {
        let successMessage = $(html).find("h2:first").html();
        successMessage = successMessage.replace("<br>", "");
        successMessage = "<td>" + successMessage + "</td>";
        publishMessageBoard($(successMessage).text());
    }
}