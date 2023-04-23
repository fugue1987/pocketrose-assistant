import * as message from "../common/common_message";
import * as storage from "../common/common_storage";

export class SetupItem {

    render() {
        doRender();
    }

}

const _id = "004";
const _name = "修理装备耐久限";
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

    const value = storage.getInteger(_key, 100);
    $(".Class_" + _id + "[value='" + value + "']").prop("selected", true);

    $("#Setup_" + _id).click(function () {
        __doSaveSetupItem();
    });
}

function __doGenerateSetupItem() {
    let selection = "<select id='Select_" + _id + "'>";
    selection += "<option class='Class_" + _id + "' value='10'>耐久10</option>";
    selection += "<option class='Class_" + _id + "' value='20'>耐久20</option>";
    selection += "<option class='Class_" + _id + "' value='50'>耐久50</option>";
    selection += "<option class='Class_" + _id + "' value='100'>耐久100</option>";
    selection += "</select>";
    return selection;
}

function __doSaveSetupItem() {
    const value = $("#Select_" + _id).val();
    storage.set(_key, value);
    message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经设置。");
    $("#refreshButton").trigger("click");
}