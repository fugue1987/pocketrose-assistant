export function __cookie_getEnablePokemonWiki() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_POKEMON_WIKI");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

export function __cookie_getEnableSoldAutoDeposit() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_SOLD_AUTO_DEPOSIT");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

export function __cookie_getHealthLoseAutoLodgeRatio() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__HEALTH_LOSE_AUTO_LODGE_RATIO");
    if (value === undefined) {
        return 0.6;
    }
    return parseFloat(value);
}

export function __cookie_getManaLoseAutoLodgePoint() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__MANA_LOSE_AUTO_LODGE_POINT");
    if (value === undefined) {
        return 100;
    }
    return parseInt(value);
}

export function __cookie_getRepairItemThreshold() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__REPAIR_ITEM_THRESHOLD");
    if (value === undefined) {
        return 100;
    }
    return parseInt(value);
}

export function __cookie_getDepositBattleNumber() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__DEPOSIT_BATTLE_NUMBER");
    if (value === undefined) {
        return 10;
    }
    return parseInt(value);
}

export function __cookie_getReturnButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__RETURN_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "少年輕輕的離開，沒有帶走一片雲彩！";
    }
    return unescape(value);
}

export function __cookie_getDepositButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__DEPOSIT_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "順風不浪，逆風不慫，身上不要放太多的錢！";
    }
    return unescape(value);
}

export function __cookie_getLodgeButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__LODGE_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "你看起來很疲憊的樣子呀，媽媽喊你回去休息啦！";
    }
    return unescape(value);
}

export function __cookie_getRepairButtonText() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__REPAIR_BUTTON_TEXT");
    if (value === undefined || value === "") {
        return "去修理下裝備吧，等爆掉的時候你就知道痛了！";
    }
    return unescape(value);
}

export function __cookie_getEnableBattleAutoScroll() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_AUTO_SCROLL");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

export function __cookie_getEnableBattleForceRecommendation() {
    let value = Cookies.get("_POCKETROSE_ASSISTANT__ENABLE_BATTLE_FORCE_RECOMMENDATION");
    if (value === undefined) {
        return false;
    }
    return value !== "0";
}

export function __cookie_getEquipmentSet(no, id) {
    const cookieKey = "_POCKETROSE_ASSISTANT__EQUIPMENT_SET_" + no + "_" + id;
    return getAndParseCookie(cookieKey, ["NONE", "0", "NONE", "0", "NONE", "0"], function (value) {
        const text = unescape(value);
        return text.split("_");
    });
}

/**
 * 检查是否启用十二宫战斗时的极速模式
 * @returns boolean 默认禁用
 * @private
 */
export function __cookie_getEnableZodiacFlashBattle() {
    const cookieKey = "_POCKETROSE_ASSISTANT__ENABLE_ZODIAC_FLASH_BATTLE";
    return getAndParseCookie(cookieKey, false, function (value) {
        return value !== "0";
    });
}

/**
 * 读取指定键值的Cookie内容并调用回调函数解析。
 * @param cookieKey Cookie键值
 * @param defaultValue 如果没有设置此Cookie时的默认返回值
 * @param callback 回调函数用于解析Cookie值
 * @returns {*}
 */
function getAndParseCookie(cookieKey, defaultValue, callback) {
    let value = Cookies.get(cookieKey);
    if (value === undefined || value === "") {
        return defaultValue;
    }
    return callback(value);
}