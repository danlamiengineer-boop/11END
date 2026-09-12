/**
 * ============================================================
 * 11END — LOGGER CONFIGURATION
 * One Network. One Destination. Everything You Need, Delivered.
 * ============================================================
 *
 * Centralized application logging using Pino.
 *
 * Responsibilities:
 * - Provide one logging interface for the backend
 * - Support development and production environments
 * - Respect LOG_LEVEL from environment configuration
 * - Avoid exposing sensitive credentials or secrets
 * - Provide structured logs suitable for monitoring systems
 *
 * SECURITY:
 * - Never log passwords, tokens, API keys or payment secrets.
 * - Sensitive request data must be sanitized before logging.
 * ============================================================
 */

import pino from 'pino';

const NODE_ENV =
    process.env.NODE_ENV || 'development';

const LOG_LEVEL =
    process.env.LOG_LEVEL || 'info';

const isProduction =
    NODE_ENV === 'production';

const logger = pino({
    level: LOG_LEVEL,

    redact: {
        paths: [
            'password',
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
    },

    ...(isProduction
        ? {}
        : {
            transport: {
                target: 'pino/file',
                options: {
                    destination: 1
                }
            }
        })
});

export default logger;
