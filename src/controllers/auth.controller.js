// =============================================================================
// Auth Controller – thin request/response layer, delegates to AuthService
// =============================================================================
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        return sendSuccess(res, 201, user, 'Account created successfully');
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const tokens = await authService.login(req.body);
        return sendSuccess(res, 200, tokens, 'Login successful');
    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const tokens = await authService.refresh(req.body.refreshToken);
        return sendSuccess(res, 200, tokens, 'Token refreshed successfully');
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.body.refreshToken);
        return sendSuccess(res, 200, null, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const token = await authService.forgotPassword(req.body.email);
        // Always return success to prevent user enumeration
        const data = process.env.NODE_ENV !== 'production' && token ? { resetToken: token } : null;
        return sendSuccess(res, 200, data, 'If that email is registered, a reset link has been sent');
    } catch (err) {
        next(err);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body);
        return sendSuccess(res, 200, null, 'Password reset successfully. Please log in with your new password.');
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
