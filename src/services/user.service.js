// =============================================================================
// User Service – profile management and admin operations
// =============================================================================
const prisma = require('../config/db');

const SAFE_USER_SELECT = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    isEmailVerified: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
};

// ---------------------------------------------------------------------------
// Get current authenticated user's profile
// ---------------------------------------------------------------------------
const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            ...SAFE_USER_SELECT,
            memberships: {
                select: {
                    role: true,
                    joinedAt: true,
                    organization: { select: { id: true, name: true, slug: true } },
                },
            },
        },
    });

    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }

    return user;
};

// ---------------------------------------------------------------------------
// Update current user's profile (firstName, lastName)
// ---------------------------------------------------------------------------
const updateMe = async (userId, data) => {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: SAFE_USER_SELECT,
    });
};

// ---------------------------------------------------------------------------
// Delete (deactivate) current user's account
// ---------------------------------------------------------------------------
const deleteMe = async (userId) => {
    await prisma.$transaction([
        prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } }),
        prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
    ]);
};

// ---------------------------------------------------------------------------
// Admin: list all users (paginated)
// ---------------------------------------------------------------------------
const listUsers = async ({ page = 1, limit = 20, search } = {}) => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({ where, select: SAFE_USER_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};

// ---------------------------------------------------------------------------
// Admin: get any user by ID
// ---------------------------------------------------------------------------
const getUserById = async (id) => {
    const user = await prisma.user.findUnique({ where: { id }, select: SAFE_USER_SELECT });
    if (!user) {
        const err = new Error('User not found');
        err.status = 404;
        err.code = 'NOT_FOUND';
        throw err;
    }
    return user;
};

// ---------------------------------------------------------------------------
// Admin: update a user's global role
// ---------------------------------------------------------------------------
const updateUserRole = async (id, role) => {
    return prisma.user.update({ where: { id }, data: { role }, select: SAFE_USER_SELECT });
};

module.exports = { getMe, updateMe, deleteMe, listUsers, getUserById, updateUserRole };
