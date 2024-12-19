const {
    cryptoDecryption,
    encryptPayload,
    generateAesKey,
  } = require("./encryption-decryption");
  
  /**
  * @typedef {"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} RequestMethod
  */
  
  /**
  * @typedef {Object.<string, any>} MyObject
  */
  
  /**
  * @typedef {Object} EncryptionConfig
  * @property {string} publicKey
  * @property {string} uuid
  */
  
  /**
  * Calls a secured endpoint.
  * 
  * @param {string} url - The endpoint URL.
  * @param {RequestMethod} method - The HTTP method.
  * @param {object|null} [data=null] - The request payload.
  * @param {object|null} [headerOptions=null] - Additional header options.
  * @param {boolean} [encrypted=false] - Whether to encrypt the payload.
  * @param {EncryptionConfig} [encryptionConfig] - Encryption configuration.
  * @returns {Promise<object>} - The response object.
  */
  async function CallSecuredEndpoint(
    url,
    method,
    data = null,
    headerOptions = null,
    encrypted = false,
    encryptionConfig
  ) {
    let encRes;
    let decRes;
    const aesKey = generateAesKey();
    let requestBody = data ? JSON.stringify(data) : null;
  
    if (method !== "GET" && encrypted && encryptionConfig) {
        requestBody = JSON.stringify({
            data: encryptPayload(
                data,
                aesKey,
                encryptionConfig?.publicKey,
                encryptionConfig?.uuid
            ),
        });
    }
  
    const encBody = requestBody;
    const response = await fetch(url, {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            ...headerOptions,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        ...(method !== "GET" ? { body: requestBody } : null),
    });
  
    let flag = false;
    const headers = response.headers;
    const headerNames = headers.keys();
    const headerObj = {};
  
    for (const header of headerNames) {
        const value = headers.get(header);
        headerObj[header] = value;
    }
  
    if (response.status >= 200 && response.status <= 500) {
        if (encrypted) {
            const jsonResponse = await response.json();
            encRes = jsonResponse.data;
            flag = true;
            if (jsonResponse && jsonResponse.data) {
                decRes = cryptoDecryption(
                    jsonResponse.data,
                    aesKey,
                    aesKey.slice(0, 16)
                );
            }
        }
    }
  
    const returnObj = {
        encryptedRequest: encBody,
        ecryptedResponse: encRes,
        decryptedResponse: flag ? decRes : await response.json(),
        headers: headerObj,
        status: response.status,
    };
  
    return returnObj;
  }
  
  module.exports = { CallSecuredEndpoint };
  