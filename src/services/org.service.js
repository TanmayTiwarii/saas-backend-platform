// =============================================================================
// Organization Service
// =============================================================================
const prisma = require('../config/db');

const ORG_SELECT = {
    id: true,
    name: true,
    slug: true,
    description: true,
    logoUrl: true,
    website: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};

// ---------------------------------------------------------------------------
// Create organisation and auto-assign creator as ADMIN member
// ---------------------------------------------------------------------------
const createOrganization = async (userId, { name, slug, description, website }) => {
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
        const err = new Error('An organization with this slug already exists');
        err.status = 409;
        err.code = 'SLUG_TAKEN';
        throw err;
    }

    return prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
            data: { name, slug, description, website },
            select: ORG_SELECT,
        });

        await tx.membership.create({ data: { userId, organizationId: org.id, role: 'ADMIN' } });

        // Auto-provision a FREE subscription
        await tx.subscription.create({
            data: {
                organizationId: org.id,
                plan: 'FREE',
                status: 'ACTIVE',
            },
        });

        return org;
    });
};

// ---------------------------------------------------------------------------
// Get the authenticated user's primary organisation
// ---------------------------------------------------------------------------
const getMyOrganization = async (userId) => {
    const membership = await prisma.membership.findFirst({
        where: { userId },
        orderBy: { joinedAt: 'asc' },
        include: {
            organization: {
                select: {
                    ...ORG_SELECT,
                    subscription: true,
                    _count: { select: { memberships: true } },
                },
            },
        },
    });

    if (!membership) {
        const err = new Error('You are not a member of any organization');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return membership.organization;
};

// ---------------------------------------------------------------------------
// Update organisation (only ADMIN of that org or SUPER_ADMIN)
// ---------------------------------------------------------------------------
const updateOrganization = async (organizationId, data) => {
    return prisma.organization.update({
        where: { id: organizationId },
        data,
        select: ORG_SELECT,
    });
};

// ---------------------------------------------------------------------------
// Deactivate organisation
// ---------------------------------------------------------------------------
const deleteOrganization = async (organizationId) => {
    await prisma.organization.update({
        where: { id: organizationId },
        data: { isActive: false },
    });
};

// ---------------------------------------------------------------------------
// List members of an organisation (paginated)
// ---------------------------------------------------------------------------
const listMembers = async (organizationId, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const [members, total] = await prisma.$transaction([
        prisma.membership.findMany({
            where: { organizationId },
            skip,
            take: limit,
            include: {
                user: {
                    select: { id: true, email: true, firstName: true, lastName: true, isActive: true },
                },
            },
            orderBy: { joinedAt: 'asc' },
        }),
        prisma.membership.count({ where: { organizationId } }),
    ]);

    return { members, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Invite (add) a user to an organisation by email
// ---------------------------------------------------------------------------
const inviteMember = async (organizationId, { email, role = 'MEMBER' }) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        const err = new Error('No account found with that email');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    const existing = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId } },
    });
    if (existing) {
        const err = new Error('User is already a member of this organization');
        err.status = 409;
        err.code = 'ALREADY_MEMBER';
        throw err;
    }

    return prisma.membership.create({
        data: { userId: user.id, organizationId, role },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
};

// ---------------------------------------------------------------------------
// Remove a member from an organisation
// ---------------------------------------------------------------------------
const removeMember = async (organizationId, targetUserId) => {
    const membership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: targetUserId, organizationId } },
    });

    if (!membership) {
        const err = new Error('Membership not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    await prisma.membership.delete({
        where: { userId_organizationId: { userId: targetUserId, organizationId } },
    });
};

module.exports = {
    createOrganization,
    getMyOrganization,
    updateOrganization,
    deleteOrganization,
    listMembers,
    inviteMember,
    removeMember,
};
