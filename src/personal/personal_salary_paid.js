/**
 * ============================================================================
 * [ 领 取 俸 禄 模 块 ]
 * ============================================================================
 */

import * as constant from "../common/common_pocket";
import * as message from "../common/common_message";
import * as page from "../page";
import {depositIntoTownBank} from "../pocket/pocket_service";

export class PersonalSalaryPaid {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
    doRender();
}

function doRender() {
    $("input:submit[value='返回城市']").attr("id", "returnButton");

    const imageHTML = constant.getNPCImageHTML("花子");
    if ($("body:first").text().includes("下次领取俸禄还需要等待")) {
        $("#ueqtweixin").remove();
        $("body:first").children(":last-child").append("<div></div>");
        message.createFooterMessageStyleA(imageHTML);
        message.writeFooterMessage("害我也白跑一趟，晦气！");
    } else {
        message.createFooterMessageStyleA(imageHTML);
        message.writeFooterMessage("打、打、打劫。不许笑，我跟这儿打劫呢。IC、IP、IQ卡，通通告诉我密码！");
        message.writeFooterMessage("<input type='button' id='depositButton' value='溜了溜了'>");
    }

    __bindDepositButton();
}

function __bindDepositButton() {
    if ($("#depositButton").length > 0) {
        $("#depositButton").click(function () {
            const credential = page.generateCredential();
            depositIntoTownBank(credential, undefined).then(() => {
                $("#returnButton").trigger("click");
            });
        });
    }
}