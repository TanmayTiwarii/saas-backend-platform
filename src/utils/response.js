// =============================================================================
// Response Utility – standardised JSON envelope for all API responses
// =============================================================================

/**
 * Sends a successful response.
 *
 * @param {Response} res - Express response object
 * @param {number}   statusCode - HTTP status code (default 200)
 * @param {*}        data - Payload to include in the `data` field
 * @param {string}   message - Optional human-readable message
 */
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success') => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Sends an error response.
 *
 * @param {Response} res      - Express response object
 * @param {number}   statusCode - HTTP status code
 * @param {string}   code     - Machine-readable error code (e.g. 'UNAUTHORIZED')
 * @param {string}   message  - Human-readable description
 * @param {Array}    errors   - Optional array of field-level validation errors
 */
const sendError = (res, statusCode = 500, code = 'ERROR', message = 'An error occurred', errors = null) => {
    const body = {
        success: false,
        error: { code, message },
        timestamp: new Date().toISOString(),
    };

    if (errors) body.errors = errors;

    return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
