const crypto = require('crypto');

const generateAesKey = () => {
    return crypto.randomBytes(32);
};

function encryptAesKey(aesKey, publicKey) {
    const encryptedAesKey = crypto.publicEncrypt(Buffer.from(publicKey), aesKey);
    return encryptedAesKey;
}

const cryptoEncryption = (payload, aesKey, publicKey) => {
    try {
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
        const encrypted = Buffer.concat([
            cipher.update(JSON.stringify(payload)),
            cipher.final(),
            cipher.getAuthTag(),
        ]);

        return {
            data: encrypted,
            key: Buffer.concat([iv, encryptAesKey(aesKey, publicKey)]),
        };
    } catch (err) {
        return err;
    }
};

const cryptoDecryption = (encryptedData, aesKey, iv) => {
    try {
        const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
        const authTag = encryptedDataBuffer.slice(encryptedDataBuffer.length - 16);
        const encrypted = encryptedDataBuffer.slice(0, encryptedDataBuffer.length - 16);

        decipher.setAuthTag(authTag);

        const decryptedText = Buffer.concat([
            decipher.update(encrypted),
            decipher.final(),
        ]);

        return decryptedText.toString()
            ? JSON.parse(decryptedText.toString())
            : decryptedText.toString();
    } catch (err) {
        return err;
    }
};

const encryptPayload = (payload, aesKey, publicKey, uuid) => {
    try {
        // Encrypt the Payload using AES Key
        const encryptedPayload = Buffer.from(
            JSON.stringify(cryptoEncryption(JSON.stringify(payload), aesKey, publicKey))
        );

        // Construct the main payload for Create Customer POST Call
        const mainPayload = {
            uuid: uuid,
            data: encryptedPayload,
        };

        // Convert the main payload to base64 string
        return Buffer.from(JSON.stringify(mainPayload)).toString('base64');
    } catch (err) {
        return err;
    }
};

module.exports = {
    generateAesKey,
    encryptAesKey,
    cryptoEncryption,
    cryptoDecryption,
    encryptPayload,
};
