// =============================================================================
// Auth Routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/refresh
// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const {
    registerValidator,
    loginValidator,
    refreshValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} = require('../validators/auth.validator');

/**
 * @route   POST /api/auth/register
 * @desc    Create a new user account
 * @access  Public
 */
router.post('/register', registerValidator, validate, controller.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate and return access + refresh tokens
 * @access  Public
 */
router.post('/login', loginValidator, validate, controller.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate refresh token and issue new access token
 * @access  Public
 */
router.post('/refresh', refreshValidator, validate, controller.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke the provided refresh token
 * @access  Public (token in body)
 */
router.post('/logout', refreshValidator, validate, controller.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Trigger password reset flow
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidator, validate, controller.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Set a new password using a reset token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidator, validate, controller.resetPassword);

module.exports = router;
