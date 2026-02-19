// =============================================================================
// Error Handler Middleware – global catch-all for unhandled errors
// =============================================================================
const logger = require('../config/logger');
const { sendError } = require('../utils/response');

/**
 * Global Express error handler. Must be registered LAST in app.js.
 * Catches errors thrown or passed via next(err) from any route/middleware.
 */
const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message}`, { stack: err.stack, path: req.path, method: req.method });

    // Prisma known request errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        return sendError(res, 409, 'CONFLICT', `${field} already exists`);
    }

    if (err.code === 'P2025') {
        return sendError(res, 404, 'NOT_FOUND', 'Record not found');
    }

    // JWT errors bubble up if not caught in middleware
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'INVALID_TOKEN', 'Token is invalid');
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'TOKEN_EXPIRED', 'Token has expired');
    }

    // Generic server error — hide internals in production
    const message =
        process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message;

    return sendError(res, err.status || 500, 'INTERNAL_SERVER_ERROR', message);
};

/**
 * 404 handler for unmatched routes. Register BEFORE errorHandler.
 */
const notFound = (req, res) => {
    sendError(res, 404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`);
};

module.exports = { errorHandler, notFound };
