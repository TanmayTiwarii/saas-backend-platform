// =============================================================================
// Auth Service – registration, login, token refresh, logout, password reset
// =============================================================================
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/db');
const env = require('../config/env');
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
    calcRefreshTokenExpiry,
} = require('../utils/tokens');

// ---------------------------------------------------------------------------
// Register a new user
// ---------------------------------------------------------------------------
const register = async ({ firstName, lastName, email, password }) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        const err = new Error('Email already registered');
        err.status = 409;
        err.code = 'EMAIL_TAKEN';
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);

    const user = await prisma.user.create({
        data: { firstName, lastName, email, passwordHash },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });

    return user;
};

// ---------------------------------------------------------------------------
// Login – verify credentials and issue token pair
// ---------------------------------------------------------------------------
const login = async ({ email, password }) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        const err = new Error('Invalid email or password');
        err.status = 401;
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    return _issueTokenPair(user);
};

// ---------------------------------------------------------------------------
// Refresh – rotate refresh token (invalidate old, issue new pair)
// ---------------------------------------------------------------------------
const refresh = async (incomingToken) => {
    // 1. Verify JWT signature
    let decoded;
    try {
        decoded = verifyRefreshToken(incomingToken);
    } catch {
        const err = new Error('Refresh token is invalid or expired');
        err.status = 401;
        err.code = 'INVALID_TOKEN';
        throw err;
    }

    // 2. Check token exists in DB and is not revoked
    const stored = await prisma.refreshToken.findUnique({ where: { token: incomingToken } });
    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
        // Possible token reuse attack — revoke ALL tokens for this user
        if (stored) {
            await prisma.refreshToken.updateMany({
                where: { userId: stored.userId },
                data: { isRevoked: true },
            });
        }
        const err = new Error('Refresh token has been revoked or expired');
        err.status = 401;
        err.code = 'TOKEN_REVOKED';
        throw err;
    }

    // 3. Revoke old token
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    // 4. Load fresh user data
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) {
        const err = new Error('User account not found or deactivated');
        err.status = 401;
        err.code = 'UNAUTHORIZED';
        throw err;
    }

    return _issueTokenPair(user);
};

// ---------------------------------------------------------------------------
// Logout – revoke the provided refresh token
// ---------------------------------------------------------------------------
const logout = async (refreshToken) => {
    await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
    });
};

// ---------------------------------------------------------------------------
// Forgot password – generate a reset token (in production, email it)
// ---------------------------------------------------------------------------
const forgotPassword = async (email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent user enumeration
    if (!user) return null;

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({ data: { token, userId: user.id, expiresAt } });

    // TODO: In production, send email with reset link containing token
    return token; // Returned here for demonstration only
};

// ---------------------------------------------------------------------------
// Reset password – validate token and update hash
// ---------------------------------------------------------------------------
const resetPassword = async ({ token, password }) => {
    const record = await prisma.passwordReset.findUnique({ where: { token } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
        const err = new Error('Password reset token is invalid or has expired');
        err.status = 400;
        err.code = 'INVALID_TOKEN';
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);

    await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
        prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
        // Revoke all existing refresh tokens on password change
        prisma.refreshToken.updateMany({ where: { userId: record.userId }, data: { isRevoked: true } }),
    ]);
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------
const _issueTokenPair = async (user) => {
    // Fetch the user's primary org membership for the access token payload
    const membership = await prisma.membership.findFirst({
        where: { userId: user.id },
        orderBy: { joinedAt: 'asc' },
    });

    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        ...(membership && { organizationId: membership.organizationId }),
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(user.id);

    // Persist refresh token
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: calcRefreshTokenExpiry(),
        },
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
    };
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
