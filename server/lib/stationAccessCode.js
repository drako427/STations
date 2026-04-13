const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ACCESS_CODE_GROUPS = 4;
const ACCESS_CODE_GROUP_LENGTH = 4;
const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeAccessCode(value) {
    return String(value || '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
}

function formatAccessCode(normalizedCode) {
    const compact = normalizeAccessCode(normalizedCode);
    if (!compact) {
        return '';
    }

    const parts = [];
    for (let i = 0; i < compact.length; i += ACCESS_CODE_GROUP_LENGTH) {
        parts.push(compact.slice(i, i + ACCESS_CODE_GROUP_LENGTH));
    }

    return parts.join('-');
}

function generateStationAccessCode() {
    const rawLength = ACCESS_CODE_GROUPS * ACCESS_CODE_GROUP_LENGTH;
    const bytes = crypto.randomBytes(rawLength);
    let compactCode = '';

    for (let i = 0; i < rawLength; i += 1) {
        compactCode += ACCESS_CODE_ALPHABET[bytes[i] % ACCESS_CODE_ALPHABET.length];
    }

    return formatAccessCode(compactCode);
}

function isHashedAccessCode(value) {
    return typeof value === 'string' && value.startsWith('$2');
}

async function hashAccessCode(value) {
    return bcrypt.hash(normalizeAccessCode(value), 12);
}

async function compareAccessCode(input, storedValue) {
    const normalizedInput = normalizeAccessCode(input);
    if (!normalizedInput || !storedValue) {
        return false;
    }

    if (isHashedAccessCode(storedValue)) {
        return bcrypt.compare(normalizedInput, storedValue);
    }

    return normalizeAccessCode(storedValue) === normalizedInput;
}

async function ensureStationAccessCodeColumn(queryable) {
    const [columns] = await queryable.query("SHOW COLUMNS FROM stations LIKE 'access_code'");

    if (columns.length === 0) {
        await queryable.query('ALTER TABLE stations ADD COLUMN access_code VARCHAR(255) NULL');
        return;
    }

    const currentType = String(columns[0].Type || '').toLowerCase();
    if (!currentType.includes('varchar(255)')) {
        await queryable.query('ALTER TABLE stations MODIFY COLUMN access_code VARCHAR(255) NULL');
    }
}

module.exports = {
    compareAccessCode,
    ensureStationAccessCodeColumn,
    formatAccessCode,
    generateStationAccessCode,
    hashAccessCode,
    isHashedAccessCode,
    normalizeAccessCode,
};
