import crypto from "crypto";

const password = "d6F3Efeq";
const secret = "appSecretKey";
const rounds = 9921;
const keySize = 32;
const algorithm = "aes-256-cbc";
const salt = crypto.createHash("sha1").update(secret).digest("hex");

function encryptData(data: string) {
    try {
        const iv = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(secret, salt, rounds, keySize, "sha512");
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        const encryptedData = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()]);
        return iv.toString("base64") + ":" + encryptedData.toString("base64");
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
 
function decryptData(encData: string) {
    try {
        const textParts = encData.split(":");
        const iv = Buffer.from(textParts.shift(), "base64");
        const encryptedData = Buffer.from(textParts.join(":"), "base64");
        const key = crypto.pbkdf2Sync(secret, salt, rounds, keySize, "sha512");
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
        let decryptedData = decipher.update(encryptedData);
        decryptedData = Buffer.concat([decryptedData, decipher.final()]);
        return JSON.parse(decryptedData.toString());
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
    
export {
    encryptData,
    decryptData
};