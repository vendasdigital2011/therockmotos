/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS on purpose: Prisma seeds and node scripts require() it */
// Password hashing with Node's built-in scrypt (no external dependency).
// Plain CommonJS so the Prisma seeds and scripts can require() it too.
// Stored format: scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>
const crypto = require('node:crypto');

const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const MIN_LENGTH = 8;

function hashPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    throw new Error(`A senha deve ter pelo menos ${MIN_LENGTH} caracteres.`);
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LEN, { N, r: R, p: P });
  return ['scrypt', N, R, P, salt.toString('base64'), hash.toString('base64')].join('$');
}

function isHashedPassword(stored) {
  return typeof stored === 'string' && stored.startsWith('scrypt$') && stored.split('$').length === 6;
}

function verifyPassword(password, stored) {
  if (typeof password !== 'string' || !isHashedPassword(stored)) return false;
  const [, n, r, p, saltB64, hashB64] = stored.split('$');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return crypto.timingSafeEqual(actual, expected);
}

// Spends the same time as a real check, so "user not found" and
// "wrong password" can't be told apart by response time.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));
function verifyDummy(password) {
  verifyPassword(String(password ?? ''), DUMMY_HASH);
  return false;
}

function generatePassword() {
  return crypto.randomBytes(12).toString('base64url');
}

module.exports = { hashPassword, verifyPassword, verifyDummy, isHashedPassword, generatePassword, MIN_LENGTH };
