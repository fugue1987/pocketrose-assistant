import * as pocket from "../common/common_pocket";
import * as message2 from "../common/common_message";
import * as util from "../common/common_util";
import * as page2 from "../common/common_page";
import * as network from "../common/common_network";
import * as user from "../pocket/pocket_user";
import {findTownByName} from "../pocket/pocket_town";

/**
 * 合成屋
 */
export class TownGemStore {

    constructor() {
    }

    process() {
        $("input:submit[value='宝石合成']").attr("id", "fuseButton");
        $("input:submit[value='返回城市']").attr("id", "returnButton");

        const td = $("td:contains('您好，这里是合成屋')")
            .filter(function () {
                return $(this).text().startsWith("您好，这里是合成屋");
            });
        td.attr("id", "messageBoard");
        td.css("color", "white");

        const imageHTML = pocket.getNPCImageHTML("武器屋老板娘");
        $("img[alt='合成屋']").parent().html(imageHTML);
        message2.initializeMessageBoard("砸石头这种事儿，难道不是有手就行的？");

        $("input:radio[name='select']").each(function (_idx, radio) {
            $(radio).parent().parent().attr("class", "itemClass");
        });
        $("input:radio[name='baoshi']").each(function (_idx, radio) {
            $(radio).parent().parent().attr("class", "gemClass");
        });

        $("input:radio[name='select']").each(function (_idx, radio) {
            const using = $(radio).parent().next().text();
            const name = $(radio).parent().next().next().text();
            if (using === "★" && name !== "宠物蛋") {
                $(radio).prop("disabled", true);
            }
        });

        $("table:eq(1)").append($("<tr><td style='background-color:navy;text-align:center' id='buttonContainer'></td></tr>"));

        $("#buttonContainer").append($("<input type='button' id='fuseLuckGem' style='color:red' value='砸光身上所有幸运'>"));
        $("#buttonContainer").append($("<input type='button' id='fuseWeightGem' style='color:green' value='砸光身上所有重量'>"));
        $("#buttonContainer").append($("<input type='button' id='fusePowerGem' style='color:blue' value='砸光身上所有威力'>"));
        $("#fuseLuckGem").prop("disabled", true);
        $("#fuseWeightGem").prop("disabled", true);
        $("#fusePowerGem").prop("disabled", true);
        $("#fusePowerGem").hide();

        let luckGemCount = 0;
        let weightGemCount = 0;
        let powerGemCount = 0;
        $("input:radio[name='baoshi']").each(function (_idx, radio) {
            const name = $(radio).parent().next().text();
            if (name === "幸运宝石") {
                luckGemCount++;
            }
            if (name === "重量宝石") {
                weightGemCount++;
            }
            if (name === "威力宝石") {
                powerGemCount++;
            }
        });

        if (luckGemCount > 0) {
            $("#fuseLuckGem").prop("disabled", false);
        }
        if (weightGemCount > 0) {
            $("#fuseWeightGem").prop("disabled", false);
        }
        if (powerGemCount > 0) {
            $("#fusePowerGem").prop("disabled", false);
        }

        const inst = this;
        $("#fuseLuckGem").click(function () {
            inst.#prepareFuseGem("幸运宝石");
        });
        $("#fuseWeightGem").click(function () {
            inst.#prepareFuseGem("重量宝石");
        });
        $("#fusePowerGem").click(function () {
            inst.#prepareFuseGem("威力宝石");
        });
        $("#p_27").dblclick(function () {
            $("#fusePowerGem").toggle();
        });
    }

    #prepareFuseGem(gemName) {
        const item = $("input:radio[name='select']:checked").val();
        if (item === undefined) {
            return;
        }
        const name = $("input:radio[name='select']:checked").parent().next().next().text();
        // 位置可能会变，要确认这是同名的第几个
        let nameCount = 0;
        let nameIndex = -1;
        $("input:radio[name='select']").each(function (_idx, radio) {
            const n = $(radio).parent().next().next().text();
            if (n === name) {
                nameCount++;
                if ($(radio).prop("checked")) {
                    nameIndex = nameCount - 1;
                }
            }
        });
        message2.publishMessageBoard("选择合成" + name);
        let holeCount;
        if (name === "宠物蛋") {
            holeCount = 20;
        } else {
            const holeText = $("input:radio[name='select']:checked").parent().next().next().next().next().next().next().next().text();
            const h1 = parseInt(util.substringBeforeSlash(holeText));
            const h2 = parseInt(util.substringAfterSlash(holeText));
            holeCount = h2 - h1;
        }
        if (holeCount === 0) {
            return;
        }
        message2.publishMessageBoard(name + "还剩余" + holeCount + "孔");

        this.#fuseGem(gemName, name, nameIndex, holeCount, 0);
    }

    #fuseGem(gemName, name, nameIndex, holeCount, holeIndex) {
        if (holeIndex === holeCount) {
            message2.publishMessageBoard(name + "没有孔了，完成");
            return;
        }
        let item = "";
        let c = 0;
        $("input:radio[name='select']").each(function (_idx, radio) {
            const n = $(radio).parent().next().next().text();
            if (n === name) {
                c++;
                if (c - 1 === nameIndex) {
                    // 就是这个
                    item = $(radio).val();
                }
            }
        });

        let lastGemIndex = "";
        $("input:radio[name='baoshi']").each(function (_idx, radio) {
            const name = $(radio).parent().next().text();
            if (name === gemName) {
                lastGemIndex = $(radio).val();
            }
        });
        if (lastGemIndex === "" || lastGemIndex === undefined) {
            // 没有石头了
            message2.publishMessageBoard("没有石头了，终止");
            if (gemName === "幸运宝石") {
                $("#fuseLuckGem").prop("disabled", true);
            }
            if (gemName === "重量宝石") {
                $("#fuseWeightGem").prop("disabled", true);
            }
            if (gemName === "威力宝石") {
                $("#fusePowerGem").prop("disabled", true);
            }
            return;
        }
        this.#doFuseGem(gemName, name, nameIndex, item, lastGemIndex, holeCount, holeIndex);
    }

    #doFuseGem(gemName, name, nameIndex, item, gemIndex, holeCount, holeIndex) {
        const inst = this;
        const credential = page2.generateCredential();
        const request = credential.asRequest();
        request["select"] = item;
        request["baoshi"] = gemIndex;
        request["azukeru"] = "0";
        request["mode"] = "BAOSHI_MAKE";
        network.sendPostRequest("town.cgi", request, function (html) {
            const fuseResult = $(html).find("h2:first").text();
            message2.publishMessageBoard("<b style='color:red'>" + fuseResult + "</b>");

            user.loadRole(credential).then(role => {
                const town = findTownByName(role.townName);
                const request = credential.asRequest();
                request["town"] = town.id;
                request["con_str"] = "50";
                request["mode"] = "BAOSHI_SHOP";
                network.sendPostRequest("town.cgi", request, function (html) {
                    $(".itemClass").remove();
                    $(".gemClass").remove();

                    let list = [];
                    $(html).find("input:radio[name='select']").each(function (_idx, radio) {
                        const tr = $(radio).parent().parent().html();
                        const s = "<tr class='itemClass'>" + tr + "</tr>";
                        list.push(s);
                    });
                    let reverse = list.reverse();
                    reverse.forEach(it => {
                        $("table:eq(6) tr:first").after($(it));
                    });

                    list = [];
                    $(html).find("input:radio[name='baoshi']").each(function (_idx, radio) {
                        const tr = $(radio).parent().parent().html();
                        const s = "<tr class='gemClass'>" + tr + "</tr>";
                        list.push(s);
                    });
                    reverse = list.reverse();
                    reverse.forEach(it => {
                        $("table:eq(7) tr:first").after($(it));
                    });

                    $("input:radio[name='select']").each(function (_idx, radio) {
                        const using = $(radio).parent().next().text();
                        const name = $(radio).parent().next().next().text();
                        if (using === "★" && name !== "宠物蛋") {
                            $(radio).prop("disabled", true);
                        }
                    });

                    const nextIndex = holeIndex + 1;
                    message2.publishMessageBoard(name + "还剩余" + (holeCount - nextIndex) + "孔");
                    inst.#fuseGem(gemName, name, nameIndex, holeCount, nextIndex);
                });
            });
        });
    }
}