/**
 * ============================================================
 * 11END — BACKEND APPLICATION SERVER
 * One Network. One Destination. Everything You Need, Delivered.
 * ============================================================
 *
 * Backend application bootstrap.
 *
 * Responsibilities:
 * - Initialize Fastify
 * - Load centralized configuration
 * - Configure security
 * - Configure application logging
 * - Provide health monitoring
 * - Provide API version foundation
 * - Handle graceful shutdown
 *
 * IMPORTANT:
 * - No credentials are hard-coded.
 * - Secrets come from environment configuration.
 * - Business modules will be connected progressively.
 * ============================================================
 */

import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import config from './config/index.js';
import logger from './config/logger.js';

import {
    checkDatabaseConnection,
    closeDatabaseConnection,
    registerDatabaseErrorHandler
} from './config/database.js';

/**
 * ------------------------------------------------------------
 * APPLICATION
 * ------------------------------------------------------------
 */

const server = Fastify({
    loggerInstance: logger,

    trustProxy:
        config.app.environment === 'production'
});

/**
 * ------------------------------------------------------------
 * SECURITY
 * ------------------------------------------------------------
 */

await server.register(
    helmet,
    {
        global: true
    }
);

await server.register(
    cors,
    {
        origin:
            config.security.corsOrigin ||
            true,

        credentials: true
    }
);

await server.register(
    rateLimit,
    {
        max: 100,
        timeWindow: '1 minute'
    }
);

/**
 * ------------------------------------------------------------
 * DATABASE
 * ------------------------------------------------------------
 */

registerDatabaseErrorHandler(
    logger
);

/**
 * ------------------------------------------------------------
 * ROOT ENDPOINT
 * ------------------------------------------------------------
 */

server.get(
    '/',
    async () => {
        return {
            name: config.app.name,
            version: config.app.version,
            status: 'online',
            message:
                '11END backend is running.'
        };
    }
);

/**
 * ------------------------------------------------------------
 * HEALTH ENDPOINT
 * ------------------------------------------------------------
 */

server.get(
    '/health',
    async (
        request,
        reply
    ) => {
        let database;

        try {
            database =
                await checkDatabaseConnection();
        } catch (error) {
            request.log.error(
                error,
                '11END database health check failed.'
            );

            database = {
                connected: false,
                configured: true
            };
        }

        const healthy =
            database.connected ||
            !database.configured;

        return reply
            .status(
                healthy
                    ? 200
                    : 503
            )
            .send({
                status:
                    healthy
                        ? 'healthy'
                        : 'degraded',

                service:
                    config.app.name,

                version:
                    config.app.version,

                environment:
                    config.app.environment,

                database,

                timestamp:
                    new Date().toISOString()
            });
    }
);

/**
 * ------------------------------------------------------------
 * API VERSION FOUNDATION
 * ------------------------------------------------------------
 */

server.get(
    '/api/v1',
    async () => {
        return {
            name: config.app.name,
            version: 'v1',
            status: 'available'
        };
    }
);

/**
 * ------------------------------------------------------------
 * NOT FOUND HANDLER
 * ------------------------------------------------------------
 */

server.setNotFoundHandler(
    async (
        request,
        reply
    ) => {
        return reply
            .status(404)
            .send({
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
    async (
        error,
        request,
        reply
    ) => {
        request.log.error(error);

        const statusCode =
            error.statusCode &&
            error.statusCode >= 400 &&
            error.statusCode < 600
                ? error.statusCode
                : 500;

        return reply
            .status(statusCode)
            .send({
                error:
                    statusCode === 500
                        ? 'Internal Server Error'
                        : error.name ||
                          'Request Error',

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

let shuttingDown = false;

const shutdown = async (
    signal
) => {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    logger.info(
        `11END received ${signal}. Starting graceful shutdown.`
    );

    try {
        await server.close();

        await closeDatabaseConnection();

        logger.info(
            '11END shutdown completed successfully.'
        );

        process.exit(0);
    } catch (error) {
        logger.error(
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
            port: config.server.port,
            host: config.server.host
        });

        logger.info(
            {
                host: config.server.host,
                port: config.server.port,
                environment:
                    config.app.environment
            },
            '11END backend started successfully.'
        );
    } catch (error) {
        logger.error(
            error,
            '11END backend failed to start.'
        );

        process.exit(1);
    }
};

await startServer();
