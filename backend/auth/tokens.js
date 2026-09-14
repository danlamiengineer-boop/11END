import crypto from 'node:crypto';

import jwt from 'jsonwebtoken';

import config from '../config/index.js';

import {
    TOKEN_TYPES,
    TOKEN_CONFIG
} from './constants.js';

const getJwtSecret = () => {
    const secret =
        config.authentication.jwtSecret;

    if (
        typeof secret !== 'string' ||
        secret.trim() === ''
    ) {
        throw new Error(
            'JWT_SECRET is required to create or verify authentication tokens.'
        );
    }

    return secret;
};

const buildTokenPayload = ({
    userId,
    role,
    type
}) => {
    if (
        typeof userId !== 'string' ||
        userId.trim() === ''
    ) {
        throw new TypeError(
            'userId must be a non-empty string.'
        );
    }

    if (
        typeof role !== 'string' ||
        role.trim() === ''
    ) {
        throw new TypeError(
            'role must be a non-empty string.'
        );
    }

    if (
        type !== TOKEN_TYPES.ACCESS &&
        type !== TOKEN_TYPES.REFRESH
    ) {
        throw new TypeError(
            'Invalid authentication token type.'
        );
    }

    return {
        sub: userId,
        role,
        type,
        jti: crypto.randomUUID()
    };
};

const signToken = ({
    userId,
    role,
    type,
    expiresIn
}) => {
    const payload = buildTokenPayload({
        userId,
        role,
        type
    });

    return jwt.sign(
        payload,
        getJwtSecret(),
        {
            algorithm: 'HS256',
            issuer:
                TOKEN_CONFIG.ISSUER,
            audience:
                TOKEN_CONFIG.AUDIENCE,
            expiresIn
        }
    );
};

const createAccessToken = ({
    userId,
    role
}) => {
    return signToken({
        userId,
        role,
        type: TOKEN_TYPES.ACCESS,
        expiresIn:
            config.authentication
                .jwtExpiresIn
    });
};

const createRefreshToken = ({
    userId,
    role
}) => {
    return signToken({
        userId,
        role,
        type: TOKEN_TYPES.REFRESH,
        expiresIn:
            config.authentication
                .refreshTokenExpiresIn
    });
};

const createTokenPair = ({
    userId,
    role
}) => {
    return {
        accessToken:
            createAccessToken({
                userId,
                role
            }),

        refreshToken:
            createRefreshToken({
                userId,
                role
            })
    };
};

const verifyToken = (
    token,
    expectedType
) => {
    if (
        typeof token !== 'string' ||
        token.trim() === ''
    ) {
        throw new TypeError(
            'Authentication token must be a non-empty string.'
        );
    }

    const payload = jwt.verify(
        token,
        getJwtSecret(),
        {
            algorithms: ['HS256'],
            issuer:
                TOKEN_CONFIG.ISSUER,
            audience:
                TOKEN_CONFIG.AUDIENCE
        }
    );

    if (
        !payload ||
        typeof payload !== 'object'
    ) {
        throw new Error(
            'Invalid authentication token payload.'
        );
    }

    if (
        expectedType &&
        payload.type !== expectedType
    ) {
        throw new Error(
            'Authentication token type is not valid for this operation.'
        );
    }

    if (
        typeof payload.sub !== 'string' ||
        payload.sub.trim() === ''
    ) {
        throw new Error(
            'Authentication token subject is invalid.'
        );
    }

    if (
        typeof payload.role !== 'string' ||
        payload.role.trim() === ''
    ) {
        throw new Error(
            'Authentication token role is invalid.'
        );
    }

    return payload;
};

const verifyAccessToken = (
    token
) => {
    return verifyToken(
        token,
        TOKEN_TYPES.ACCESS
    );
};

const verifyRefreshToken = (
    token
) => {
    return verifyToken(
        token,
        TOKEN_TYPES.REFRESH
    );
};

export {
    createAccessToken,
    createRefreshToken,
    createTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    verifyToken
};
