/**
 * ============================================================================
 * [ 网 络 相 关 功 能 ]
 * ----------------------------------------------------------------------------
 * 所有与口袋服务端请求的低层实现方法放在这里。
 * 主要包括对口袋cgi的POST和GET请求。
 * 口袋服务端返回的页面编码是gb2312，所以需要使用原生的fetch函数，对返回的HTML解码。
 * ============================================================================
 */

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
            callback(html);
        })
        .catch((error) => {
            console.error("Error raised:", error);
        });
}