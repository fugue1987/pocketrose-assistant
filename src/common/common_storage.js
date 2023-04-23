export function isLocalStorageDisabled() {
    return !window.localStorage
}

export function set(key, value) {
    if (isLocalStorageDisabled()) {
        __setIntoCookie(key, value);
    } else {
        __setIntoLocalStorage(key, value);
    }
}

export function get(key) {
    if (isLocalStorageDisabled()) {
        return __getFromCookie(key);
    } else {
        return __getFromLocalStorage(key);
    }
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

// ----------------------------------------------------------------------------
// P R I V A T E   F U N C T I O N S
// ----------------------------------------------------------------------------

function __setIntoCookie(key, value) {
    Cookies.set(key, value, {expires: 36500});
}

function __getFromCookie(key) {
    return Cookies.get(key);
}

function __setIntoLocalStorage(key, value) {
    localStorage.setItem(key, value);
}

function __getFromLocalStorage(key) {
    return localStorage.getItem(key);
}