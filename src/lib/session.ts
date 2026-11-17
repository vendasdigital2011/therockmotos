// Signed session token: base64url(JSON payload) + "." + HMAC-SHA256 signature.
// The cookie only carries the user id and expiry; the user (role, active flag)
// is always re-read from the database, so role changes and deactivation take
// effect immediately and the cookie can't be edited to gain privileges.
import crypto from 'node:crypto';

export const SESSION_COOKIE = 'motoflow_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

interface SessionPayload {
  uid: string;
  v: number; // versão da sessão do usuário; confere com User.sessionVersion
  exp: number; // unix seconds
}

function getSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET ausente ou curto (mínimo 32 caracteres). Configure no .env.');
  }
  return Buffer.from(secret);
}

function sign(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function createSessionToken(userId: string, sessionVersion: number): string {
  const payload: SessionPayload = {
    uid: userId,
    v: sessionVersion,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const data = token.slice(0, dot);
  const signature = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(data));
  if (signature.length !== expected.length || !crypto.timingSafeEqual(signature, expected)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
    if (typeof payload.uid !== 'string' || typeof payload.exp !== 'number' || typeof payload.v !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}
