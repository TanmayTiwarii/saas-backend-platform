// =============================================================================
// Token Utilities – JWT generation & refresh token helpers
// =============================================================================
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

/**
 * Signs a short-lived access token.
 * Payload: { userId, email, role, organizationId? }
 */
const signAccessToken = (payload) => {
    return jwt.sign(payload, env.jwt.accessSecret, {
        expiresIn: env.jwt.accessExpiresIn,
        issuer: 'saas-platform',
        audience: 'saas-platform-client',
    });
};

/**
 * Signs a long-lived refresh token.
 * Only embeds userId to minimise data exposure.
 */
const signRefreshToken = (userId) => {
    return jwt.sign({ userId }, env.jwt.refreshSecret, {
        expiresIn: env.jwt.refreshExpiresIn,
        issuer: 'saas-platform',
        audience: 'saas-platform-client',
    });
};

/**
 * Verifies a refresh token. Throws on invalid/expired.
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, env.jwt.refreshSecret, {
        issuer: 'saas-platform',
        audience: 'saas-platform-client',
    });
};

/**
 * Calculates the expiry Date for a refresh token based on JWT expiry string.
 * Supports formats: '7d', '24h', '60m', '3600s'.
 */
const calcRefreshTokenExpiry = () => {
    const str = env.jwt.refreshExpiresIn; // e.g. '7d'
    const unit = str.slice(-1);
    const value = parseInt(str.slice(0, -1), 10);
    const ms = { d: 86400000, h: 3600000, m: 60000, s: 1000 }[unit] || 86400000;
    return new Date(Date.now() + value * ms);
};

module.exports = { signAccessToken, signRefreshToken, verifyRefreshToken, calcRefreshTokenExpiry };
