/**
 * ============================================================================
 * 11END AUTHENTICATION MIDDLEWARE
 * ============================================================================
 *
 * Central middleware for protecting authenticated API routes.
 *
 * Responsibilities:
 * - Extract Bearer access tokens from HTTP requests.
 * - Verify access tokens using the authentication token service.
 * - Attach authenticated user information to the request.
 * - Enforce role-based access control.
 * - Provide consistent authentication errors.
 *
 * This module does not perform database access.
 * Database-backed account status checks can be added at the appropriate
 * service layer when the user/account modules are implemented.
 * ============================================================================
 */

import {
    verifyAccessToken
} from './tokens.js';

import {
    AUTH_ROLES
} from './constants.js';


/**
 * ============================================================================
 * AUTHENTICATION ERROR HELPERS
 * ============================================================================
 */

const unauthorized = (
    reply,
    message = 'Authentication required.'
) => {
    return reply
        .status(401)
        .send({
            error: 'Unauthorized',
            message,
            statusCode: 401
        });
};


const forbidden = (
    reply,
    message = 'You do not have permission to perform this action.'
) => {
    return reply
        .status(403)
        .send({
            error: 'Forbidden',
            message,
            statusCode: 403
        });
};


/**
 * ============================================================================
 * AUTHORIZATION HEADER
 * ============================================================================
 */

const getBearerToken = (
    authorizationHeader
) => {
    if (
        typeof authorizationHeader !== 'string' ||
        authorizationHeader.trim() === ''
    ) {
        return null;
    }

    const parts =
        authorizationHeader
            .trim()
            .split(/\s+/);

    if (
        parts.length !== 2 ||
        parts[0].toLowerCase() !== 'bearer' ||
        parts[1].trim() === ''
    ) {
        return null;
    }

    return parts[1].trim();
};


/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 *
 * Verifies the access token and attaches the authenticated user to:
 *
 * request.user
 *
 * The route can then safely use request.user after this middleware succeeds.
 */

const requireAuthentication = async (
    request,
    reply
) => {
    const authorizationHeader =
        request.headers.authorization;

    const accessToken =
        getBearerToken(
            authorizationHeader
        );

    if (!accessToken) {
        return unauthorized(
            reply,
            'A valid Bearer access token is required.'
        );
    }

    try {
        const user =
            verifyAccessToken(
                accessToken
            );

        request.user = user;

        return;
    } catch (error) {
        request.log.debug(
            {
                error
            },
            '11END access token verification failed.'
        );

        return unauthorized(
            reply,
            'The access token is invalid or expired.'
        );
    }
};


/**
 * ============================================================================
 * ROLE AUTHORIZATION
 * ============================================================================
 *
 * Creates middleware that allows only the supplied roles.
 *
 * Example:
 *
 * requireRole(AUTH_ROLES.ADMIN)
 *
 * or:
 *
 * requireRole(
 *     AUTH_ROLES.ADMIN,
 *     AUTH_ROLES.RPM
 * )
 */

const requireRole = (
    ...allowedRoles
) => {
    if (allowedRoles.length === 0) {
        throw new Error(
            'requireRole requires at least one allowed role.'
        );
    }

    return async (
        request,
        reply
    ) => {
        if (!request.user) {
            return unauthorized(
                reply,
                'Authentication is required before role authorization.'
            );
        }

        const userRole =
            request.user.role;

        if (
            !allowedRoles.includes(
                userRole
            )
        ) {
            return forbidden(
                reply,
                'Your account role does not have permission to access this resource.'
            );
        }

        return;
    };
};


/**
 * ============================================================================
 * ROLE-SPECIFIC HELPERS
 * ============================================================================
 *
 * These helpers keep route definitions readable.
 */

const requireCustomer =
    requireRole(
        AUTH_ROLES.CUSTOMER
    );


const requireProvider =
    requireRole(
        AUTH_ROLES.PROVIDER
    );


const requirePM =
    requireRole(
        AUTH_ROLES.PM
    );


const requireSPM =
    requireRole(
        AUTH_ROLES.SPM
    );


const requireRPM =
    requireRole(
        AUTH_ROLES.RPM
    );


const requireAdmin =
    requireRole(
        AUTH_ROLES.ADMIN
    );


/**
 * ============================================================================
 * MANAGEMENT ROLE HELPERS
 * ============================================================================
 *
 * Used later for management operations where more than one organizational
 * role may be permitted.
 */

const requireOperationsManagement =
    requireRole(
        AUTH_ROLES.PM,
        AUTH_ROLES.SPM,
        AUTH_ROLES.RPM,
        AUTH_ROLES.ADMIN
    );


const requirePlatformManagement =
    requireRole(
        AUTH_ROLES.RPM,
        AUTH_ROLES.ADMIN
    );


const requireAdministrativeAccess =
    requireRole(
        AUTH_ROLES.ADMIN
    );


/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

export {
    getBearerToken,
    requireAuthentication,
    requireRole,
    requireCustomer,
    requireProvider,
    requirePM,
    requireSPM,
    requireRPM,
    requireAdmin,
    requireOperationsManagement,
    requirePlatformManagement,
    requireAdministrativeAccess
};
