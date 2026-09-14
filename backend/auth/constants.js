const AUTH_ROLES = Object.freeze({
    CUSTOMER: 'CUSTOMER',
    PROVIDER: 'PROVIDER',
    PM: 'PM',
    SPM: 'SPM',
    RPM: 'RPM',
    ADMIN: 'ADMIN'
});

const AUTH_STATUS = Object.freeze({
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    DISABLED: 'DISABLED'
});

const PASSWORD_POLICY = Object.freeze({
    MIN_LENGTH: 12,
    MAX_LENGTH: 128,
    BCRYPT_SALT_ROUNDS: 12
});

const TOKEN_TYPES = Object.freeze({
    ACCESS: 'access',
    REFRESH: 'refresh'
});

const TOKEN_CONFIG = Object.freeze({
    ISSUER: '11END',
    AUDIENCE: '11END'
});

export {
    AUTH_ROLES,
    AUTH_STATUS,
    PASSWORD_POLICY,
    TOKEN_TYPES,
    TOKEN_CONFIG
};
