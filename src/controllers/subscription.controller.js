// =============================================================================
// Subscription Controller
// =============================================================================
const subscriptionService = require('../services/subscription.service');
const { sendSuccess } = require('../utils/response');

const getPlans = (req, res) => {
    const plans = subscriptionService.getPlans();
    return sendSuccess(res, 200, plans, 'Available subscription plans');
};

const createSubscription = async (req, res, next) => {
    try {
        const sub = await subscriptionService.createSubscription(req.body);
        return sendSuccess(res, 201, sub, 'Subscription created');
    } catch (err) {
        next(err);
    }
};

const getMySubscription = async (req, res, next) => {
    try {
        const sub = await subscriptionService.getMySubscription(req.user.organizationId);
        return sendSuccess(res, 200, sub);
    } catch (err) {
        next(err);
    }
};

const updateSubscription = async (req, res, next) => {
    try {
        const sub = await subscriptionService.updateSubscription(req.user.organizationId, req.body);
        return sendSuccess(res, 200, sub, 'Subscription updated');
    } catch (err) {
        next(err);
    }
};

const cancelSubscription = async (req, res, next) => {
    try {
        const sub = await subscriptionService.cancelSubscription(req.user.organizationId);
        return sendSuccess(res, 200, sub, 'Subscription cancelled');
    } catch (err) {
        next(err);
    }
};

module.exports = { getPlans, createSubscription, getMySubscription, updateSubscription, cancelSubscription };
