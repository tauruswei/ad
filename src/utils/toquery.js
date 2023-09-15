export const toQuery = function(obj) {
    let str = "";
    for (let k in obj) {
        if (obj[k] instanceof Array) {
            str += k + "=" + obj[k].join(",") + "&";
        } else if (obj[k]) {
            str += k + "=" + obj[k] + "&";
        }
    }
    return str.slice(0, -1);
}