// =============================================================================
// Validation Middleware – wraps express-validator result checking
// =============================================================================
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after a chain of express-validator checks.
 * If there are validation errors, returns 422 with structured error details.
 * Otherwise calls next() to pass control to the controller.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formatted = errors.array().map((e) => ({
            field: e.path,
            message: e.msg,
        }));

        return sendError(res, 422, 'VALIDATION_ERROR', 'Request validation failed', formatted);
    }

    next();
};

module.exports = { validate };
