import CryptoJS from "crypto-js";


export function encryptAES(word) {
    if (!word) {
        return word;
    }
    let salt = CryptoJS.enc.Utf8.parse("BLOCKCHAINAESKEY");
    let offset = CryptoJS.enc.Utf8.parse("AESKEYBLOCKCHAIN");
    
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, salt, {
        iv: offset,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString().toUpperCase();
}
export function decryptAES(word) {
    if (!word) {
        return word;
    }
    let salt = CryptoJS.enc.Utf8.parse("BLOCKCHAINAESKEY");
    let offset = CryptoJS.enc.Utf8.parse("AESKEYBLOCKCHAIN");
    
    let decrypted = CryptoJS.AES.decrypt(word.toString(), salt, {
        iv: offset,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
}