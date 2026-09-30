import { createHmac, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_SESSION_SECONDS = 60 * 60 * 24 * 7;

const passcode = (): string => process.env.ADMIN_PASSCODE ?? '';

export const isAdminConfigured = (): boolean => passcode().length >= 12;

const sign = (payload: string): string =>
  createHmac('sha256', `admin-session:${passcode()}`).update(payload).digest('hex');

const safeEqual = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const isPasscodeCorrect = (attempt: string): boolean =>
  isAdminConfigured() && safeEqual(sign(`attempt:${attempt}`), sign(`attempt:${passcode()}`));

export const createSessionValue = (now = Date.now()): string => {
  const expires = String(now + ADMIN_SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires)}`;
};

export const isSessionValid = (value: string | undefined, now = Date.now()): boolean => {
  if (!value || !isAdminConfigured()) return false;
  const [expires, signature] = value.split('.');
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) > now;
};

const readCookie = (header: string | undefined, name: string): string | undefined => {
  for (const part of (header ?? '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
};

export const isAdminRequest = (req: Pick<IncomingMessage, 'headers'>): boolean =>
  isSessionValid(readCookie(req.headers.cookie, ADMIN_COOKIE));

export const sessionCookie = (value: string, maxAge: number): string =>
  [
    `${ADMIN_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');
