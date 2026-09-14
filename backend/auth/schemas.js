import { z } from 'zod';

import {
    AUTH_ROLES,
    AUTH_STATUS,
    PASSWORD_POLICY
} from './constants.js';

const phoneSchema = z
    .string()
    .regex(
        /^\d{11}$/,
        'Phone number must be exactly 11 digits.'
    );

const emailSchema = z
    .string()
    .trim()
    .email(
        'Please provide a valid email address.'
    )
    .transform(
        (value) => value.toLowerCase()
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

const userIdSchema = z
    .string()
    .trim()
    .min(
        1,
        'User ID is required.'
    );

const roleSchema = z
    .enum([
        AUTH_ROLES.CUSTOMER,
        AUTH_ROLES.PROVIDER,
        AUTH_ROLES.PM,
        AUTH_ROLES.SPM,
        AUTH_ROLES.RPM,
        AUTH_ROLES.ADMIN
    ]);

const statusSchema = z
    .enum([
        AUTH_STATUS.PENDING,
        AUTH_STATUS.ACTIVE,
        AUTH_STATUS.SUSPENDED,
        AUTH_STATUS.DISABLED
    ]);

const nameSchema = z
    .string()
    .trim()
    .min(
        2,
        'Name must contain at least 2 characters.'
    )
    .max(
        100,
        'Name must not exceed 100 characters.'
    );

const customerRegistrationSchema = z
    .object({
        firstName: nameSchema,

        lastName: nameSchema,

        phone: phoneSchema,

        email: emailSchema,

        password: passwordSchema,

        confirmPassword: z.string()
    })
    .strict()
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message:
                'Passwords do not match.',
            path: [
                'confirmPassword'
            ]
        }
    )
    .transform(
        ({
            firstName,
            lastName,
            phone,
            email,
            password
        }) => ({
            firstName,
            lastName,
            phone,
            email,
            password
        })
    );

const providerRegistrationSchema = z
    .object({
        firstName: nameSchema,

        lastName: nameSchema,

        phone: phoneSchema,

        email: emailSchema,

        password: passwordSchema,

        confirmPassword: z.string(),

        providerTypeId: userIdSchema,

        serviceId: userIdSchema,

        registeredByUserId: userIdSchema,

        registeredByRole: z.enum([
            AUTH_ROLES.PM,
            AUTH_ROLES.SPM,
            AUTH_ROLES.RPM
        ])
    })
    .strict()
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message:
                'Passwords do not match.',
            path: [
                'confirmPassword'
            ]
        }
    )
    .transform(
        ({
            firstName,
            lastName,
            phone,
            email,
            password,
            providerTypeId,
            serviceId,
            registeredByUserId,
            registeredByRole
        }) => ({
            firstName,
            lastName,
            phone,
            email,
            password,
            providerTypeId,
            serviceId,
            registeredByUserId,
            registeredByRole
        })
    );

const loginSchema = z
    .object({
        identifier: z
            .string()
            .trim()
            .min(
                1,
                'Phone number or email is required.'
            ),

        password: z
            .string()
            .min(
                1,
                'Password is required.'
            )
    })
    .strict();

const refreshTokenSchema = z
    .object({
        refreshToken: z
            .string()
            .trim()
            .min(
                1,
                'Refresh token is required.'
            )
    })
    .strict();

const staffAccountSchema = z
    .object({
        firstName: nameSchema,

        lastName: nameSchema,

        phone: phoneSchema,

        email: emailSchema,

        password: passwordSchema,

        confirmPassword: z.string(),

        role: z.enum([
            AUTH_ROLES.PM,
            AUTH_ROLES.SPM,
            AUTH_ROLES.RPM,
            AUTH_ROLES.ADMIN
        ]),

        status: statusSchema
    })
    .strict()
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message:
                'Passwords do not match.',
            path: [
                'confirmPassword'
            ]
        }
    )
    .transform(
        ({
            firstName,
            lastName,
            phone,
            email,
            password,
            role,
            status
        }) => ({
            firstName,
            lastName,
            phone,
            email,
            password,
            role,
            status
        })
    );

export {
    customerRegistrationSchema,
    providerRegistrationSchema,
    loginSchema,
    refreshTokenSchema,
    staffAccountSchema
};
