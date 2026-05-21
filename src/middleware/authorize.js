// =============================================================================
// Authorize Middleware – Role-Based Access Control (RBAC)
// Roles: ADMIN > TEACHER > STUDENT
// =============================================================================
const { sendError } = require('../utils/response');

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY = ['STUDENT', 'TEACHER', 'ADMIN'];

/**
 * Returns middleware that allows access only to users whose role
 * is in the provided `allowedRoles` array.
 *
 * Usage: router.get('/route', authenticate, authorize(['ADMIN', 'TEACHER']), handler)
 *
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
        }

        const { role } = req.user;

        if (!allowedRoles.includes(role)) {
            return sendError(
                res,
                403,
                'FORBIDDEN',
                `Access denied. Required roles: ${allowedRoles.join(', ')}`
            );
        }

        next();
    };
};

/**
 * Returns middleware that allows users whose role meets a minimum hierarchy level.
 * e.g. requireMinRole('TEACHER') allows TEACHER and ADMIN
 *
 * @param {string} minRole - Minimum role required (STUDENT | TEACHER | ADMIN)
 */
const requireMinRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
        }

        const userLevel = ROLE_HIERARCHY.indexOf(req.user.role);
        const requiredLevel = ROLE_HIERARCHY.indexOf(minRole);

        if (userLevel < requiredLevel) {
            return sendError(
                res,
                403,
                'FORBIDDEN',
                `Insufficient permissions. Minimum required role: ${minRole}`
            );
        }

        next();
    };
};

/**
 * Ensures the authenticated user is operating on their own resource,
 * OR is an ADMIN (can act on behalf of others).
 *
 * The target user ID is read from `req.params[paramKey]`.
 */
const authorizeOwnerOrAdmin = (paramKey = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
        }

        const targetId = req.params[paramKey];
        const { userId, role } = req.user;

        if (userId === targetId || role === 'ADMIN') {
            return next();
        }

        return sendError(res, 403, 'FORBIDDEN', 'You can only access your own resources');
    };
};

module.exports = { authorize, requireMinRole, authorizeOwnerOrAdmin };
