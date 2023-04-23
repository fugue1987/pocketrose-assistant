function set(key, value) {
    if (!window.localStorage) {
        __setIntoCookie(key, value);
    } else {
        __setIntoLocalStorage(key, value);
    }
}

function get(key) {
    let value;
    if (!window.localStorage) {
        value = __getFromCookie(key);
    } else {
        value = __getFromLocalStorage(key);
    }
    return value;
}

function getBoolean(key) {
    const value = get(key);
    if (value === undefined || value === null || value === "") {
        return false;
    }
    return value !== "0";
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