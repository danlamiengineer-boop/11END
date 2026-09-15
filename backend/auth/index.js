/**
 * 11END Authentication Module
 *
 * Central entry point for authentication-related functionality.
 *
 * This module intentionally re-exports authentication components
 * from their dedicated modules so that other parts of the backend
 * can use a single stable import path.
 *
 * Authentication responsibilities are separated into:
 * - Constants and security policies
 * - Password validation, hashing, and verification
 * - Access and refresh token management
 * - Request input validation
 */

// ============================================================================
// AUTHENTICATION CONSTANTS
// ============================================================================

export {
    AUTH_ROLES,
    AUTH_STATUS,
    PASSWORD_POLICY,
    TOKEN_TYPES,
    TOKEN_CONFIG
} from './constants.js';

// ============================================================================
// PASSWORD SECURITY
// ============================================================================

export {
    validatePassword,
    hashPassword,
    verifyPassword
} from './password.js';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export {
    createAccessToken,
    createRefreshToken,
    createTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    verifyToken
} from './tokens.js';

// ============================================================================
// INPUT VALIDATION
// ============================================================================

export {
    emailSchema,
    passwordSchema,
    roleSchema,
    registerSchema,
    loginSchema,
    validateRegisterInput,
    validateLoginInput
} from './validation.js';
