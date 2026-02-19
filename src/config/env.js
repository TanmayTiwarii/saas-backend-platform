// =============================================================================
// Environment variable loader & validator
// =============================================================================
require('dotenv').config();

const required = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        url: process.env.DATABASE_URL,
    },

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,   // e.g. '15m'
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // e.g. '7d'
    },

    bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
};
