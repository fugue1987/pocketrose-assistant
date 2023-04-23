import * as constant from "./common_pocket";

export function createMessageBoard(imageHTML, containerId) {
    if (imageHTML === undefined) {
        imageHTML = constant.getNPCImageHTML("武器屋老板娘");
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
        $(html).find("h2").each(function (_idx, h2) {
            let successMessage = $(h2).html();
            successMessage = successMessage.replace("<br>", "");
            successMessage = "<td>" + successMessage + "</td>";
            publishMessageBoard($(successMessage).text());
        });
    }
}

export function createFooterMessage(imageHTML) {
    if (imageHTML === undefined) {
        imageHTML = constant.getNPCImageHTML("客栈老板娘");
    }
    const messageBoardHTML = "" +
        "<table style='background-color:#888888;width:100%'>" +
        "    <tbody>" +
        "    <tr>" +
        "        <td style='background-color:#F8F0E0'>" +
        "            <table style='background-color:#888888;border-width:0'>" +
        "                <tbody>" +
        "                <tr>" +
        "                    <td style='background-color:#E8E8D0'>" + imageHTML + "</td>" +
        "                    <td style='background-color:#E0D0B0;width:100%' id='footerMessage'></td>" +
        "                </tr>" +
        "                </tbody>" +
        "            </table>" +
        "        </td>" +
        "    </tr>" +
        "    </tbody>" +
        "</table>";
    $("div:last").prepend($(messageBoardHTML));
}

export function writeFooterMessage(message) {
    if ($("#footerMessage").length > 0) {
        let html = $("#footerMessage").html();
        html += message;
        $("#footerMessage").html(html);
    }
}