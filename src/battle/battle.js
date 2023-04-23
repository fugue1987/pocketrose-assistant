/**
 * ============================================================================
 * [ 战 斗 功 能 模 块 ]
 * ============================================================================
 */

import * as util from "../common/common_util";
import * as common_constant from "../common/common_constant";
import * as common_message from "../common/common_message";
import * as setup from "../setup/setup";

export class BattleRequestInterceptor {

    constructor() {
    }

    process() {
        const text = $("body").text();
        if (text.includes("＜＜ - 秘宝之岛 - ＞＞") ||
            text.includes("＜＜ - 初级之森 - ＞＞") ||
            text.includes("＜＜ - 中级之塔 - ＞＞") ||
            text.includes("＜＜ - 上级之洞窟 - ＞＞") ||
            text.includes("＜＜ - 十二神殿 - ＞＞")) {
            $('a[target="_blank"]').attr('tabIndex', -1);
            this.#doProcess();
        }
    }

    #doProcess() {
        const htmlText = $("body").text();
        if (htmlText.includes("入手！")) {
            this.#processHarvestingIfNecessary();
        }
        __battle(htmlText);
    }

    #processHarvestingIfNecessary() {
        const candidates = [];
        $("p").each(function (_idx, p) {
            if ($(p).text().includes("入手！")) {
                const html = $(p).html();
                html.split("<br>").forEach(it => {
                    if (it.endsWith("入手！")) {
                        candidates.push(it);
                    }
                });
            }
        });
        if (candidates.length > 0) {
            const imageHTML = common_constant.getNPCImageHTML("骷髅");
            common_message.createFooterMessage(imageHTML);

            for (const it of candidates) {
                common_message.writeFooterMessage("<b style='font-size:150%'>" + it + "</b><br>");
            }
            common_message.writeFooterMessage("哎呦，你出货了，赶紧收藏好的，不然Hind要来a了......");
        }
    }
}

export function __battle(htmlText) {
    $('input[value="返回住宿"]').attr('id', 'innButton');
    $('input[value="返回修理"]').attr('id', 'blacksmithButton');
    $('input[value="返回城市"]').attr('id', 'returnButton');
    $('input[value="返回更新"]').attr('id', 'updateButton');
    $('input[value="返回银行"]').attr('id', 'bankButton');

    // 返回更新按钮不再需要
    $('#updateButton').parent().remove();

    // 修改返回修理按钮的行为，直接变成全部修理
    $('#blacksmithButton').parent().prepend('<input type="hidden" name="arm_mode" value="all">');
    //$('#blacksmithButton').attr('value', __cookie_getRepairButtonText());
    $('input[value="MY_ARM"]').attr('value', 'MY_ARM2');

    // 修改返回银行按钮的行为，直接变成全部存入
    $('#bankButton').parent().prepend('<input type="hidden" name="azukeru" value="all">');
    //$('#bankButton').attr('value', __cookie_getDepositButtonText());
    $('input[value="BANK"]').attr('value', 'BANK_SELL');

    // 修改返回住宿按钮
    //$('#innButton').attr('value', __cookie_getLodgeButtonText());

    // 修改返回按钮
    //$('#returnButton').attr('value', __cookie_getReturnButtonText());

    var resultText = $('#ueqtweixin').text();
    // 耐久度初始值10000以下的最大的质数，表示没有发现回血道具
    var endure = 9973;
    var start = resultText.indexOf("(自动)使用。(剩余");
    if (start != -1) {
        // 找到了回血道具
        endure = resultText.substring(start + 10, start + 13);
    }

    if (__battle_checkIfShouldGoToBlacksmith(resultText, endure)) {
        // 只保留修理按钮
        $("#blacksmithButton").attr('tabIndex', 1);
        $('#innButton').parent().remove();
        $('#bankButton').parent().remove();
        $('#returnButton').parent().remove();
        if (setup.isBattleForceRecommendationEnabled()) {
            $("#blacksmithButton").focus();
        }
        if (setup.isBattleResultAutoScrollEnabled()) {
            document.getElementById("blacksmithButton").scrollIntoView();
        }
    } else {
        // 不需要修理按钮
        $('#blacksmithButton').parent().remove();
        const zodiacBattle = htmlText.indexOf("＜＜ - 十二神殿 - ＞＞") !== -1;

        let returnCode = __battle_checkIfShouldGoToInn(htmlText, endure);
        if (returnCode === 1) {
            // 住宿优先
            $("#innButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
            if (setup.isBattleForceRecommendationEnabled()) {
                $('#bankButton').parent().remove();
                $("#innButton").focus();
            }
            if (setup.isBattleResultAutoScrollEnabled()) {
                document.getElementById("innButton").scrollIntoView();
            }
            if (zodiacBattle && setup.isZodiacFlashBattleEnabled()) {
                $("#innButton").trigger("click");
            }
        }
        if (returnCode === 2) {
            // 存钱优先
            $("#bankButton").attr('tabIndex', 1);
            $('#returnButton').parent().remove();
            if (setup.isBattleForceRecommendationEnabled()) {
                $('#innButton').parent().remove();
                $("#bankButton").focus();
            }
            if (setup.isBattleResultAutoScrollEnabled()) {
                document.getElementById("bankButton").scrollIntoView();
            }
            if (zodiacBattle && setup.isZodiacFlashBattleEnabled()) {
                $("#bankButton").trigger("click");
            }
        }
        if (returnCode === 3) {
            // 返回优先
            $("#returnButton").attr('tabIndex', 1);
            if (setup.isBattleForceRecommendationEnabled()) {
                $('#innButton').parent().remove();
                $('#bankButton').parent().remove();
                $("#returnButton").focus();
            }
            if (setup.isBattleResultAutoScrollEnabled()) {
                document.getElementById("returnButton").scrollIntoView();
            }
            if (zodiacBattle && setup.isZodiacFlashBattleEnabled()) {
                $("#returnButton").trigger("click");
            }
        }
    }
}

// 分析是否需要去修理
function __battle_checkIfShouldGoToBlacksmith(resultText, recoverItemEndure) {
    if (recoverItemEndure % 100 == 0) {
        // 当无忧之果的耐久度掉到100整倍数时触发修理装备。
        return true;
    }

    // 然后判断剩余的所有装备的耐久，只要有任意一件装备的耐久低于100，
    // 也触发修理装备。这里需要注意的是要排除掉大师球、宗师球、怪兽球
    // 和宠物蛋。。因此判断耐久在10~99区间吧，可以排除掉大师球和宗师球。
    var sourceText = resultText;
    var lowEndures = [];
    for (var i = 0; i < 4; i++) {
        // 最多查四次耐久度剩余
        var startIndex = sourceText.indexOf("剩余");
        if (startIndex != -1) {
            sourceText = sourceText.substring(startIndex + 2);
            var numbers = [];
            for (var j = 0; j < sourceText.length; j++) {
                if (sourceText[j] >= '0' && sourceText[j] <= '9') {
                    numbers.push(sourceText[j]);
                } else {
                    var number = "";
                    for (var k = 0; k < numbers.length; k++) {
                        number += numbers[k];
                    }
                    numbers = [];
                    if (number < setup.getRepairMinLimitation()) {
                        lowEndures.push(number);
                    }
                    break;
                }
            }
        }
    }
    if (lowEndures.length == 0) {
        // 没有装备耐久掉到阈值之下，忽略
        return false;
    }
    for (var idx = 0; idx < lowEndures.length; idx++) {
        var currentEndure = lowEndures[idx];
        if (resultText.indexOf("大师球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("宗师球球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("超力怪兽球剩余" + currentEndure + "耐久度") == -1 &&
            resultText.indexOf("宠物蛋剩余" + currentEndure + "耐久度") == -1) {
            // 这个低耐久的装备不是上述需要排除的，说明真的有装备耐久低了，需要修理
            return true;
        }
    }

    return false;
}

// 1. 战败需要住宿
// 2. 十二宫战斗胜利不需要住宿，直接存钱更好
// 3. 战胜/平手情况下，检查生命力是否低于某个阈值
// 返回值：
// 1 - 表示住宿
// 2 - 表示存钱
// 3 - 表示返回
function __battle_checkIfShouldGoToInn(htmlText, recoverItemEndure) {
    if (htmlText.indexOf("将 怪物 全灭！") == -1) {
        // 战败了，直接去住宿吧
        return 1;
    }
    if (htmlText.indexOf("＜＜ - 十二神殿 - ＞＞") != -1 || htmlText.indexOf("＜＜ - 秘宝之岛 - ＞＞") != -1) {
        // 十二宫和秘宝之岛战斗胜利不需要住宿，直接存钱更好
        return 2;
    }
    let depositBattleNumber = setup.getDepositBattleCount();
    if (depositBattleNumber > 0 && recoverItemEndure % depositBattleNumber == 0) {
        // 存钱战数到了
        return 2;
    }
    let playerName = "";
    let health = 0;
    let maxHealth = 0;
    let mana = 0;
    let maxMana = 0;
    $("td:parent").each(function (index, element) {
        var img = $(element).children("img");
        var src = img.attr("src");
        if (src != undefined && src.indexOf("https://pocketrose.itsns.net.cn/pocketrose/") != -1) {
            // 通过第一个头像找到玩家的名字
            if (playerName == "") {
                playerName = img.attr("alt");
            }
        }
        if (playerName === $(element).text()) {
            let healthText = $(element).next().text();
            health = util.substringBeforeSlash(healthText);
            maxHealth = util.substringAfterSlash(healthText);

            let manaText = $(element).next().next().text();
            mana = util.substringBeforeSlash(manaText);
            maxMana = util.substringAfterSlash(manaText);
        }
    });
    // 生命力低于最大值的配置比例，住宿推荐
    if (health <= maxHealth * setup.getLodgeHealthLostRatio()) {
        return 1;
    }
    // 如果MANA小于50%并且小于配置点数，住宿推荐
    if (mana <= maxMana * 0.5 && mana <= setup.getLodgeManaLostPoint()) {
        return 1;
    }
    if (setup.getDepositBattleCount() > 0) {
        // 设置了定期存钱，但是没有到战数，那么就直接返回吧
        return 3;
    } else {
        // 没有设置定期存钱，那就表示每战都存钱
        return 2;
    }
}