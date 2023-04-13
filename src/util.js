/**
 * ============================================================================
 * [ 简 单 的 工 具 函 数 ]
 * ----------------------------------------------------------------------------
 * 对js不熟，如果有现成的函数，就尽量替换。
 * ============================================================================
 */

export function substringBefore(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(0, idx);
}

export function substringAfter(text, searchString) {
    let idx = text.indexOf(searchString);
    if (idx === -1) {
        return text;
    }
    return text.substring(idx + searchString.length);
}

export function substringBetween(text, leftString, rightString) {
    return substringBefore(substringAfter(text, leftString), rightString);
}
