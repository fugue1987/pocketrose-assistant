import * as message from "../common/common_message";
import * as storage from "../common/common_storage";

export class SetupItem {

    render(id) {
        doRender(id);
    }

}

const _id = "012";
const _name = "战斗场偏好设置";
const _key = "_pa_" + _id;

function doRender(id) {
    let html = "";
    html += "<tr id='battleFieldSetup' style='display:none'>";
    html += "<th style='background-color:#E8E8D0'>" + _name + "</th>";
    html += "<td style='background-color:#EFE0C0'><input type='button' class='SetupUIButton' id='Setup_" + _id + "' value='设置'></td>";
    html += "<td style='background-color:#E0D0B0;text-align:left'>" + __doGenerateSetupItem() + "</td>";
    html += "</tr>";

    $("#SetupItemTable").append($(html));

    let value;
    let s = storage.get(_key + "_" + id);
    if (s === undefined || s === null || s === "undefined" || s === "null" || s === "") {
        value = {};
        value["primary"] = false;
        value["junior"] = false;
        value["senior"] = false;
        value["zodiac"] = false;
    } else {
        value = JSON.parse(s);
    }
    $("#primary_battle").prop("checked", value["primary"]);
    $("#junior_battle").prop("checked", value["junior"]);
    $("#senior_battle").prop("checked", value["senior"]);
    $("#zodiac_battle").prop("checked", value["zodiac"]);

    $("#Setup_" + _id).click(function () {
        __doSaveSetupItem(id);
    });
}

function __doGenerateSetupItem() {
    let html = "";
    html += "<input type='checkbox' class='Class_" + _id + "' id='primary_battle'>初级之森";
    html += "<input type='checkbox' class='Class_" + _id + "' id='junior_battle'>中级之塔";
    html += "<input type='checkbox' class='Class_" + _id + "' id='senior_battle'>上级之洞";
    html += "<input type='checkbox' class='Class_" + _id + "' id='zodiac_battle'>十二神殿";
    return html;
}

function __doSaveSetupItem(id) {
    const value = {};
    value["primary"] = $("#primary_battle").prop("checked");
    value["junior"] = $("#junior_battle").prop("checked");
    value["senior"] = $("#senior_battle").prop("checked");
    value["zodiac"] = $("#zodiac_battle").prop("checked");

    storage.set(_key + "_" + id, JSON.stringify(value));
    message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经设置。");
    $("#refreshButton").trigger("click");
}