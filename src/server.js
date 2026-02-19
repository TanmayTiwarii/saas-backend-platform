// =============================================================================
// Server entry point – starts HTTP server, handles graceful shutdown
// =============================================================================
const env = require('./config/env');
const logger = require('./config/logger');
const app = require('./app');
const prisma = require('./config/db');

const server = app.listen(env.port, () => {
    logger.info(`🚀  Server running in ${env.nodeEnv} mode on port ${env.port}`);
    logger.info(`📋  Health check: http://localhost:${env.port}/health`);
    logger.info(`🔑  Auth API:     http://localhost:${env.port}/api/auth`);
    logger.info(`👤  Users API:    http://localhost:${env.port}/api/users`);
    logger.info(`🏢  Orgs API:     http://localhost:${env.port}/api/organizations`);
    logger.info(`💳  Subs API:     http://localhost:${env.port}/api/subscriptions`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
    logger.warn(`${signal} received — shutting down gracefully`);

    server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server and database connections closed.');
        process.exit(0);
    });

    // Force shutdown after 10s if connections don't drain
    setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});
