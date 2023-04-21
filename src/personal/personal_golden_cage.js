/**
 * ============================================================================
 * [ 黄 金 笼 子 模 块 ]
 * ============================================================================
 */
import * as page from "../page";
import * as network from "../network";

export class PersonalGoldenCage {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
    $("input:submit[value='从黄金笼子中取出']").attr("id", "takeOutButton");
    $("#takeOutButton").attr("type", "button");
    $("input:submit[value='ＯＫ']").attr("id", "returnButton");

    $("#takeOutButton").closest("td")
        .attr("colspan", 11);
    $("#takeOutButton").closest("td")
        .append($("<input type='button' id='petManagementButton' value='返回宠物管理'>"));

    __bindTakeOutButton();
    __bindPetManagementButton();
}

function __bindTakeOutButton() {
    $("#takeOutButton").click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        const select = $("input:radio:checked").val();
        if (select === undefined) {
            // 没有选择要取出的宠物
            return;
        }
        request["select"] = select;
        request["mode"] = "GETOUTLONGZI";
        network.sendPostRequest("mydata.cgi", request, function () {
            const request = credential.asRequest();
            request["mode"] = "USE_ITEM";
            network.sendPostRequest("mydata.cgi", request, function () {
                $("form[action='status.cgi']").attr("action", "mydata.cgi");
                $("input:hidden[value='STATUS']").attr("value", "PETSTATUS");
                $("#returnButton").trigger("click");
            });
        });
    });
}

function __bindPetManagementButton() {
    $("#petManagementButton").click(function () {
        $("form[action='status.cgi']").attr("action", "mydata.cgi");
        $("input:hidden[value='STATUS']").attr("value", "PETSTATUS");
        $("#returnButton").trigger("click");
    });
}