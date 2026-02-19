// =============================================================================
// Auth Middleware – verifies JWT access token on protected routes
// =============================================================================
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { sendError } = require('../utils/response');

/**
 * Extracts and verifies the Bearer access token from the Authorization header.
 * Attaches the decoded payload to `req.user` on success.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'UNAUTHORIZED', 'Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.jwt.accessSecret);
        req.user = decoded; // { userId, email, role, organizationId? }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 401, 'TOKEN_EXPIRED', 'Access token has expired');
        }
        return sendError(res, 401, 'INVALID_TOKEN', 'Access token is invalid');
    }
};

module.exports = { authenticate };
