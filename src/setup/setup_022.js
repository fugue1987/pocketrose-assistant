import * as message from "../common/common_message";
import * as storage from "../common/common_storage";

export class SetupItem {

    render(id) {
        doRender(id);
    }

}

const _id = "022";
const _name = "自定义的套装Ｄ";
const _key = "_pa_" + _id;

function doRender(id) {
    let html = "";
    html += "<tr>";
    html += "<th style='background-color:#E8E8D0'>" + _name + "</th>";
    html += "<td style='background-color:#E8E8D0'>★</td>";
    html += "<td style='background-color:#EFE0C0'><input type='button' class='SetupUIButton' id='Setup_" + _id + "' value='设置'></td>";
    html += "<td style='background-color:#E0D0B0;text-align:left'>" + __doGenerateSetupItem() + "</td>";
    html += "</tr>";

    $("#SetupItemTable").append($(html));

    let value;
    let s = storage.getString(_key + "_" + id);
    if (s === "") {
        value = {};
        value["weaponName"] = "NONE";
        value["armorName"] = "NONE";
        value["accessoryName"] = "NONE";
    } else {
        value = JSON.parse(s);
    }
    if (value["weaponStar"] !== undefined && value["weaponStar"]) {
        $(".checkbox_" + _id + "[value='weaponStar']").prop("checked", true);
    }
    if (value["armorStar"] !== undefined && value["armorStar"]) {
        $(".checkbox_" + _id + "[value='armorStar']").prop("checked", true);
    }
    if (value["accessoryStar"] !== undefined && value["accessoryStar"]) {
        $(".checkbox_" + _id + "[value='accessoryStar']").prop("checked", true);
    }
    $(".weapon_option_" + _id + "[value='" + value["weaponName"] + "']").prop("selected", true);
    $(".armor_option_" + _id + "[value='" + value["armorName"] + "']").prop("selected", true);
    $(".accessory_option_" + _id + "[value='" + value["accessoryName"] + "']").prop("selected", true);

    $("#Setup_" + _id).click(function () {
        __doSaveSetupItem(id);
    });
}

function __doGenerateSetupItem() {
    let html = "";
    html += "<input type='checkbox' name='star_" + _id + "' class='checkbox_" + _id + "' value='weaponStar'>★";
    const weaponList = $("#WeaponList").text().split(",");
    html += "<select name='weapon_" + _id + "'>";
    html += "<option class='weapon_option_" + _id + "' value='NONE'>选择武器</option>";
    for (const it of weaponList) {
        html += "<option class='weapon_option_" + _id + "' value='" + it + "'>" + it + "</option>";
    }
    html += "</select>";
    html += "<input type='checkbox' name='star_" + _id + "' class='checkbox_" + _id + "' value='armorStar'>★";
    const armorList = $("#ArmorList").text().split(",");
    html += "<select name='armor_" + _id + "'>";
    html += "<option class='armor_option_" + _id + "' value='NONE'>选择防具</option>";
    for (const it of armorList) {
        html += "<option class='armor_option_" + _id + "' value='" + it + "'>" + it + "</option>";
    }
    html += "</select>";
    html += "<input type='checkbox' name='star_" + _id + "' class='checkbox_" + _id + "' value='accessoryStar'>★";
    const accessoryList = $("#AccessoryList").text().split(",");
    html += "<select name='accessory_" + _id + "'>";
    html += "<option class='accessory_option_" + _id + "' value='NONE'>选择饰品</option>";
    for (const it of accessoryList) {
        html += "<option class='accessory_option_" + _id + "' value='" + it + "'>" + it + "</option>";
    }
    html += "</select>";
    return html;
}

function __doSaveSetupItem(id) {
    const value = {};
    $("input:checkbox[name='star_" + _id + "']:checked").each(function (_idx, checkbox) {
        value[$(checkbox).val()] = true;
    });
    value["weaponName"] = $("select[name='weapon_" + _id + "']").val();
    value["armorName"] = $("select[name='armor_" + _id + "']").val();
    value["accessoryName"] = $("select[name='accessory_" + _id + "']").val();

    storage.set(_key + "_" + id, JSON.stringify(value));
    message.publishMessageBoard("<b style='color:red'>" + _name + "</b>已经设置。");
    $("#refreshButton").trigger("click");
}