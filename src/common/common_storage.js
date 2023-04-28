export function isLocalStorageDisabled() {
    return !window.localStorage
}

export function remove(key) {
    if (isLocalStorageDisabled()) {
        Cookies.remove(key);
    } else {
        localStorage.removeItem(key);
    }
}

export function set(key, value) {
    if (isLocalStorageDisabled()) {
        Cookies.set(key, value, {expires: 36500});
    } else {
        localStorage.setItem(key, value);
    }
}

export function get(key) {
    if (isLocalStorageDisabled()) {
        return Cookies.get(key);
    } else {
        return localStorage.getItem(key);
    }
}

export function getString(key) {
    const value = localStorage.getItem(key);
    if (value === undefined ||
        value === null ||
        value === "undefined" ||
        value === "null") {
        return "";
    }
    return value;
}

export function getBoolean(key) {
    const value = localStorage.getItem(key);
    if (value === undefined ||
        value === null ||
        value === "" ||
        value === "undefined" ||
        value === "null") {
        return false;
    }
    return value !== "0";
}

export function getInteger(key, defaultValue) {
    const value = localStorage.getItem(key);
    if (value === undefined ||
        value === null ||
        value === "" ||
        value === "undefined" ||
        value === "null") {
        return defaultValue;
    }
    return parseInt(value);
}

export function getFloat(key, defaultValue) {
    const value = localStorage.getItem(key);
    if (value === undefined ||
        value === null ||
        value === "" ||
        value === "undefined" ||
        value === "null") {
        return defaultValue;
    }
    return parseFloat(value);
}