export const AppHelper = {
    getURLParam:(key)=>{
        let curUrl = new URL(window.location)
		let curUrlParams = curUrl.searchParams;
		let value = curUrlParams.get(key);
        return value;
    },
}
export const DateHelper = {
    toString: (date, fmt) => {
        if (!date) return "";
        if (!fmt) fmt = "yyyy-MM-dd hh:mm:ss";
        let d = new Date(date);
        let o = {
            "M+": d.getMonth() + 1, //月份
            "d+": d.getDate(), //日
            "h+": d.getHours(), //小时
            "m+": d.getMinutes(), //分
            "s+": d.getSeconds(), //秒
            "q+": Math.floor((d.getMonth() + 3) / 3), //季度
            S: d.getMilliseconds(), //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return fmt;
    },
    getTimestamp:(date)=>{
        if(!date) return;
        let d = new Date(date);
        let timestamp = d.getTime()
        return timestamp;
    },
    getDay: (day) => {
        let today = new Date();
        let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
        today.setTime(targetday_milliseconds);
        return today;
    }
}
export const StringHelper = {
    isEmpty: (param) => {
        if (!param) return true
        else {
            if (!typeof param == "string") param = param.toString();
            return param.length
        }
    }
}
export const ArrayHelper = {
    isEmpty: (param) => {
        if (param == null) return true;
        else {
            if (!param instanceof Array) throw "error in type！"
            return param.length;
        }
    },
    toObject: (arr) => {
        if (!arr.length) return;
        let obj = {};
        arr.forEach((item) => {
            obj[item.key] = item.value ? item.value : "";
        });
        return obj;
    }
}
export const ObjectHelper = {
    isEmpty: (param) => {
        if (param == null) return true;
        else {
            if (!Object.prototype.toString.call(param) == '[object Object]') throw "error in type！"
            return Object.keys(param).length;
        }
    }
}