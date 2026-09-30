import { afterEach, describe, expect, it, vi } from 'vitest';
import login from '../src/pages/api/admin/login';
import {
  ADMIN_COOKIE,
  createSessionValue,
  isAdminRequest,
  isPasscodeCorrect,
  isSessionValid,
} from '../src/server/adminAuth';
import { loadDirectory } from '../src/server/adminDirectory';
import { fakeRequest, fakeResponse } from './helpers/http';

const PASSCODE = 'correct horse battery';

afterEach(() => vi.unstubAllEnvs());

describe('admin passcode', () => {
  it('is off until a long enough passcode is configured', () => {
    expect(isPasscodeCorrect('anything')).toBe(false);
    vi.stubEnv('ADMIN_PASSCODE', 'short');
    expect(isPasscodeCorrect('short')).toBe(false);
  });

  it('accepts only the exact passcode', () => {
    vi.stubEnv('ADMIN_PASSCODE', PASSCODE);
    expect(isPasscodeCorrect(PASSCODE)).toBe(true);
    expect(isPasscodeCorrect(`${PASSCODE} `)).toBe(false);
    expect(isPasscodeCorrect('')).toBe(false);
  });
});

describe('admin session', () => {
  it('accepts a fresh cookie and rejects tampered, expired or re-keyed ones', () => {
    vi.stubEnv('ADMIN_PASSCODE', PASSCODE);
    const now = 1_700_000_000_000;
    const value = createSessionValue(now);
    expect(isSessionValid(value, now + 1000)).toBe(true);
    expect(isSessionValid(value, now + 8 * 24 * 3600 * 1000)).toBe(false);
    expect(isSessionValid(`${Number(value.split('.')[0]) + 1}.${value.split('.')[1]}`, now)).toBe(
      false
    );
    expect(isSessionValid(undefined, now)).toBe(false);
    vi.stubEnv('ADMIN_PASSCODE', 'a different passcode');
    expect(isSessionValid(value, now + 1000)).toBe(false);
  });

  it('reads the cookie from the request headers', () => {
    vi.stubEnv('ADMIN_PASSCODE', PASSCODE);
    const cookie = `other=1; ${ADMIN_COOKIE}=${createSessionValue()}`;
    expect(isAdminRequest({ headers: { cookie } })).toBe(true);
    expect(isAdminRequest({ headers: {} })).toBe(false);
  });
});

describe('POST /api/admin/login', () => {
  it('404s when the hub is not configured', () => {
    const res = fakeResponse();
    login(fakeRequest({ body: { passcode: PASSCODE } }), res);
    expect(res.statusCode).toBe(404);
  });

  it('sets a session cookie for the right passcode and not for a wrong one', () => {
    vi.stubEnv('ADMIN_PASSCODE', PASSCODE);
    const wrong = fakeResponse();
    login(fakeRequest({ body: { passcode: 'nope' }, ip: '198.51.100.1' }), wrong);
    expect(wrong.headers.location).toBe('/admin/?error=1');
    expect(wrong.headers['set-cookie']).toBeUndefined();

    const right = fakeResponse();
    login(fakeRequest({ body: { passcode: PASSCODE }, ip: '198.51.100.2' }), right);
    expect(right.headers.location).toBe('/admin/');
    expect(right.headers['set-cookie']).toMatch(/HttpOnly.*SameSite=Strict/);
  });

  it('slows down repeated guesses', () => {
    vi.stubEnv('ADMIN_PASSCODE', PASSCODE);
    let last = fakeResponse();
    for (let i = 0; i < 10; i++) {
      last = fakeResponse();
      login(fakeRequest({ body: { passcode: 'nope' }, ip: '198.51.100.9' }), last);
    }
    expect(last.headers.location).toBe('/admin/?error=limit');
  });
});

describe('account directory', () => {
  it('lists every account, unassigned when nothing is configured', () => {
    const { rows, problem } = loadDirectory('');
    expect(problem).toBeNull();
    expect(rows.length).toBeGreaterThan(5);
    expect(rows.every((row) => !row.record.owner)).toBe(true);
  });

  it('merges owners by id and keeps only known string fields', () => {
    const { rows } = loadDirectory(
      JSON.stringify({ yelp: { owner: ' Ana ', password: 'hunter2', notes: 5 } })
    );
    const yelp = rows.find((row) => row.id === 'yelp');
    expect(yelp?.record).toEqual({ owner: 'Ana' });
  });

  it('reports bad JSON instead of throwing', () => {
    expect(loadDirectory('{oops').problem).toMatch(/not valid JSON/);
    expect(loadDirectory('[]').problem).toMatch(/object/);
  });
});
