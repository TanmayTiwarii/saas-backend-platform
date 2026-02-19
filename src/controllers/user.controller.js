// =============================================================================
// User Controller
// =============================================================================
const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response');

const getMe = async (req, res, next) => {
    try {
        const user = await userService.getMe(req.user.userId);
        return sendSuccess(res, 200, user);
    } catch (err) {
        next(err);
    }
};

const updateMe = async (req, res, next) => {
    try {
        const { firstName, lastName } = req.body;
        const user = await userService.updateMe(req.user.userId, { firstName, lastName });
        return sendSuccess(res, 200, user, 'Profile updated');
    } catch (err) {
        next(err);
    }
};

const deleteMe = async (req, res, next) => {
    try {
        await userService.deleteMe(req.user.userId);
        return sendSuccess(res, 200, null, 'Account deactivated');
    } catch (err) {
        next(err);
    }
};

// Admin endpoints
const listUsers = async (req, res, next) => {
    try {
        const { page, limit, search } = req.query;
        const result = await userService.listUsers({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            search,
        });
        return sendSuccess(res, 200, result);
    } catch (err) {
        next(err);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);
        return sendSuccess(res, 200, user);
    } catch (err) {
        next(err);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const user = await userService.updateUserRole(req.params.id, req.body.role);
        return sendSuccess(res, 200, user, 'User role updated');
    } catch (err) {
        next(err);
    }
};

module.exports = { getMe, updateMe, deleteMe, listUsers, getUserById, updateUserRole };
