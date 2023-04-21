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