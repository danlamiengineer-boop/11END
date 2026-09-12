/**
 * ============================================================
 * 11END — CENTRAL CONFIGURATION EXPORT
 * One Network. One Destination. Everything You Need, Delivered.
 * ============================================================
 *
 * Provides a single, consistent entry point for backend
 * configuration.
 *
 * This module does not contain secrets or credentials.
 * Configuration values are supplied by env.js.
 *
 * Usage:
 *
 * import config from './config/index.js';
 *
 * ============================================================
 */

import env from './env.js';

/**
 * ------------------------------------------------------------
 * CENTRAL APPLICATION CONFIGURATION
 * ------------------------------------------------------------
 */

const config = Object.freeze({
    app: Object.freeze({
        ...env.app
    }),

    server: Object.freeze({
        ...env.server
    }),

    database: Object.freeze({
        ...env.database
    }),

    authentication: Object.freeze({
        ...env.authentication
    }),

    security: Object.freeze({
        ...env.security
    }),

    features: Object.freeze({
        ...env.features
    })
});

/**
 * ------------------------------------------------------------
 * EXPORT
 * ------------------------------------------------------------
 */

export default config;
