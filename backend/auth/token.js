import jwt from 'jsonwebtoken';

import config from '../config/index.js';

import {
    TOKEN_CONFIG,
    TOKEN_TYPES
} from './constants.js';

const getTokenSecret = () => {
    if (
        typeof config.authentication.jwtSecret !==
        'string' ||
        config.authentication.jwtSecret.trim() === ''
    ) {
        throw new Error(
            'JWT_SECRET is not configured.'
        );
    }

    return config.authentication.jwtSecret;
};

const createToken = ({
    subject,
    role,
    type,
    expiresIn
}) => {
    if (
        typeof subject !== 'string' ||
        subject.trim() === ''
    ) {
        throw new TypeError(
            'Token subject must be a non-empty string.'
        );
    }

    if (
        typeof role !== 'string' ||
        role.trim() === ''
    ) {
        throw new TypeError(
            'Token role must be a non-empty string.'
        );
    }

    if (
        !Object.values(TOKEN_TYPES).includes(type)
    ) {
        throw new Error(
            'Invalid token type.'
        );
    }

    const payload = {
        role,
        type
    };

    return jwt.sign(
        payload,
        getTokenSecret(),
        {
            subject,
            issuer: TOKEN_CONFIG.ISSUER,
            audience: TOKEN_CONFIG.AUDIENCE,
            expiresIn
        }
    );
};

const createAccessToken = ({
    subject,
    role
}) => {
    return createToken({
        subject,
        role,
        type: TOKEN_TYPES.ACCESS,
        expiresIn:
            config.authentication.jwtExpiresIn
    });
};

const createRefreshToken = ({
    subject,
    role
}) => {
    return createToken({
        subject,
        role,
        type: TOKEN_TYPES.REFRESH,
        expiresIn:
            config.authentication.refreshTokenExpiresIn
    });
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
            'Token must be a non-empty string.'
        );
    }

    if (
        !Object.values(TOKEN_TYPES).includes(
            expectedType
        )
    ) {
        throw new Error(
            'Invalid expected token type.'
        );
    }

    const payload = jwt.verify(
        token,
        getTokenSecret(),
        {
            issuer: TOKEN_CONFIG.ISSUER,
            audience: TOKEN_CONFIG.AUDIENCE
        }
    );

    if (
        payload.type !== expectedType
    ) {
        throw new Error(
            'Invalid token type.'
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
    verifyAccessToken,
    verifyRefreshToken
};
