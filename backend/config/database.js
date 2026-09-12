/**
 * ============================================================
 * 11END — DATABASE CONFIGURATION
 * ============================================================
 *
 * PostgreSQL connection foundation.
 *
 * Responsibilities:
 * - Create and manage the PostgreSQL connection pool
 * - Reuse database connections efficiently
 * - Provide connection health checks
 * - Handle graceful database shutdown
 *
 * SECURITY:
 * - Database credentials come from environment variables.
 * - No database password is stored in source code.
 * ============================================================
 */

import pg from 'pg';

import config from './env.js';

const {
    Pool
} = pg;

let pool = null;

/**
 * ------------------------------------------------------------
 * DATABASE POOL
 * ------------------------------------------------------------
 */

const createPool = () => {
    if (!config.database.url) {
        if (config.app.environment === 'production') {
            throw new Error(
                'DATABASE_URL is required in production.'
            );
        }

        return null;
    }

    return new Pool({
        connectionString: config.database.url,

        max: 20,

        min: 0,

        idleTimeoutMillis: 30000,

        connectionTimeoutMillis: 10000,

        allowExitOnIdle: false,

        applicationName: '11END'
    });
};

/**
 * ------------------------------------------------------------
 * GET DATABASE POOL
 * ------------------------------------------------------------
 */

const getPool = () => {
    if (!pool) {
        pool = createPool();
    }

    return pool;
};

/**
 * ------------------------------------------------------------
 * DATABASE HEALTH CHECK
 * ------------------------------------------------------------
 */

const checkDatabaseConnection = async () => {
    const database = getPool();

    if (!database) {
        return {
            connected: false,
            configured: false
        };
    }

    const client = await database.connect();

    try {
        await client.query('SELECT 1');

        return {
            connected: true,
            configured: true
        };
    } finally {
        client.release();
    }
};

/**
 * ------------------------------------------------------------
 * GRACEFUL DATABASE SHUTDOWN
 * ------------------------------------------------------------
 */

const closeDatabaseConnection = async () => {
    if (!pool) {
        return;
    }

    await pool.end();

    pool = null;
};

/**
 * ------------------------------------------------------------
 * DATABASE ERROR HANDLING
 * ------------------------------------------------------------
 */

const registerDatabaseErrorHandler = (
    logger
) => {
    const database = getPool();

    if (!database) {
        return;
    }

    database.on(
        'error',
        (error) => {
            if (logger) {
                logger.error(
                    error,
                    '11END PostgreSQL pool error.'
                );
            }
        }
    );
};

export {
    getPool,
    checkDatabaseConnection,
    closeDatabaseConnection,
    registerDatabaseErrorHandler
};

export default getPool;
