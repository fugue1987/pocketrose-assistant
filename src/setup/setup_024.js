import {POCKET_NPC_IMAGES} from "../common/common_pocket";
import * as message from "../common/common_message";
import * as storage from "../common/common_storage";

export class SetupItem {

    render() {
        doRender();
    }

}

const _id = "024";
const _name = "战斗入手的提示";
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

    let value;
    const s = storage.getString(_key);
    if (s === "") {
        value = {};
        value["person"] = "NONE";
        value["text"] = "";
    } else {
        value = JSON.parse(s);
    }
    $(".option_class_" + _id + "[value='" + value["person"] + "']").prop("selected", true);
    $("#Text_" + _id).attr("placeholder", value["text"]);

    $("#Setup_" + _id).click(function () {
        __doSaveSetupItem();
    });
}

function __doGenerateSetupItem() {
    let html = "";
    html += "<select id='Select_" + _id + "'>";
    html += "<option class='option_class_" + _id + "' value='NONE'>禁用</option>";
    html += "<option class='option_class_" + _id + "' value='RANDOM'>随机</option>";
    const names = Object.keys(POCKET_NPC_IMAGES);
    for (const name of names) {
        if (name.length !== 2) {
            continue;
        }
        html += "<option class='option_class_" + _id + "' value='" + name + "'>" + name + "</option>";
    }
    html += "</select>";
    html += "<input type='text' id='Text_" + _id + "' size='60' maxlength='60' placeholder='自定义台词'>";
    return html;
}

function __doSaveSetupItem() {
    let person = $("#Select_" + _id).val();
    let text = $("#Text_" + _id).val();
    if (text === undefined || text === null || text.trim() === "") {
        text = "";
    }
    const value = {};
    value["person"] = person;
    value["text"] = text;
    storage.set(_key, JSON.stringify(value));
    message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经设置。");
    $("#refreshButton").trigger("click");
}