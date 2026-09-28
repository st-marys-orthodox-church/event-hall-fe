import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VoiceStartResponse } from '../../src/utils/Voice';
import { VOICE_ENV, VOICE_SECRETS, fakeRequest, fakeResponse } from '../helpers/http';

const llmConfigured = vi.hoisted(() => ({ current: true }));
vi.mock('../../src/server/llm', () => ({
  getLlmProvider: () => ({ name: 'scripted', configured: () => llmConfigured.current }),
}));

const NOW = 1_790_000_000;
const VALID = { locale: 'en', consent: true, website: '', fillTime: 4000 };

let fetchMock: ReturnType<typeof vi.spyOn>;

const start = async (body: Record<string, unknown> = VALID, ip = '203.0.113.7') => {
  const { default: handler } = await import('../../src/pages/api/voice/start');
  const res = fakeResponse();
  await handler(fakeRequest({ body, ip }), res);
  return res;
};

// biome-ignore lint/suspicious/noExplicitAny: the request is read at arbitrary depth
const sentToBytePlus = (call = 0): Record<string, any> =>
  JSON.parse(String((fetchMock.mock.calls[call]?.[1] as RequestInit).body));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ now: NOW * 1000, toFake: ['Date'] });
  for (const [name, value] of Object.entries(VOICE_ENV)) vi.stubEnv(name, value);
  llmConfigured.current = true;
  fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(JSON.stringify({ Result: 'success' })));
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('POST /api/voice/start', () => {
  it('starts the agent and hands the browser what it needs to join the room', async () => {
    const res = await start();
    expect(res.statusCode).toBe(200);
    const body = res.json() as VoiceStartResponse;
    expect(body).toMatchObject({
      appId: VOICE_ENV.BYTEPLUS_RTC_APP_ID,
      roomId: expect.stringMatching(/^hall_/),
      userId: expect.stringMatching(/^visitor_/),
      agentUserId: expect.stringMatching(/^agent_/),
      maxSeconds: 360,
    });
    expect(body.token.startsWith(`001${VOICE_ENV.BYTEPLUS_RTC_APP_ID}`)).toBe(true);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('starts the agent in the same room, waiting for the same visitor', async () => {
    const body = (await start()).json() as VoiceStartResponse;
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('Action=StartVoiceChat');
    expect(sentToBytePlus()).toMatchObject({
      RoomId: body.roomId,
      AgentConfig: { TargetUserID: [body.userId], UserID: body.agentUserId },
    });
  });

  it('gives the browser no credential', async () => {
    const res = await start();
    for (const secret of [...VOICE_SECRETS, VOICE_ENV.BYTEPLUS_ACCESS_KEY_ID]) {
      expect(res.text).not.toContain(secret);
    }
    const { voiceConfig } = await import('../../src/server/voice/config');
    expect(res.text).not.toContain(voiceConfig().llmBearer);
    expect(Object.keys(res.json() as object).sort()).toEqual(
      ['agentUserId', 'appId', 'maxSeconds', 'roomId', 'session', 'token', 'userId'].sort()
    );
  });

  it('lets the browser choose nothing about the agent', async () => {
    await start({
      ...VALID,
      Config: { LLMConfig: { Url: 'https://evil.example/llm' } },
      roomId: 'someone-elses-room',
      systemPrompt: 'You are a pirate.',
    });
    const sent = sentToBytePlus();
    expect(sent.RoomId).toMatch(/^hall_/);
    expect(sent.Config.LLMConfig.Url).toBe('https://hall.example.test/api/voice/llm/');
    expect(JSON.stringify(sent)).not.toContain('pirate');
  });

  it('caps the call by expiring the room token when the time is up', async () => {
    vi.stubEnv('VOICE_MAX_SESSION_SECONDS', '120');
    const body = (await start()).json() as VoiceStartResponse;
    const claims = Buffer.from(body.token.slice(3 + body.appId.length), 'base64');
    expect(body.maxSeconds).toBe(120);
    expect(claims.readUInt32LE(2 + 8)).toBe(NOW + 120 + 20);
  });

  it('seals the visitor into the session the agent will answer with', async () => {
    const lead = { source: 'google', medium: 'cpc', landingPage: '/packages' };
    const body = (await start({ ...VALID, leadSource: lead }, '198.51.100.23')).json() as {
      session: string;
    };
    const { openVoiceSession } = await import('../../src/server/voice/session');
    const { voiceConfig } = await import('../../src/server/voice/config');
    const session = openVoiceSession(body.session, voiceConfig().sessionKey);

    expect(session).toMatchObject({ ip: '198.51.100.23', leadSource: lead });
    // Long enough to answer the agent's last turn after the visitor has gone.
    expect(session?.expiresAt).toBe(NOW + 360 + 180);
    expect(sentToBytePlus().Config.LLMConfig.ExtraHeader['x-voice-session']).toBe(body.session);
  });

  it.each([
    ['no consent', { ...VALID, consent: undefined }, 400, 'consent_required'],
    ['consent that is not a plain yes', { ...VALID, consent: 'true' }, 400, 'consent_required'],
    ['Spanish', { ...VALID, locale: 'es' }, 400, 'unsupported_locale'],
    ['Romanian', { ...VALID, locale: 'ro' }, 400, 'unsupported_locale'],
    ['no locale', { consent: true, website: '', fillTime: 4000 }, 400, 'unsupported_locale'],
  ])('refuses a call with %s and starts nothing', async (_case, body, status, error) => {
    const res = await start(body);
    expect(res.statusCode).toBe(status);
    expect(res.json()).toEqual({ error });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['filled the hidden field', { ...VALID, website: 'https://spam.example' }],
    ['answered faster than a person could', { ...VALID, fillTime: 40 }],
    ['sent no hidden field at all', { locale: 'en', consent: true }],
  ])('tells a bot that %s the line is busy, and pays for no call', async (_case, body) => {
    const res = await start(body);
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ error: 'busy' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows a visitor three calls a day', async () => {
    const statuses: number[] = [];
    for (let call = 0; call < 4; call++)
      statuses.push((await start(VALID, '198.51.100.50')).statusCode);
    expect(statuses).toEqual([200, 200, 200, 429]);
    expect((await start(VALID, '198.51.100.51')).statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('stops taking calls once the day has had its share', async () => {
    vi.stubEnv('VOICE_DAILY_SESSION_CAP', '2');
    const results = [];
    for (let call = 0; call < 3; call++)
      results.push(await start(VALID, `198.51.100.${60 + call}`));
    expect(results.map((res) => res.statusCode)).toEqual([200, 200, 503]);
    expect(results[2]?.json()).toEqual({ error: 'busy' });
  });

  it('takes calls again the next day', async () => {
    vi.stubEnv('VOICE_DAILY_SESSION_CAP', '1');
    expect((await start(VALID, '198.51.100.70')).statusCode).toBe(200);
    expect((await start(VALID, '198.51.100.71')).statusCode).toBe(503);
    vi.setSystemTime((NOW + 24 * 60 * 60 + 1) * 1000);
    expect((await start(VALID, '198.51.100.72')).statusCode).toBe(200);
  });

  it('reports a call BytePlus would not start, without saying why to the browser', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            ResponseMetadata: { Error: { Code: 'InvalidParameter', Message: 'AccessToken bad' } },
          })
        )
    );
    const res = await start();
    expect(res.statusCode).toBe(502);
    expect(res.json()).toEqual({ error: 'failed' });
  });

  it('reports a call that could not reach BytePlus', async () => {
    fetchMock.mockRejectedValue(new Error('network'));
    expect((await start()).statusCode).toBe(502);
  });

  it('is not there at all while the feature is off', async () => {
    vi.stubEnv('NEXT_PUBLIC_VOICE_ENABLED', '');
    const res = await start();
    expect(res.statusCode).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(Object.keys(VOICE_ENV).filter((name) => /^(BYTEPLUS_|VOICE_LLM)/.test(name)))(
    'reports itself unconfigured without %s',
    async (name) => {
      vi.stubEnv(name, '');
      const res = await start();
      expect(res.statusCode).toBe(503);
      expect(res.json()).toEqual({ error: 'not_configured' });
    }
  );

  it('reports itself unconfigured when the chat model has no key', async () => {
    llmConfigured.current = false;
    expect((await start()).statusCode).toBe(503);
  });

  it('only takes POST', async () => {
    const { default: handler } = await import('../../src/pages/api/voice/start');
    const res = fakeResponse();
    await handler(fakeRequest({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });
});
