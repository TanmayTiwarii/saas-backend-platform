// =============================================================================
// Subscription Service
// =============================================================================
const prisma = require('../config/db');

const PLAN_LIMITS = {
    FREE: { seats: 3, features: ['basic_api'] },
    STARTER: { seats: 10, features: ['basic_api', 'webhooks'] },
    PRO: { seats: 50, features: ['basic_api', 'webhooks', 'analytics'] },
    ENTERPRISE: { seats: Infinity, features: ['basic_api', 'webhooks', 'analytics', 'sso', 'audit_logs'] },
};

// ---------------------------------------------------------------------------
// Get all available plans (public)
// ---------------------------------------------------------------------------
const getPlans = () => {
    return Object.entries(PLAN_LIMITS).map(([key, value]) => ({
        id: key,
        name: key.charAt(0) + key.slice(1).toLowerCase(),
        ...value,
    }));
};

// ---------------------------------------------------------------------------
// Create/attach subscription to an organisation
// ---------------------------------------------------------------------------
const createSubscription = async ({ organizationId, plan }) => {
    const existing = await prisma.subscription.findUnique({ where: { organizationId } });
    if (existing) {
        const err = new Error('Organization already has a subscription. Use update to change plan.');
        err.status = 409;
        err.code = 'ALREADY_SUBSCRIBED';
        throw err;
    }

    return prisma.subscription.create({
        data: {
            organizationId,
            plan,
            status: plan === 'FREE' ? 'ACTIVE' : 'TRIALING',
            trialEndsAt: plan !== 'FREE' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
};

// ---------------------------------------------------------------------------
// Get the caller's organization subscription
// ---------------------------------------------------------------------------
const getMySubscription = async (organizationId) => {
    if (!organizationId) {
        const err = new Error('No organization associated with your account');
        err.status = 400;
        err.code = 'NO_ORGANIZATION';
        throw err;
    }

    const sub = await prisma.subscription.findUnique({
        where: { organizationId },
        include: { organization: { select: { id: true, name: true, slug: true } } },
    });

    if (!sub) {
        const err = new Error('Subscription not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return { ...sub, planDetails: PLAN_LIMITS[sub.plan] };
};

// ---------------------------------------------------------------------------
// Upgrade / downgrade plan
// ---------------------------------------------------------------------------
const updateSubscription = async (organizationId, { plan }) => {
    const sub = await prisma.subscription.findUnique({ where: { organizationId } });
    if (!sub) {
        const err = new Error('No active subscription found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return prisma.subscription.update({
        where: { organizationId },
        data: {
            plan,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
};

// ---------------------------------------------------------------------------
// Cancel subscription
// ---------------------------------------------------------------------------
const cancelSubscription = async (organizationId) => {
    const sub = await prisma.subscription.findUnique({ where: { organizationId } });
    if (!sub) {
        const err = new Error('No subscription found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return prisma.subscription.update({
        where: { organizationId },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
};

module.exports = { getPlans, createSubscription, getMySubscription, updateSubscription, cancelSubscription };
