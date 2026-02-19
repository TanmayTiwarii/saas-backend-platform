// =============================================================================
// Organization Validators
// =============================================================================
const { body, param } = require('express-validator');

const createOrgValidator = [
    body('name').trim().notEmpty().withMessage('Organization name is required'),
    body('slug')
        .trim()
        .notEmpty()
        .withMessage('Slug is required')
        .matches(/^[a-z0-9-]+$/)
        .withMessage('Slug must be lowercase alphanumeric with hyphens only'),
    body('description').optional().trim(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
];

const updateOrgValidator = [
    body('name').optional().trim().notEmpty().withMessage('Organization name cannot be empty'),
    body('description').optional().trim(),
    body('website').optional().isURL().withMessage('Website must be a valid URL'),
    body('logoUrl').optional().isURL().withMessage('Logo URL must be a valid URL'),
];

const inviteMemberValidator = [
    param('id').isUUID().withMessage('Invalid organization ID'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role')
        .optional()
        .isIn(['VIEWER', 'MEMBER', 'ADMIN'])
        .withMessage('Invalid role. Must be VIEWER, MEMBER, or ADMIN'),
];

module.exports = { createOrgValidator, updateOrgValidator, inviteMemberValidator };
