const { EncryptDecryptHelper } = require("@idb-dab/ms-utils");
const config = require('../../test-config');
const axios = require("axios");

async function encryptDecryptHelper() {
    // Getting a public key to encrypt the data
    return await axios
        .get(
            `${config.functional.cryptoService.baseUrl}${config.functional.cryptoService.serviceUrl}`,
            {
                headers: config.functional.requestHeaders
            }
        )
        .then(async (res) => {
            const decodedResult = JSON.parse(Buffer.from(res.data.data, 'base64').toString());
            return new EncryptDecryptHelper(decodedResult);
        })
        .catch((error) => {
            return error;
        });
}

module.exports = { encryptDecryptHelper };
