import { describe, expect, it } from 'vitest';
import {
  type VoiceSession,
  newVoiceIds,
  openVoiceSession,
  sealVoiceSession,
} from '../../src/server/voice/session';

const KEY = 'session-key';
const session: VoiceSession = {
  roomId: 'hall_abc',
  taskId: 'task_abc',
  userId: 'visitor_abc',
  agentUserId: 'agent_abc',
  ip: '198.51.100.4',
  leadSource: { source: 'google', medium: 'cpc' },
  expiresAt: 2_000_000_000,
};

describe('voice session', () => {
  it('round-trips through its sealed form', () => {
    const sealed = sealVoiceSession(session, KEY);
    expect(openVoiceSession(sealed, KEY, { now: 1_900_000_000 })).toEqual(session);
  });

  it('is refused once it has expired', () => {
    const sealed = sealVoiceSession(session, KEY);
    expect(openVoiceSession(sealed, KEY, { now: 2_000_000_001 })).toBeNull();
  });

  it('can still be opened after expiry to stop the call', () => {
    const sealed = sealVoiceSession(session, KEY);
    expect(openVoiceSession(sealed, KEY, { now: 2_000_000_001, ignoreExpiry: true })?.roomId).toBe(
      'hall_abc'
    );
  });

  it('is refused when its contents were changed', () => {
    const [, signature] = sealVoiceSession(session, KEY).split('.');
    const forged = Buffer.from(JSON.stringify({ ...session, ip: '10.0.0.1' })).toString(
      'base64url'
    );
    expect(openVoiceSession(`${forged}.${signature}`, KEY, { now: 1 })).toBeNull();
  });

  it('is refused when sealed with another key', () => {
    expect(openVoiceSession(sealVoiceSession(session, 'other'), KEY, { now: 1 })).toBeNull();
  });

  it.each([undefined, null, 42, '', 'no-dot', 'a.b.c', `${'x'.repeat(5000)}.y`])(
    'is refused for the malformed token %j',
    (token) => {
      expect(openVoiceSession(token, KEY, { now: 1 })).toBeNull();
    }
  );

  it('keeps a long landing page from bloating the header it travels in', () => {
    const sealed = sealVoiceSession(
      { ...session, leadSource: { landingPage: `/${'a'.repeat(900)}` } },
      KEY
    );
    expect(openVoiceSession(sealed, KEY, { now: 1 })?.leadSource?.landingPage).toHaveLength(150);
    expect(sealed.length).toBeLessThan(1000);
  });

  it('names rooms within what BytePlus accepts for an id', () => {
    const ids = newVoiceIds();
    for (const id of Object.values(ids)) expect(id).toMatch(/^[A-Za-z0-9@._-]{1,128}$/);
    expect(new Set(Object.values(ids)).size).toBe(4);
    expect(newVoiceIds().roomId).not.toBe(ids.roomId);
  });
});
