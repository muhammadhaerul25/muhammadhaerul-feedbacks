const crypto = require('crypto');

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = 'sha512';

/**
 * Hash a plain-text password using PBKDF2 with a cryptographically secure random salt.
 * Result format: pbkdf2:100000:<salt_hex>:<hash_hex>
 * @param {string} password 
 * @returns {string}
 */
function hashPassword(password) {
    if (!password || typeof password !== 'string') {
        throw new Error('Password must be a non-empty string');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
    return `pbkdf2:${ITERATIONS}:${salt}:${hash}`;
}

/**
 * Timing-safe string comparison to protect against side-channel timing attacks.
 * @param {string} a 
 * @param {string} b 
 * @returns {boolean}
 */
function timingSafeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        // Dummy timing comparison to avoid leaking length differences through early exit
        crypto.timingSafeEqual(bufA, bufA);
        return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify a plain-text password candidate against a stored hash or legacy plain-text value.
 * Supports transparent fallback to legacy plain-text passwords.
 * @param {string} candidatePassword 
 * @param {string} storedValue 
 * @returns {{ valid: boolean, needsRehash: boolean }}
 */
function verifyPassword(candidatePassword, storedValue) {
    if (!candidatePassword || !storedValue) {
        return { valid: false, needsRehash: false };
    }

    const cleanCandidate = String(candidatePassword).trim();
    const cleanStored = String(storedValue).trim();

    // 1. Check if stored value is PBKDF2 formatted
    if (cleanStored.startsWith('pbkdf2:')) {
        const parts = cleanStored.split(':');
        if (parts.length === 4) {
            const iterations = parseInt(parts[1], 10);
            const salt = parts[2];
            const storedHash = parts[3];

            try {
                const computedHash = crypto.pbkdf2Sync(cleanCandidate, salt, iterations, KEY_LEN, DIGEST).toString('hex');
                const valid = timingSafeCompare(computedHash, storedHash);
                return { valid, needsRehash: iterations !== ITERATIONS };
            } catch (err) {
                console.error('[PBKDF2 Verification Error]:', err.message);
                return { valid: false, needsRehash: false };
            }
        }
    }

    // 2. Legacy plain-text fallback (constant-time comparison)
    const valid = timingSafeCompare(cleanCandidate, cleanStored);
    return {
        valid,
        needsRehash: valid // If matched a plain-text password, signal that it needs to be rehashed in DB
    };
}

module.exports = {
    hashPassword,
    verifyPassword,
    timingSafeCompare
};
