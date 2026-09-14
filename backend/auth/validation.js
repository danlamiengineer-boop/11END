import { z } from 'zod';

import {
    AUTH_ROLES,
    PASSWORD_POLICY
} from './constants.js';


/**
 * ================================================================
 * 11END — AUTHENTICATION VALIDATION
 * ================================================================
 *
 * Responsibility:
 * - Validate authentication input.
 * - Normalize safe user input.
 * - Enforce centralized authentication policies.
 * - Reject unexpected fields.
 *
 * This module does NOT:
 * - Authenticate users.
 * - Hash passwords.
 * - Generate tokens.
 * - Access the database.
 * - Apply business permissions.
 *
 * Those responsibilities belong to their respective modules.
 * ================================================================
 */


/**
 * ================================================================
 * COMMON SCHEMAS
 * ================================================================
 */

const emailSchema = z
    .string()
    .trim()
    .email('A valid email address is required.')
    .transform(
        (email) => email.toLowerCase()
    );


const passwordSchema = z
    .string()
    .min(
        PASSWORD_POLICY.MIN_LENGTH,
        `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters.`
    )
    .max(
        PASSWORD_POLICY.MAX_LENGTH,
        `Password must not exceed ${PASSWORD_POLICY.MAX_LENGTH} characters.`
    );


const roleSchema = z.enum(
    Object.values(AUTH_ROLES),
    {
        error:
            'A valid authentication role is required.'
    }
);


/**
 * ================================================================
 * REGISTRATION
 * ================================================================
 */

const registerSchema = z
    .object({
        email: emailSchema,

        password: passwordSchema,

        role: roleSchema
    })
    .strict();


/**
 * ================================================================
 * LOGIN
 * ================================================================
 */

const loginSchema = z
    .object({
        email: emailSchema,

        password: z
            .string()
            .min(
                1,
                'Password is required.'
            )
    })
    .strict();


/**
 * ================================================================
 * VALIDATION HELPERS
 * ================================================================
 */

const validateRegisterInput = (
    input
) => {
    return registerSchema.parse(input);
};


const validateLoginInput = (
    input
) => {
    return loginSchema.parse(input);
};


/**
 * ================================================================
 * EXPORTS
 * ================================================================
 */

export {
    emailSchema,
    passwordSchema,
    roleSchema,
    registerSchema,
    loginSchema,
    validateRegisterInput,
    validateLoginInput
};
