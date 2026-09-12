/**
 * ============================================================
 * 11END — LOGGER CONFIGURATION
 * ============================================================
 *
 * Centralized application logging.
 *
 * Responsibilities:
 * - Provide structured backend logging
 * - Use the centralized environment configuration
 * - Redact sensitive information
 * - Support development and production environments
 *
 * SECURITY:
 * - Never log passwords, tokens, API keys or payment secrets.
 * ============================================================
 */

import pino from 'pino';

import env from './env.js';

const logger = pino({
    level: env.server.logLevel,

    base: {
        service: env.app.name,
        version: env.app.version,
        environment: env.app.environment
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    redact: {
        paths: [
            'password',
            'passwordHash',
            'token',
            'accessToken',
            'refreshToken',
            'authorization',
            'cookie',
            'apiKey',
            'secret',
            'clientSecret',
            'paymentSecret',
            'request.headers.authorization',
            'request.headers.cookie'
        ],

        censor: '[REDACTED]'
    }
});

export default logger;
