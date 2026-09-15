/**
 * ============================================================================
 * 11END Authentication Controller
 * ============================================================================
 *
 * HTTP/API boundary for authentication operations.
 *
 * Responsibilities:
 * - Receive HTTP requests
 * - Validate and prepare request data through the authentication service
 * - Coordinate user persistence through an injected repository
 * - Return appropriate HTTP responses
 * - Sanitize user data before sending it to clients
 *
 * This module intentionally does NOT:
 * - Contain password hashing logic
 * - Generate authentication tokens directly
 * - Contain database queries
 * - Define Fastify routes
 * - Contain business rules that belong in the service layer
 *
 * The user repository is injected so that the controller remains
 * independent of the database implementation.
 * ============================================================================
 */

import {
    prepareRegistration,
    prepareLogin,
    authenticateUser,
    sanitizeUser
} from './service.js';

const createAuthController = (
    {
        userRepository
    } = {}
) => {
    if (!userRepository) {
        throw new Error(
            'A user repository is required to create the authentication controller.'
        );
    }

    if (
        typeof userRepository.findByEmail !== 'function'
    ) {
        throw new Error(
            'User repository must implement findByEmail().'
        );
    }

    if (
        typeof userRepository.create !== 'function'
    ) {
        throw new Error(
            'User repository must implement create().'
        );
    }

    const register = async (
        request,
        reply
    ) => {
        const preparedUser =
            await prepareRegistration(
                request.body
            );

        const existingUser =
            await userRepository.findByEmail(
                preparedUser.email
            );

        if (existingUser) {
            return reply
                .status(409)
                .send({
                    error:
                        'Conflict',

                    message:
                        'An account with this email already exists.',

                    statusCode: 409
                });
        }

        const createdUser =
            await userRepository.create(
                preparedUser
            );

        const safeUser =
            sanitizeUser(
                createdUser
            );

        return reply
            .status(201)
            .send({
                message:
                    'Account created successfully.',

                user: safeUser
            });
    };

    const login = async (
        request,
        reply
    ) => {
        const credentials =
            prepareLogin(
                request.body
            );

        const user =
            await userRepository.findByEmail(
                credentials.email
            );

        const authentication =
            await authenticateUser(
                user,
                credentials.password
            );

        return reply
            .status(200)
            .send({
                message:
                    'Authentication successful.',

                user:
                    sanitizeUser(
                        authentication.user
                    ),

                tokens:
                    authentication.tokens
            });
    };

    return Object.freeze({
        register,
        login
    });
};

export {
    createAuthController
};
