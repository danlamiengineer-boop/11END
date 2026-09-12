/**
 * ============================================================
 * 11END — ENVIRONMENT CONFIGURATION
 * ============================================================
 *
 * Centralized, validated application configuration.
 *
 * Responsibilities:
 * - Read environment variables
 * - Apply safe development defaults
 * - Validate configuration values
 * - Protect production from missing critical secrets
 * - Expose configuration through a single immutable object
 *
 * SECURITY:
 * - Never hard-code credentials or secrets.
 * - Never commit a real .env file.
 * - Production secrets must be supplied by the deployment
 *   environment or a secure secrets manager.
 * ============================================================
 */

const NODE_ENV_VALUES = Object.freeze([
    'development',
    'test',
    'staging',
    'production'
]);

const LOG_LEVEL_VALUES = Object.freeze([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent'
]);

const getString = (
    name,
    fallback = undefined
) => {
    const value = process.env[name];

    if (
        value === undefined ||
        value === null ||
        value.trim() === ''
    ) {
        return fallback;
    }

    return value.trim();
};

const getRequiredString = (name) => {
    const value = getString(name);

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value;
};

const getNumber = (
    name,
    fallback
) => {
    const value = getString(name);

    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
        throw new Error(
            `Environment variable ${name} must be an integer.`
        );
    }

    return parsed;
};

const getBoolean = (
    name,
    fallback = false
) => {
    const value = getString(name);

    if (value === undefined) {
        return fallback;
    }

    const normalized = value.toLowerCase();

    if (normalized === 'true') {
        return true;
    }

    if (normalized === 'false') {
        return false;
    }

    throw new Error(
        `Environment variable ${name} must be true or false.`
    );
};

const getUrl = (
    name,
    fallback
) => {
    const value = getString(
        name,
        fallback
    );

    if (!value) {
        return undefined;
    }

    try {
        return new URL(value).toString().replace(/\/$/, '');
    } catch {
        throw new Error(
            `Environment variable ${name} must be a valid URL.`
        );
    }
};

const nodeEnv = getString(
    'NODE_ENV',
    'development'
);

if (!NODE_ENV_VALUES.includes(nodeEnv)) {
    throw new Error(
        `NODE_ENV must be one of: ${NODE_ENV_VALUES.join(', ')}.`
    );
}

const port = getNumber(
    'PORT',
    4000
);

if (
    port < 1 ||
    port > 65535
) {
    throw new Error(
        'PORT must be between 1 and 65535.'
    );
}

const logLevel = getString(
    'LOG_LEVEL',
    'info'
);

if (!LOG_LEVEL_VALUES.includes(logLevel)) {
    throw new Error(
        `LOG_LEVEL must be one of: ${LOG_LEVEL_VALUES.join(', ')}.`
    );
};

const isProduction =
    nodeEnv === 'production';

const databaseUrl = isProduction
    ? getRequiredString('DATABASE_URL')
    : getString('DATABASE_URL');

const jwtSecret = isProduction
    ? getRequiredString('JWT_SECRET')
    : getString('JWT_SECRET');

const config = Object.freeze({
    app: Object.freeze({
        name: '11END',
        version: getString(
            'APP_VERSION',
            '1.0.0'
        ),
        environment: nodeEnv,
        url: getUrl(
            'APP_URL',
            'http://localhost:3000'
        ),
        apiUrl: getUrl(
            'API_URL',
            'http://localhost:4000'
        )
    }),

    server: Object.freeze({
        host: getString(
            'HOST',
            '0.0.0.0'
        ),
        port,
        logLevel
    }),

    database: Object.freeze({
        url: databaseUrl
    }),

    authentication: Object.freeze({
        jwtSecret,
        jwtExpiresIn: getString(
            'JWT_EXPIRES_IN',
            '1h'
        ),
        refreshTokenExpiresIn: getString(
            'REFRESH_TOKEN_EXPIRES_IN',
            '30d'
        )
    }),

    security: Object.freeze({
        corsOrigin: getString(
            'CORS_ORIGIN'
        )
    }),

    features: Object.freeze({
        email: getBoolean(
            'ENABLE_EMAIL',
            true
        ),
        sms: getBoolean(
            'ENABLE_SMS',
            true
        ),
        location: getBoolean(
            'ENABLE_LOCATION',
            true
        ),
        payments: getBoolean(
            'ENABLE_PAYMENTS',
            false
        ),
        withdrawals: getBoolean(
            'ENABLE_WITHDRAWALS',
            false
        ),
        verification: getBoolean(
            'ENABLE_VERIFICATION',
            false
        )
    })
});

export default config;
