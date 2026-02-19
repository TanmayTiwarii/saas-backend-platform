// =============================================================================
// Auth Validators – express-validator rule chains
// =============================================================================
const { body } = require('express-validator');

const registerValidator = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
];

const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const refreshValidator = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const forgotPasswordValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidator = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
];

module.exports = {
    registerValidator,
    loginValidator,
    refreshValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
};
