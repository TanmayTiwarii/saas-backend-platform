// =============================================================================
// Subscription Routes
// GET    /api/subscriptions/plans   – list available plans (public)
// POST   /api/subscriptions         – create subscription (ADMIN+)
// GET    /api/subscriptions/me      – get caller's subscription
// PATCH  /api/subscriptions/me      – upgrade/downgrade plan (ADMIN+)
// DELETE /api/subscriptions/me      – cancel subscription (ADMIN+)
// =============================================================================
const router = require('express').Router();
const controller = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
    createSubscriptionValidator,
    updateSubscriptionValidator,
} = require('../validators/subscription.validator');

// Public
router.get('/plans', controller.getPlans);

// Protected
router.use(authenticate);
router.post('/', authorize(['ADMIN', 'SUPER_ADMIN']), createSubscriptionValidator, validate, controller.createSubscription);
router.get('/me', controller.getMySubscription);
router.patch('/me', authorize(['ADMIN', 'SUPER_ADMIN']), updateSubscriptionValidator, validate, controller.updateSubscription);
router.delete('/me', authorize(['ADMIN', 'SUPER_ADMIN']), controller.cancelSubscription);

module.exports = router;
