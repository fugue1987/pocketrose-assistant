/**
 * ============================================================================
 * [ 装 备 管 理 模 块 ]
 * ============================================================================
 */

import * as network from "../common/common_network";
import * as user from "../pocket/pocket_user";
import * as constant from "../common/common_pocket";
import * as message from "../common/common_message";
import * as page from "../common/common_page";
import * as item from "../pocket/pocket_item";
import {calculateCashDifferenceAmount, depositIntoTownBank, withdrawFromTownBank} from "../pocket/pocket_service";

export class PersonalItemManagement {
    process() {
        // 删除最后一个google-analytics的脚本
        $("script:last").remove();

        doProcess();
    }
}

function doProcess() {
    const credential = page.generateCredential();
    const pageHTML = page.currentPageHTML();
    // 首先从老页面上解析所有的装备信息
    const itemList = item.parsePersonalItemList(pageHTML);
    // 获取旧页面上的玩家头像HTML代码
    const userImageHTML = page.findFirstUserImageHTML(pageHTML);
    // 创建消息面板
    $("table:first").removeAttr("height");
    $("table:first td:first").css("text-align", "center");
    $("table:first td:first").css("font-size", "150%");
    $("table:first td:first").css("font-weight", "bold");
    $("table:first td:first").css("color", "navy");
    $("table:first td:first").html("＜＜　装 备 管 理 (v2.0)　＞＞");
    $("table:first tr:first").after($("<tr><td style='background-color:#E8E8D0' id='messageBoardContainer'></td></tr>"));
    message.createMessageBoardStyleA(userImageHTML, "messageBoardContainer");
    message.initializeMessageBoard("全新装备管理UI目前持续建设中......");
    // 删除旧的页面组件，并且预留新的刷新的位置
    // 预留了两个div，ItemUI用于页面刷新，Eden隐藏用于放置表单以便可以转移到其他的页面
    $("table:first tr:first").next().next()
        .html("<td style='background-color:#F8F0E0'>" +
            "<div id='ItemUI'></div><div id='Eden' style='display:none'></div>" +
            "</td>");
    // 在Eden里面添加预制的表单
    $("#Eden").html("" +
        "<form action='' method='post' id='edenForm'>" +
        "        <input type='hidden' name='id' value='" + credential.id + "'>" +
        "        <input type='hidden' name='pass' value='" + credential.pass + "'>" +
        "        <div id='edenFormPayload' style='display:none'></div>" +
        "        <input type='submit' id='edenSubmit'>" +
        "</form>");

    // 将返回按钮调整到页面中间，并且删除不需要的内容
    $("table:first tr:first").next().next().next()
        .html("<td style='background-color:#F8F0E0;text-align:center'>" +
            "    <input type='button' id='returnButton' value='返回上个画面'>" +
            "</td>");
    $("#returnButton").click(function () {
        $("#edenForm").attr("action", "status.cgi");
        $("#edenFormPayload").html("<input type='hidden' name='mode' value='STATUS'>");
        $("#edenSubmit").trigger("click");
    });
    // 创建页尾消息
    message.createFooterMessage(constant.getNPCImageHTML("饭饭"));
    message.writeFooterMessage("我就要一键祭奠，就要，就要！");
    message.writeFooterMessage("<input type='button' id='consecrateButton' style='color:darkred' value='祭奠选择的装备'>");

    // 渲染页面并且绑定相应的事件处理
    doRender(itemList);

    // 绑定祭奠按钮事件
    __bindConsecrateButton();

    // 根据主页面获取的是否可以祭奠的状态更新祭奠按钮
    user.loadRoleStatus(page.generateCredential())
        .then(status => {
            if (status.canConsecrate) {
                $("#consecrateButton").prop("disabled", false);
            }
        });

    // 隐藏祭奠按钮，双击出现
    $("#consecrateButton").hide();
    $("#p_3139").click(function () {
        $("#consecrateButton").toggle();
    });
}

function doRender(itemList) {
    let html = "";
    html += "<table style='background-color:#888888;width:100%;text-align:center'>";
    html += "   <tbody style='background-color:#F8F0E0'>";
    html += "       <tr>";
    html += "           <th style='background-color:#E8E8D0'>选择</th>";
    html += "           <th style='background-color:#EFE0C0'>装备</th>";
    html += "           <th style='background-color:#E0D0B0'>名字</th>";
    html += "           <th style='background-color:#EFE0C0'>种类</th>";
    html += "           <th style='background-color:#E0D0B0'>效果</th>";
    html += "           <th style='background-color:#EFE0C0'>重量</th>";
    html += "           <th style='background-color:#EFE0C0'>耐久</th>";
    html += "           <th style='background-color:#E0D0B0'>职业</th>";
    html += "           <th style='background-color:#E0D0B0'>攻击</th>";
    html += "           <th style='background-color:#E0D0B0'>防御</th>";
    html += "           <th style='background-color:#E0D0B0'>智力</th>";
    html += "           <th style='background-color:#E0D0B0'>精神</th>";
    html += "           <th style='background-color:#E0D0B0'>速度</th>";
    html += "           <th style='background-color:#E0D0B0'>威力</th>";
    html += "           <th style='background-color:#E0D0B0'>重量</th>";
    html += "           <th style='background-color:#E0D0B0'>幸运</th>";
    html += "           <th style='background-color:#E0D0B0'>经验</th>";
    html += "           <th style='background-color:#EFE0C0'>属性</th>";
    html += "           <th style='background-color:#EFE0C0'>出售</th>";
    html += "           <th style='background-color:#EFE0C0'>修理</th>";
    html += "       </tr>";
    for (const item of itemList.asList()) {
        if (item.isTreasureBag || item.isGoldenCage) {
            // 百宝袋和黄金笼子不再显示在页面上
            continue;
        }
        html += "<tr>";
        html += "    <td style='background-color:#E8E8D0'>";
        html += "    " + item.checkboxHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.usingHTML;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.nameHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.category;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.power;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.weight;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + item.endure;
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredCareer === "所有职业" ? "-" : item.requiredCareer);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredAttack === 0 ? "-" : item.requiredAttack);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredDefense === 0 ? "-" : item.requiredDefense);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpecialAttack === 0 ? "-" : item.requiredSpecialAttack);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpecialDefense === 0 ? "-" : item.requiredSpecialDefense);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.requiredSpeed === 0 ? "-" : item.requiredSpeed);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalPower);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalWeight);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + (item.isItem ? "-" : item.additionalLuck);
        html += "    </td>";
        html += "    <td style='background-color:#E0D0B0'>";
        html += "    " + item.experienceHTML;
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>";
        html += "    " + (item.attribute === "无" ? "-" : item.attribute);
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0' id='sellButtonContainer_" + item.index + "'>";
        html += "    </td>";
        html += "    <td style='background-color:#EFE0C0'>" + (item.isRepairable ? "<input type='button' class='ItemUIButton' id='repairItem_" + item.index + "' value='修'>" : "");
        html += "    </td>";
        html += "</tr>";
    }
    html += "       <tr>";
    html += "           <td style='background-color:#E8E8D0;text-align:left;font-weight:bold' colspan='20'>";
    html += "               <span style='color:navy'>目前剩余空位数：</span><span style='color:red'>" + (20 - itemList.asList().length) + "</span>";
    html += "           </td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td style='background-color:#E8E8D0;text-align:center' colspan='20'>";
    html += "               <table style='background-color:#E8E8D0;border-width:0;width:100%'>";
    html += "                   <tbody style='background-color:#E8E8D0'>";
    html += "                       <tr style='background-color:#E8E8D0'>";
    html += "                           <td style='text-align:left'>";
    html += "                               <input type='button' class='ItemUIButton' id='useButton' value='使用'>";
    html += "                               <input type='button' class='ItemUIButton' id='putIntoBagButton' value='入袋'>";
    html += "                           </td>";
    html += "                           <td style='text-align:right'>";
    html += "                               <input type='button' class='ItemUIButton' id='treasureBagButton' value='百宝袋'>";
    html += "                               <input type='button' class='ItemUIButton' id='goldenCageButton' value='黄金笼子'>";
    html += "                               <input type='button' class='ItemUIButton' id='putAllIntoBagButton' value='全部入袋'>";
    html += "                           </td>";
    html += "                       </tr>";
    html += "                   </tbody>";
    html += "               </table>";
    html += "           </td>";
    html += "       </tr>";
    html += "       <tr>";
    html += "          <td style='background-color:#E8E8D0;text-align:right' colspan='20'>";
    html += "              <input type='text' id='receiver' size='15' maxlength='20'>";
    html += "              <input type='button' class='ItemUIButton' id='searchButton' value='找人'>";
    html += "              <select id='receiverSelect'><option value=''>选择发送对象</select>";
    html += "              <input type='button' class='ItemUIButton' id='sendButton' value='发送'>";
    html += "          </td>"
    html += "       </tr>";
    html += "       <tr>";
    html += "           <td style='background-color:#E8E8D0;text-align:center' colspan='20'>";
    html += "           <input type='button' class='ItemUIButton' id='refreshButton' value='刷新装备管理界面'>";
    html += "           </td>"
    html += "       </tr>";
    html += "   </tbody>";
    html += "</table>";

    // 渲染装备管理界面
    $("#ItemUI").html(html);

    // 修改按钮的状态，如果有必要的话
    const treasureBag = itemList.treasureBag;
    if (treasureBag === undefined) {
        $("#putIntoBagButton").prop("disabled", true);
        $("#putIntoBagButton").css("display", "none");
        $("#treasureBagButton").prop("disabled", true);
        $("#treasureBagButton").css("display", "none");
        $("#putAllIntoBagButton").prop("disabled", true);
        $("#putAllIntoBagButton").css("display", "none");
    }
    const goldenCage = itemList.goldenCage;
    if (goldenCage === undefined) {
        $("#goldenCageButton").prop("disabled", true);
        $("#goldenCageButton").css("display", "none");
    }

    // 绑定点击事件
    __bindUseButton();
    __bindPutIntoBugButton(itemList);
    __bindTreasureBagButton(treasureBag);
    __bindGoldenCageButton(goldenCage);
    __bindPutAllIntoBagButton(itemList);
    __bindSearchButton();
    __bindSendButton();
    __bindRefreshButton();

    // 渲染并且绑定可以出售的装备
    const credential = page.generateCredential();
    const request = credential.asRequest();
    request["con_str"] = "50";
    request["mode"] = "ARM_SHOP";
    network.sendPostRequest("town.cgi", request, function (html) {
        const sellableItems = [];
        for (let i = 0; i < item.parseWeaponStoreItemList(html).asList().length; i++) {
            const it = item.parseWeaponStoreItemList(html).asList()[i];
            if (!it.selectable) {
                continue;
            }
            if (it.using) {
                continue;
            }
            if (item.isProhibitSellingItem(it.name)) {
                continue;
            }
            sellableItems.push(it);
        }
        if (sellableItems.length === 0) {
            return;
        }
        sellableItems.forEach(it => {
            const button = "<input type='button' class='ItemUIButton' id='sellItem_" + it.index + "' value='售'>";
            $("#sellButtonContainer_" + it.index).html(button);
            __bindSellButton(it.index);
        });
    });

    // 绑定可以修理的装备
    __bindRepairButton(itemList);
}

function doRefresh(credential) {
    const request = credential.asRequest();
    request["mode"] = "USE_ITEM";
    network.sendPostRequest("mydata.cgi", request, function (html) {
        // 从新的界面中重新解析装备状态
        const itemList = item.parsePersonalItemList(html);
        // 解除当前所有的按钮
        $(".ItemUIButton").unbind("click");
        // 清除PetUI的内容
        $("#ItemUI").html("");
        // 使用新的重新渲染ItemUI并绑定新的按钮
        doRender(itemList);
    });
}

function __bindUseButton() {
    $("#useButton").click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        let checkedCount = 0;
        $("input:checkbox:checked").each(function (_idx, checkbox) {
            checkedCount++;
            const name = $(checkbox).attr("name");
            request[name] = $(checkbox).val();
        });
        if (checkedCount === 0) {
            message.publishMessageBoard("没有选择任何装备");
            return;
        }
        request["chara"] = "1";
        request["mode"] = "USE";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindPutIntoBugButton(itemList) {
    if ($("#putIntoBagButton").prop("disabled")) {
        return;
    }
    const items = itemList.asMap();
    $("#putIntoBagButton").click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        let checkedCount = 0;
        $("input:checkbox:checked").each(function (_idx, checkbox) {
            const index = parseInt($(checkbox).val());
            const item = items[index];
            if (!item.using) {
                checkedCount++;
                const name = $(checkbox).attr("name");
                request[name] = $(checkbox).val();
            }
        });
        if (checkedCount === 0) {
            message.publishMessageBoard("没有选择任何装备");
            return;
        }
        request["chara"] = "1";
        request["mode"] = "PUTINBAG";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindTreasureBagButton(treasureBag) {
    if (treasureBag === undefined) {
        return;
    }
    $("#treasureBagButton").click(function () {
        $("#edenForm").attr("action", "mydata.cgi");
        $("#edenFormPayload").html("" +
            "<input type='hidden' name='chara' value='1'>" +
            "<input type='hidden' name='item" + treasureBag.index + "' value='" + treasureBag.index + "'>" +
            "<input type='hidden' name='mode' value='USE'>");
        $("#edenSubmit").trigger("click");
    });
}

function __bindGoldenCageButton(goldenCage) {
    if (goldenCage === undefined) {
        return;
    }
    $("#goldenCageButton").click(function () {
        $("#edenForm").attr("action", "mydata.cgi");
        $("#edenFormPayload").html("" +
            "<input type='hidden' name='chara' value='1'>" +
            "<input type='hidden' name='item" + goldenCage.index + "' value='" + goldenCage.index + "'>" +
            "<input type='hidden' name='mode' value='USE'>");
        $("#edenSubmit").trigger("click");
    });
}

function __bindPutAllIntoBagButton(itemList) {
    if ($("#putAllIntoBagButton").prop("disabled")) {
        return;
    }
    const items = itemList.asMap();
    $("#putAllIntoBagButton").click(function () {
        const credential = page.generateCredential();
        const request = credential.asRequest();
        let checkedCount = 0;
        $("input:checkbox").each(function (_idx, checkbox) {
            const index = parseInt($(checkbox).val());
            const item = items[index];
            if (!item.using) {
                checkedCount++;
                const name = $(checkbox).attr("name");
                request[name] = $(checkbox).val();
            }
        });
        if (checkedCount === 0) {
            message.publishMessageBoard("目前没有任何装备可以放入百宝袋");
            return;
        }
        request["chara"] = "1";
        request["mode"] = "PUTINBAG";
        network.sendPostRequest("mydata.cgi", request, function (html) {
            message.processResponseHTML(html);
            doRefresh(credential);
        });
    });
}

function __bindSearchButton() {
    $("#searchButton").click(function () {
        let receiver = $("#receiver").val();
        if (receiver === undefined || receiver.trim() === "") {
            return;
        }
        receiver = escape(receiver.trim());
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["serch"] = receiver;
        request["mode"] = "ITEM_SEND";
        network.sendPostRequest("town.cgi", request, function (html) {
            const optionHTML = $(html).find("select[name='eid']").html();
            $("#receiverSelect").html(optionHTML);
        });
    });
}

function __bindSendButton() {
    $("#sendButton").click(function () {
        const receiver = $("#receiverSelect").val();
        if (receiver === undefined || receiver === "") {
            return;
        }
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["eid"] = receiver;
        let checkedCount = 0;
        $("input:checkbox:checked").each(function (_idx, checkbox) {
            checkedCount++;
            const name = $(checkbox).attr("name");
            request[name] = $(checkbox).val();
        });
        if (checkedCount === 0) {
            message.publishMessageBoard("你没有选择要发送的装备。");
            return;
        }
        request["mode"] = "ITEM_SEND2";
        withdrawFromTownBank(credential, 10)
            .then(() => {
                network.sendPostRequest("town.cgi", request, function (html) {
                    message.processResponseHTML(html);
                    depositIntoTownBank(credential, undefined)
                        .then(() => {
                            doRefresh(credential);
                        });
                });
            });
    });
}

function __bindRefreshButton() {
    $("#refreshButton").click(function () {
        const credential = page.generateCredential();
        doRefresh(credential);
    });
}

function __bindRepairButton(itemList) {
    for (const item of itemList.asList()) {
        const buttonId = "repairItem_" + item.index;
        if ($("#" + buttonId).length > 0) {
            $("#" + buttonId).click(function () {
                const index = $(this).attr("id").split("_")[1];
                const credential = page.generateCredential();
                const request = credential.asRequest();
                request["select"] = index;
                request["mode"] = "MY_ARM2";
                network.sendPostRequest("town.cgi", request, function () {
                    message.publishMessageBoard("选定装备完成了修理。");
                    doRefresh(credential);
                });
            });
        }
    }
}

function __bindSellButton(index) {
    $("#sellItem_" + index).click(function () {
        let candidate = undefined;
        $("input:checkbox").each(function (_idx, checkbox) {
            if (candidate === undefined && index === parseInt($(checkbox).val())) {
                candidate = $(checkbox).parent().next().next().text();
            }
        });
        if (candidate === undefined) {
            return;
        }
        if (!confirm("确认要出售\"" + candidate.trim() + "\"吗？")) {
            return;
        }
        const credential = page.generateCredential();
        const request = credential.asRequest();
        request["con_str"] = "50";
        request["mode"] = "ARM_SHOP";
        network.sendPostRequest("town.cgi", request, function (html) {
            const discount = $(html).find("input:hidden[name='val_off']").val();
            const request = credential.asRequest();
            request["mode"] = "SELL";
            request["select"] = index;
            if (discount !== undefined) {
                request["val_off"] = discount;
            }
            network.sendPostRequest("town.cgi", request, function (html) {
                message.processResponseHTML(html);
                depositIntoTownBank(credential, undefined)
                    .then(() => {
                        doRefresh(credential);
                    });
            });
        });
    });
}

function __bindConsecrateButton() {
    $("#consecrateButton").click(function () {
        const consecrateCandidates = [];
        let usingCount = 0;
        const itemNames = [];
        $("input:checkbox:checked").each(function (_idx, checkbox) {
            if ($(checkbox).parent().next().text().trim() === "★") {
                usingCount++;
            }
            itemNames.push($(checkbox).parent().next().next().text().trim());
            consecrateCandidates.push(parseInt($(checkbox).val()));
        });
        if (itemNames.length === 0) {
            alert("我以为你会知道，至少也要选择一件想要祭奠的装备。");
            return;
        }
        if (usingCount > 0) {
            alert("对不起，出于安全原因，正在使用中的装备不能祭奠！");
            return;
        }
        const ret = confirm("请务必确认你将要祭奠的这些装备：" + itemNames.join());
        if (!ret) {
            return;
        }
        const credential = page.generateCredential();
        user.loadRole(credential)
            .then(role => {
                const cash = role.cash;
                const amount = calculateCashDifferenceAmount(cash, 1000000);
                withdrawFromTownBank(page.generateCredential(), amount)
                    .then(() => {
                        let payload = "";
                        consecrateCandidates.forEach(it => {
                            payload += "<input type='hidden' name='item" + it + "' value='" + it + "'>";
                        });
                        payload += "<input type='hidden' name='chara' value='1'>";
                        payload += "<input type='hidden' name='mode' value='CONSECRATE'>";
                        $("#edenFormPayload").html(payload);
                        $("#edenForm").attr("action", "mydata.cgi");
                        $("#edenSubmit").trigger("click");
                    });
            });
    });
}