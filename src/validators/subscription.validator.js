// =============================================================================
// Subscription Validators
// =============================================================================
const { body, param } = require('express-validator');

const createSubscriptionValidator = [
    body('organizationId').isUUID().withMessage('Valid organization ID is required'),
    body('plan')
        .isIn(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])
        .withMessage('Invalid plan. Must be FREE, STARTER, PRO, or ENTERPRISE'),
];

const updateSubscriptionValidator = [
    body('plan')
        .isIn(['FREE', 'STARTER', 'PRO', 'ENTERPRISE'])
        .withMessage('Invalid plan'),
];

module.exports = { createSubscriptionValidator, updateSubscriptionValidator };
