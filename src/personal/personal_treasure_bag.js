/**
 * ============================================================================
 * [ 百 宝 袋 模 块 ]
 * ============================================================================
 */

import * as item from "../pocket/pocket_item";
import * as page from "../common/common_page";
import * as network from "../network";

export class PersonalTreasureBag {
    process() {
        doProcess();
    }
}

function doProcess() {
    const pageHTML = page.currentPageHTML();
    const itemList = item.parseTreasureBagItemList(pageHTML);
    const items = itemList.asMap();

    let itemCount = 0;
    $("input:checkbox").each(function (_idx, checkbox) {
        itemCount++;
        const index = parseInt($(checkbox).val());
        const item = items[index];
        $(checkbox).closest("tr").find("td:eq(9)").html(item.experienceHTML);
    });

    $("input:submit[value='从百宝袋中取出']").attr("id", "takeOutButton");
    $("#takeOutButton").attr("type", "button");
    $("input:submit[value='ＯＫ']").attr("id", "returnButton");

    $("#takeOutButton").closest("tr")
        .before($("<tr><td colspan='10' style='color:navy'>百宝袋中目前剩余空位数：" +
            "<b style='color:red'>" + (Math.max(0, 50 - itemCount)) + "</b></td></tr>"));
    $("#takeOutButton").closest("td")
        .append($("<input type='button' id='itemManagementButton' value='返回装备管理'>"));

    __bindTakeOutButton();
    __bindItemManagementButton();
}

function __bindTakeOutButton() {
    $("#takeOutButton").click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        let checkedCount = 0;
        $("input[type='checkbox']:checked").each(function (_idx, checkbox) {
            checkedCount++;
            const name = $(checkbox).attr("name");
            request[name] = $(checkbox).attr("value");
        });
        if (checkedCount === 0) {
            // 没有选择要取出的物品/装备
            return;
        }
        request["mode"] = "GETOUTBAG";
        network.sendPostRequest("mydata.cgi", request, function () {
            $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
            $("form[action='status.cgi']").attr("action", "mydata.cgi");
            $("#returnButton").trigger("click");
        });
    });
}

function __bindItemManagementButton() {
    $("#itemManagementButton").click(function () {
        $("input:hidden[value='STATUS']").attr("value", "USE_ITEM");
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("#returnButton").trigger("click");
    });
}