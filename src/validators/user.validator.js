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
        .isIn(['ADMIN', 'TEACHER', 'STUDENT'])
        .withMessage('Invalid role. Must be ADMIN, TEACHER, or STUDENT'),
];

module.exports = { updateProfileValidator, updateRoleValidator };
