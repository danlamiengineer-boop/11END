import { createHash } from 'node:crypto';

import bcrypt from 'bcrypt';

import {
    PASSWORD_POLICY
} from './constants.js';

const getPasswordLength = (
    password
) => {
    return [
        ...password
    ].length;
};

const validatePassword = (
    password
) => {
    if (
        typeof password !== 'string'
    ) {
        throw new TypeError(
            'Password must be a string.'
        );
    }

    const length =
        getPasswordLength(password);

    if (
        length <
        PASSWORD_POLICY.MIN_LENGTH
    ) {
        throw new Error(
            `Password must contain at least ${PASSWORD_POLICY.MIN_LENGTH} characters.`
        );
    }

    if (
        length >
        PASSWORD_POLICY.MAX_LENGTH
    ) {
        throw new Error(
            `Password must not exceed ${PASSWORD_POLICY.MAX_LENGTH} characters.`
        );
    }

    return password;
};

const preparePassword = (
    password
) => {
    const validatedPassword =
        validatePassword(password);

    return createHash('sha256')
        .update(
            validatedPassword,
            'utf8'
        )
        .digest('hex');
};

const hashPassword = async (
    password
) => {
    const preparedPassword =
        preparePassword(password);

    return bcrypt.hash(
        preparedPassword,
        PASSWORD_POLICY.BCRYPT_SALT_ROUNDS
    );
};

const verifyPassword = async (
    password,
    passwordHash
) => {
    if (
        typeof passwordHash !== 'string' ||
        passwordHash.trim() === ''
    ) {
        return false;
    }

    const preparedPassword =
        preparePassword(password);

    return bcrypt.compare(
        preparedPassword,
        passwordHash
    );
};

export {
    validatePassword,
    hashPassword,
    verifyPassword
};
