export const base64 = {
    decode: (str) => {
        return decodeURIComponent(atob(str));
    },
    enncode: (str) => {
        return btoa(encodeURIComponent(str));
    }
}