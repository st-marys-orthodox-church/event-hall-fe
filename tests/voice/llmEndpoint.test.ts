import { beforeEach, describe, expect, it, vi } from 'vitest';
import chat from '../../public/locales/en/chat.json';
import type { ChatToolContext } from '../../src/server/chatAgent';
import type { LlmProvider } from '../../src/server/llm';
import { extractVoiceActions } from '../../src/utils/Voice';
import { VOICE_ENV, VOICE_SECRETS, fakeRequest, fakeResponse } from '../helpers/http';
import { scriptedProvider, text, toolCall } from '../helpers/llm';

const runChatTool = vi.hoisted(() => vi.fn());
const provider = vi.hoisted(() => ({ current: undefined as LlmProvider | undefined }));
vi.mock('../../src/server/chatAgent', async (original) => ({
  ...(await original<typeof import('../../src/server/chatAgent')>()),
  runChatTool,
}));
vi.mock('../../src/server/llm', () => ({ getLlmProvider: () => provider.current }));

type Chunk = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: { index: number; delta: { role?: string; content?: string }; finish_reason: unknown }[];
};

const NOW = 1_790_000_000;
const SESSION = {
  roomId: 'hall_1',
  taskId: 'task_1',
  userId: 'visitor_1',
  agentUserId: 'agent_1',
  ip: '198.51.100.4',
  leadSource: { source: 'google', medium: 'cpc' },
  expiresAt: NOW + 600,
};

const load = async () => {
  const { voiceConfig } = await import('../../src/server/voice/config');
  const { sealVoiceSession } = await import('../../src/server/voice/session');
  const { default: handler } = await import('../../src/pages/api/voice/llm');
  const settings = voiceConfig();
  return {
    handler,
    bearer: `Bearer ${settings.llmBearer}`,
    seal: (session = SESSION) => sealVoiceSession(session, settings.sessionKey),
  };
};

const ask = async (
  messages: unknown = [{ role: 'user', content: 'How many guests fit?' }],
  change: (request: {
    headers: Record<string, string | undefined>;
    body: Record<string, unknown>;
  }) => void = () => {}
) => {
  const { handler, bearer, seal } = await load();
  const request = {
    headers: { authorization: bearer, 'x-voice-session': seal() } as Record<
      string,
      string | undefined
    >,
    body: { messages, stream: true, model: 'fellowship-event-hall' } as Record<string, unknown>,
  };
  change(request);
  const res = fakeResponse();
  await handler(fakeRequest(request), res);
  return res;
};

const events = (raw: string) => raw.split('\n\n').filter(Boolean);
const chunks = (raw: string): Chunk[] =>
  events(raw)
    .filter((event) => event !== 'data: [DONE]')
    .map((event) => JSON.parse(event.replace(/^data: /, '')));
const spoken = (raw: string) =>
  chunks(raw)
    .map((chunk) => chunk.choices[0]?.delta.content ?? '')
    .join('');

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers({ now: NOW * 1000, toFake: ['Date'] });
  for (const [name, value] of Object.entries(VOICE_ENV)) vi.stubEnv(name, value);
  runChatTool.mockReset();
  provider.current = scriptedProvider([[text('Up to 300 '), text('guests.')]]);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/voice/llm — the contract BytePlus holds a custom model to', () => {
  it('answers as a server-sent event stream', async () => {
    const res = await ask();
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/event-stream/);
    expect(res.ended).toBe(true);
  });

  it('ends the stream with the [DONE] marker, after a chunk that says why it stopped', async () => {
    const all = events((await ask()).text);
    expect(all.at(-1)).toBe('data: [DONE]');
    expect(JSON.parse((all.at(-2) ?? '').replace(/^data: /, '')).choices[0].finish_reason).toBe(
      'stop'
    );
  });

  it('shapes every chunk as a chat completion chunk under one id', async () => {
    const all = chunks((await ask()).text);
    expect(all.length).toBeGreaterThanOrEqual(3);
    for (const chunk of all) {
      expect(chunk).toMatchObject({
        object: 'chat.completion.chunk',
        created: NOW,
        model: 'fellowship-event-hall',
      });
      expect(chunk.choices).toHaveLength(1);
      expect(chunk.choices[0]).toMatchObject({ index: 0 });
      expect(chunk.choices[0]?.delta).toBeTypeOf('object');
    }
    expect(new Set(all.map((chunk) => chunk.id)).size).toBe(1);
    expect(all[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('opens with the role before the model has produced a word', async () => {
    const [first] = chunks((await ask()).text);
    expect(first?.choices[0]).toMatchObject({ delta: { role: 'assistant' }, finish_reason: null });
  });

  it('streams the answer in the order it was generated', async () => {
    expect(spoken((await ask()).text)).toBe('Up to 300 guests.');
  });
});

describe('POST /api/voice/llm — who may call it', () => {
  it.each([
    [
      'no API key',
      (r: { headers: Record<string, string | undefined> }) => {
        r.headers.authorization = undefined;
      },
    ],
    [
      'a wrong API key',
      (r: { headers: Record<string, string | undefined> }) => {
        r.headers.authorization = 'Bearer guess';
      },
    ],
    [
      'the raw secret instead of the derived key',
      (r: { headers: Record<string, string | undefined> }) => {
        r.headers.authorization = `Bearer ${VOICE_ENV.VOICE_LLM_SECRET}`;
      },
    ],
  ])('refuses %s in the error shape BytePlus reads', async (_case, change) => {
    const res = await ask(undefined, change);
    expect(res.statusCode).toBe(401);
    expect(res.json()).toEqual({
      Error: { Code: 'AuthenticationError', Message: expect.any(String) },
    });
    expect((provider.current as ReturnType<typeof scriptedProvider>).seen).toHaveLength(0);
  });

  it('refuses a call with no session', async () => {
    const res = await ask(undefined, (r) => {
      r.headers['x-voice-session'] = undefined;
    });
    expect(res.statusCode).toBe(401);
  });

  it('refuses a forged session', async () => {
    const res = await ask(undefined, (r) => {
      r.headers['x-voice-session'] =
        `${Buffer.from('{"roomId":"x","expiresAt":9999999999}').toString('base64url')}.sig`;
    });
    expect(res.statusCode).toBe(401);
  });

  it('refuses a session whose call is long over', async () => {
    vi.setSystemTime((SESSION.expiresAt + 1) * 1000);
    const { handler, bearer } = await load();
    const { sealVoiceSession } = await import('../../src/server/voice/session');
    const { voiceConfig } = await import('../../src/server/voice/config');
    const res = fakeResponse();
    await handler(
      fakeRequest({
        headers: {
          authorization: bearer,
          'x-voice-session': sealVoiceSession(SESSION, voiceConfig().sessionKey),
        },
        body: { messages: [{ role: 'user', content: 'hello' }] },
      }),
      res
    );
    expect(res.statusCode).toBe(401);
  });

  it('accepts the session from the request body when the header was not passed on', async () => {
    const { seal } = await load();
    const res = await ask(undefined, (r) => {
      r.headers['x-voice-session'] = undefined;
      r.body.custom = JSON.stringify({ session: seal() });
    });
    expect(res.statusCode).toBe(200);
  });

  it('is not there at all while the feature is off', async () => {
    vi.stubEnv('NEXT_PUBLIC_VOICE_ENABLED', '');
    expect((await ask()).statusCode).toBe(404);
  });

  it('reports itself unconfigured rather than failing mid-call', async () => {
    vi.stubEnv('BYTEPLUS_RTC_APP_KEY', '');
    expect((await ask()).statusCode).toBe(503);
  });

  it('reports itself unconfigured when the chat model has no key', async () => {
    provider.current = scriptedProvider([], { configured: false });
    expect((await ask()).statusCode).toBe(503);
  });

  it('only takes POST', async () => {
    const { handler } = await load();
    const res = fakeResponse();
    await handler(fakeRequest({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  it('refuses a request with nothing to answer', async () => {
    expect((await ask([{ role: 'assistant', content: 'Hello?' }])).statusCode).toBe(400);
    expect((await ask('nonsense')).statusCode).toBe(400);
  });

  it('cuts off a call that has taken an implausible number of turns', async () => {
    const statuses: number[] = [];
    const { handler, bearer, seal } = await load();
    for (let turn = 0; turn < 82; turn++) {
      provider.current = scriptedProvider([[text('ok')]]);
      const res = fakeResponse();
      await handler(
        fakeRequest({
          headers: { authorization: bearer, 'x-voice-session': seal() },
          body: { messages: [{ role: 'user', content: 'again' }] },
        }),
        res
      );
      statuses.push(res.statusCode);
    }
    expect(statuses.slice(0, 80).every((status) => status === 200)).toBe(true);
    expect(statuses.slice(80)).toEqual([429, 429]);
  });
});

describe('POST /api/voice/llm — the agent behind it', () => {
  it('is the text agent with the rules for a call added', async () => {
    await ask();
    const { CHAT_SYSTEM_PROMPT } = await import('../../src/server/chatAgent');
    const system = (provider.current as ReturnType<typeof scriptedProvider>).seen[0]?.system ?? '';
    expect(system).toContain(CHAT_SYSTEM_PROMPT);
    expect(system).toContain('<voice_call>');
    expect(system).toContain('Always reply in English');
    expect(system.indexOf('<voice_call>')).toBeGreaterThan(system.indexOf('<booking_a_tour>'));
    expect(system).toMatch(/Today is \w+ \d{4}-\d{2}-\d{2}/);
  });

  it('runs tools as the visitor who started the call, not as BytePlus', async () => {
    runChatTool.mockResolvedValue('open');
    provider.current = scriptedProvider([
      [toolCall('check_date_availability', { date: '2027-06-14' })],
      [text('It is open.')],
    ]);
    await ask(
      [
        { role: 'user', content: 'ana@example.com.' },
        { role: 'assistant', content: 'Ana Pop, ana@example.com, Saturday at ten. Book it?' },
        { role: 'user', content: 'Yes please' },
      ],
      (r) => {
        r.headers['x-forwarded-for'] = '192.0.2.99';
      }
    );

    const context = runChatTool.mock.calls[0]?.[2] as ChatToolContext;
    expect(context).toMatchObject({
      channel: 'voice',
      ip: SESSION.ip,
      leadSource: SESSION.leadSource,
      locale: 'en',
      lastAssistantText: 'Ana Pop, ana@example.com, Saturday at ten. Book it?',
    });
  });

  it('carries an on-screen action inside the reply, ahead of the words that follow it', async () => {
    runChatTool.mockImplementation(async (_name, _args, context: ChatToolContext) => {
      context.emit({
        action: 'viewing_booked',
        start: '2026-10-10T14:30:00.000Z',
        email: 'ana@example.com',
      });
      return 'Booked.';
    });
    provider.current = scriptedProvider([[toolCall('book_viewing')], [text('You are booked.')]]);

    const reply = spoken((await ask()).text);
    expect(extractVoiceActions(reply)).toEqual({
      text: 'You are booked.',
      actions: [
        { action: 'viewing_booked', start: '2026-10-10T14:30:00.000Z', email: 'ana@example.com' },
      ],
    });
    expect(reply.indexOf('[fx_')).toBeLessThan(reply.indexOf('You are booked.'));
  });

  it.each([
    ['the model fails outright', [[new Error('quota exceeded')]]],
    ['the model says nothing', [[]]],
  ])('still says something, and still ends properly, when %s', async (_case, rounds) => {
    provider.current = scriptedProvider(rounds);
    const res = await ask();

    expect(res.statusCode).toBe(200);
    const { text: said, actions } = extractVoiceActions(spoken(res.text));
    expect(said).toBe(chat.voice.spoken.fallback);
    expect(actions).toEqual([expect.objectContaining({ action: 'contact' })]);
    expect(events(res.text).at(-1)).toBe('data: [DONE]');
  });

  it('does not talk over an answer that failed halfway', async () => {
    provider.current = scriptedProvider([[text('The hall holds'), new Error('dropped')]]);
    const res = await ask();
    expect(spoken(res.text)).toBe('The hall holds');
    expect(events(res.text).at(-1)).toBe('data: [DONE]');
  });

  it('stops generating when BytePlus hangs up, as it does when the visitor interrupts', async () => {
    let signal: AbortSignal | undefined;
    let release = () => {};
    provider.current = {
      name: 'slow',
      configured: () => true,
      start: (input) => {
        signal = input.signal;
        return {
          async *stream() {
            yield text('The hall');
            await new Promise<void>((resolve) => {
              release = resolve;
            });
          },
          pushToolResults: () => {},
        };
      },
    };
    const { handler, bearer, seal } = await load();
    const res = fakeResponse();
    const pending = handler(
      fakeRequest({
        headers: { authorization: bearer, 'x-voice-session': seal() },
        body: { messages: [{ role: 'user', content: 'How many guests fit?' }] },
      }),
      res
    );
    await vi.waitFor(() => expect(res.text).toContain('The hall'));
    res.close();
    release();
    await pending;

    expect(signal?.aborted).toBe(true);
    expect(res.text).not.toContain('[DONE]');
    expect(res.text).not.toContain(chat.voice.spoken.fallback);
    expect(res.ended).toBe(true);
  });

  it('keeps every credential out of what it sends back', async () => {
    const res = await ask();
    for (const secret of VOICE_SECRETS) expect(res.text).not.toContain(secret);
  });
});
