/**
 * ============================================================
 * 11END — BACKEND APPLICATION SERVER
 * One Network. One Destination. Everything You Need, Delivered.
 * ============================================================
 *
 * Purpose:
 * - Backend application bootstrap
 * - Security middleware foundation
 * - API foundation
 * - Health monitoring
 * - Central error handling
 * - Graceful shutdown
 *
 * Architecture:
 * Customer
 * Provider
 * PM
 * SPM
 * RPM
 * Admin
 *
 * Business modules will be connected through dedicated backend
 * modules as the platform is developed.
 *
 * IMPORTANT:
 * - No payment secrets are stored here.
 * - No API keys are stored here.
 * - Production credentials must come from environment variables.
 * ============================================================
 */

import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

const APP_NAME = '11END';
const APP_VERSION = '1.0.0';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

const NODE_ENV = process.env.NODE_ENV || 'development';

const server = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info'
    }
});

/**
 * ------------------------------------------------------------
 * SECURITY
 * ------------------------------------------------------------
 */

await server.register(helmet, {
    global: true
});

await server.register(cors, {
    origin:
        process.env.CORS_ORIGIN ||
        true,
    credentials: true
});

await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
});

/**
 * ------------------------------------------------------------
 * ROOT API INFORMATION
 * ------------------------------------------------------------
 */

server.get('/', async () => {
    return {
        name: APP_NAME,
        version: APP_VERSION,
        status: 'online',
        message:
            '11END backend is running.'
    };
});

/**
 * ------------------------------------------------------------
 * HEALTH CHECK
 * ------------------------------------------------------------
 *
 * Used by monitoring systems, deployment platforms and
 * infrastructure health checks.
 * ------------------------------------------------------------
 */

server.get('/health', async () => {
    return {
        status: 'healthy',
        service: APP_NAME,
        version: APP_VERSION,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    };
});

/**
 * ------------------------------------------------------------
 * API VERSION FOUNDATION
 * ------------------------------------------------------------
 */

server.get('/api/v1', async () => {
    return {
        name: APP_NAME,
        version: 'v1',
        status: 'available'
    };
});

/**
 * ------------------------------------------------------------
 * NOT FOUND HANDLER
 * ------------------------------------------------------------
 */

server.setNotFoundHandler(
    async (request, reply) => {
        return reply.status(404).send({
            error: 'Not Found',
            message:
                `Route ${request.method} ${request.url} was not found.`,
            statusCode: 404
        });
    }
);

/**
 * ------------------------------------------------------------
 * CENTRAL ERROR HANDLER
 * ------------------------------------------------------------
 */

server.setErrorHandler(
    async (error, request, reply) => {
        request.log.error(error);

        const statusCode =
            error.statusCode &&
            error.statusCode >= 400 &&
            error.statusCode < 600
                ? error.statusCode
                : 500;

        return reply.status(statusCode).send({
            error:
                statusCode === 500
                    ? 'Internal Server Error'
                    : error.name || 'Request Error',
            message:
                statusCode === 500
                    ? 'An unexpected server error occurred.'
                    : error.message,
            statusCode
        });
    }
);

/**
 * ------------------------------------------------------------
 * GRACEFUL SHUTDOWN
 * ------------------------------------------------------------
 */

const shutdown = async (
    signal
) => {
    server.log.info(
        `11END received ${signal}. Shutting down safely.`
    );

    try {
        await server.close();

        process.exit(0);
    } catch (error) {
        server.log.error(
            error,
            '11END shutdown failed.'
        );

        process.exit(1);
    }
};

process.once(
    'SIGTERM',
    () => shutdown('SIGTERM')
);

process.once(
    'SIGINT',
    () => shutdown('SIGINT')
);

/**
 * ------------------------------------------------------------
 * START SERVER
 * ------------------------------------------------------------
 */

const startServer = async () => {
    try {
        await server.listen({
            port: PORT,
            host: HOST
        });

        server.log.info(
            `${APP_NAME} backend running on port ${PORT}.`
        );
    } catch (error) {
        server.log.error(
            error,
            '11END backend failed to start.'
        );

        process.exit(1);
    }
};

await startServer();
