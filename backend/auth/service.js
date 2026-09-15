/**
 * ============================================================================
 * 11END Authentication Service
 * ============================================================================
 *
 * Central authentication service layer.
 *
 * Responsibilities:
 * - Validate registration and login input
 * - Prepare authentication credentials
 * - Verify user passwords
 * - Enforce account status rules
 * - Create access and refresh token pairs
 * - Provide authentication-related service operations
 *
 * This module intentionally does NOT:
 * - Access the database directly
 * - Send emails or SMS
 * - Handle HTTP requests/responses
 * - Contain Fastify route definitions
 *
 * Database persistence will be handled by the users/authentication
 * persistence layer when that module is implemented.
 * ============================================================================
 */

import {
    AUTH_STATUS
} from './constants.js';

import {
    hashPassword,
    verifyPassword
} from './password.js';

import {
    createTokenPair
} from './tokens.js';

import {
    validateRegisterInput,
    validateLoginInput
} from './validation.js';


/**
 * ============================================================================
 * ACCOUNT STATUS
 * ============================================================================
 */

/**
 * Determines whether an account is allowed to authenticate.
 *
 * @param {string} status
 * @returns {boolean}
 */
const isAccountActive = (
    status
) => {
    return status === AUTH_STATUS.ACTIVE;
};


/**
 * ============================================================================
 * PASSWORD OPERATIONS
 * ============================================================================
 */

/**
 * Hashes a user's password before persistence.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
const preparePassword = async (
    password
) => {
    return hashPassword(password);
};


/**
 * Verifies a supplied password against a stored password hash.
 *
 * @param {string} password
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
const verifyUserPassword = async (
    password,
    passwordHash
) => {
    return verifyPassword(
        password,
        passwordHash
    );
};


/**
 * ============================================================================
 * REGISTRATION
 * ============================================================================
 */

/**
 * Validates and prepares registration data.
 *
 * This function does not create a database record.
 * The users module will handle persistence.
 *
 * @param {object} input
 * @returns {Promise<object>}
 */
const prepareRegistration = async (
    input
) => {
    const validatedInput =
        validateRegisterInput(input);

    const passwordHash =
        await preparePassword(
            validatedInput.password
        );

    const {
        password,
        ...safeUserData
    } = validatedInput;

    return {
        ...safeUserData,
        passwordHash
    };
};


/**
 * ============================================================================
 * LOGIN
 * ============================================================================
 */

/**
 * Validates login credentials.
 *
 * @param {object} input
 * @returns {object}
 */
const prepareLogin = (
    input
) => {
    return validateLoginInput(
        input
    );
};


/**
 * Authenticates an existing user.
 *
 * The user object is supplied by the persistence layer.
 * This keeps the authentication service independent of PostgreSQL.
 *
 * @param {object} user
 * @param {string} password
 * @returns {Promise<object>}
 */
const authenticateUser = async (
    user,
    password
) => {
    if (!user) {
        throw new Error(
            'Invalid email or password.'
        );
    }

    if (
        !isAccountActive(
            user.status
        )
    ) {
        throw new Error(
            'Account is not active.'
        );
    }

    const passwordValid =
        await verifyUserPassword(
            password,
            user.passwordHash
        );

    if (!passwordValid) {
        throw new Error(
            'Invalid email or password.'
        );
    }

    const tokenPair =
        createTokenPair({
            userId: user.id,
            role: user.role
        });

    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
        },
        tokens: tokenPair
    };
};


/**
 * ============================================================================
 * TOKEN CREATION
 * ============================================================================
 */

/**
 * Creates authentication tokens for an authenticated user.
 *
 * @param {object} user
 * @returns {object}
 */
const issueAuthenticationTokens = (
    user
) => {
    if (!user?.id) {
        throw new Error(
            'A valid user is required to issue authentication tokens.'
        );
    }

    if (!user?.role) {
        throw new Error(
            'A valid user role is required to issue authentication tokens.'
        );
    }

    return createTokenPair({
        userId: user.id,
        role: user.role
    });
};


/**
 * ============================================================================
 * USER SAFETY
 * ============================================================================
 */

/**
 * Removes sensitive authentication information before returning
 * a user object outside the authentication service.
 *
 * @param {object} user
 * @returns {object}
 */
const sanitizeUser = (
    user
) => {
    if (!user) {
        return null;
    }

    const {
        password,
        passwordHash,
        refreshToken,
        refreshTokenHash,
        ...safeUser
    } = user;

    return safeUser;
};


/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

export {
    isAccountActive,
    preparePassword,
    verifyUserPassword,
    prepareRegistration,
    prepareLogin,
    authenticateUser,
    issueAuthenticationTokens,
    sanitizeUser
};
