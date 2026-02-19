// =============================================================================
// User Validators
// =============================================================================
const { body, param } = require('express-validator');

const updateProfileValidator = [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
];

const updateRoleValidator = [
    param('id').isUUID().withMessage('Invalid user ID'),
    body('role')
        .isIn(['VIEWER', 'MEMBER', 'ADMIN', 'SUPER_ADMIN'])
        .withMessage('Invalid role. Must be VIEWER, MEMBER, ADMIN, or SUPER_ADMIN'),
];

module.exports = { updateProfileValidator, updateRoleValidator };
