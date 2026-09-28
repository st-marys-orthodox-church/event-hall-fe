import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VOICE_ENV, fakeRequest, fakeResponse } from '../helpers/http';

const NOW = 1_790_000_000;
const SESSION = {
  roomId: 'hall_1',
  taskId: 'task_1',
  userId: 'visitor_1',
  agentUserId: 'agent_1',
  ip: '198.51.100.4',
  leadSource: null,
  expiresAt: NOW + 600,
};

let fetchMock: ReturnType<typeof vi.spyOn>;

const sealed = async (session = SESSION) => {
  const { voiceConfig } = await import('../../src/server/voice/config');
  const { sealVoiceSession } = await import('../../src/server/voice/session');
  return sealVoiceSession(session, voiceConfig().sessionKey);
};

const stop = async (body: unknown) => {
  const { default: handler } = await import('../../src/pages/api/voice/stop');
  const res = fakeResponse();
  await handler(fakeRequest({ body }), res);
  return res;
};

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ now: NOW * 1000, toFake: ['Date'] });
  for (const [name, value] of Object.entries(VOICE_ENV)) vi.stubEnv(name, value);
  fetchMock = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response(JSON.stringify({ Result: 'ok' })));
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('POST /api/voice/stop', () => {
  it('stops the agent of the call the session belongs to', async () => {
    const res = await stop({ session: await sealed() });
    expect(res.statusCode).toBe(200);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('Action=StopVoiceChat');
    expect(JSON.parse(String((fetchMock.mock.calls[0]?.[1] as RequestInit).body))).toEqual({
      AppId: VOICE_ENV.BYTEPLUS_RTC_APP_ID,
      RoomId: 'hall_1',
      TaskId: 'task_1',
    });
  });

  it('reads the body a closing page sends without a JSON label', async () => {
    const res = await stop(JSON.stringify({ session: await sealed() }));
    expect(res.statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('still stops a call whose session has run out', async () => {
    const session = await sealed();
    vi.setSystemTime((SESSION.expiresAt + 3600) * 1000);
    expect((await stop({ session })).statusCode).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    ['no session', {}],
    ['a session we did not seal', { session: 'abc.def' }],
    ['a room named directly', { roomId: 'hall_1', taskId: 'task_1' }],
    ['a body that is not JSON', 'session=abc'],
  ])('stops nothing given %s', async (_case, body) => {
    const res = await stop(body);
    expect(res.statusCode).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('is fine with a call that had already stopped', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ ResponseMetadata: { Error: { Code: 'TaskNotFound', Message: '' } } })
        )
    );
    expect((await stop({ session: await sealed() })).statusCode).toBe(200);
  });

  it('is not there at all while the feature is off', async () => {
    vi.stubEnv('NEXT_PUBLIC_VOICE_ENABLED', '');
    expect((await stop({ session: await sealed() })).statusCode).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
