require('dotenv').config();

const config = {
    performance: {
        cryptoService: {
            baseUrl: process.env.CRYPTO_BASE_URL || "http://127.0.0.1:3010",
            serviceUrl: process.env.CRYPTO_GET_RSA_KEYS_URL || '/api/crypto/v1/keys',
        },
    },
    e2e: {
        baseUrl: process.env.BASE_URL || 'http://127.0.0.1:3000'
    }
};

module.exports = config;
