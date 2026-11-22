import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'zenith_owner_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function isCloudConfigured(): boolean {
  return Boolean(
    process.env.MONGODB_URI &&
      process.env.APP_PASSWORD &&
      process.env.APP_PASSWORD.length >= 12 &&
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32,
  );
}

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  return createHmac('sha256', secret).update(value).digest('hex');
}

function isValidPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD || '';
  const candidateHash = createHmac('sha256', 'zenith-login-check').update(candidate).digest();
  const expectedHash = createHmac('sha256', 'zenith-login-check').update(expected).digest();
  return timingSafeEqual(candidateHash, expectedHash) && Boolean(expected);
}

export async function isOwnerAuthenticated(): Promise<boolean> {
  if (!isCloudConfigured()) return false;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expected = sign(expiresAt);
  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function createOwnerSession(): Promise<void> {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  const jar = await cookies();
  jar.set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function clearOwnerSession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function verifyOwnerPassword(candidate: string): boolean {
  return isValidPassword(candidate);
}
