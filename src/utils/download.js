export function download(url, method, params) {
    let count = 0;
    let tk = localStorage.getItem('TOKEN');
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Authorization", tk);
    xhr.onreadystatechange = function() {
        if (xhr.status !== 200) {
            if (count == 0) {
                alert("error")
            }
            count++;
            return false;
        }
        if (xhr.readyState == 4 && xhr.status == 200) {
            let name = xhr.getResponseHeader('Content-Disposition');
            if (name) {
                //var sha256 = name.split("-")[0];
                var filename = name.substring(20, name.length);
                filename = decodeURI(escape(filename))
            } else {
                filename = new Date().getTime();
            }

            let type = xhr.getResponseHeader("Content-type");
            let blob = new Blob([xhr.response], { type: type });
            let link = document.createElement('a');
            let url = URL.createObjectURL(blob);
            link.style.display = "none";
            link.href = url;
            link.download = filename;
            document.body.append(link);
            link.click();
            return true;
        }
    }
    xhr.onerror = function() {
        return false;
    }
    xhr.send(params);
}