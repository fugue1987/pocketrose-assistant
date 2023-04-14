/**
 * ============================================================================
 * [ 网 络 通 信 模 块 ]
 * ----------------------------------------------------------------------------
 * 所有与口袋服务端请求的低层实现方法放在这里。
 * 主要包括对口袋cgi的POST和GET请求。
 * 口袋服务端返回的页面编码是gb2312，所以需要使用原生的fetch函数，对返回的HTML解码。
 * ============================================================================
 */

export function sendGetRequest(cgi, callback) {
    fetch(cgi, {method: "GET"})
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            if (callback !== undefined) {
                callback(html);
            }
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}

export function sendPostRequest(cgi, request, callback) {
    fetch(cgi, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(request),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("RESPONSE was not ok");
            }
            return response.arrayBuffer();
        })
        .then((arrayBuffer) => {
            const decoder = new TextDecoder("gb2312");
            const html = decoder.decode(new Uint8Array(arrayBuffer));
            if (callback !== undefined) {
                callback(html);
            }
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}