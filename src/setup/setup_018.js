import * as message from "../common/common_message";
import * as storage from "../common/common_storage";

export class SetupItem {

    render() {
        doRender();
    }

}

const _id = "018";
const _name = "战斗的存钱台词";
const _key = "_pa_" + _id;

function doRender() {
    let html = "";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>" + _name + "</th>";
    html += "<td style='background-color:#E8E8D0'></td>";
    html += "<td style='background-color:#EFE0C0'><input type='button' class='SetupUIButton' id='Setup_" + _id + "' value='设置'></td>";
    html += "<td style='background-color:#E0D0B0;text-align:left'>" + __doGenerateSetupItem() + "</td>";
    html += "</tr>";

    $("#SetupItemTable").append($(html));

    const value = storage.getString(_key);
    if (value !== "") {
        $("#Text_" + _id).attr("placeholder", value);
    }

    $("#Setup_" + _id).click(function () {
        __doSaveSetupItem();
    });
}

function __doGenerateSetupItem() {
    let html = "";
    html += "<input type='text' id='Text_" + _id + "' class='Class_" + _id + "' size='40' maxlength='40'>";
    return html;
}

function __doSaveSetupItem() {
    const value = $("#Text_" + _id).val();
    if (value === undefined || value === null || value.trim() === "") {
        storage.remove(_key);
        message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经重置。");
    } else {
        storage.set(_key, value.trim());
        message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经设置。");
    }
    $("#refreshButton").trigger("click");
}