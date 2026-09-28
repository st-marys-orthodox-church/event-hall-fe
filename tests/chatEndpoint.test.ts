import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatToolContext } from '../src/server/chatAgent';
import type { LlmProvider } from '../src/server/llm';
import { fakeRequest, fakeResponse } from './helpers/http';
import { scriptedProvider, text, toolCall } from './helpers/llm';

const runChatTool = vi.hoisted(() => vi.fn());
const provider = vi.hoisted(() => ({ current: undefined as LlmProvider | undefined }));
vi.mock('../src/server/chatAgent', async (original) => ({
  ...(await original<typeof import('../src/server/chatAgent')>()),
  runChatTool,
}));
vi.mock('../src/server/llm', () => ({ getLlmProvider: () => provider.current }));

const HUMAN = { website: '', fillTime: 4000 };

const ask = async (body: Record<string, unknown>, ip = '203.0.113.9') => {
  const { default: handler } = await import('../src/pages/api/chat');
  const res = fakeResponse();
  await handler(fakeRequest({ body: { ...HUMAN, ...body }, ip }), res);
  return res;
};
const events = (raw: string) =>
  raw
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
const question = { messages: [{ role: 'user', content: 'How many guests fit?' }] };

beforeEach(() => {
  vi.resetModules();
  runChatTool.mockReset();
  provider.current = scriptedProvider([[text('Up to 300 guests.')]]);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

// The text chat's behaviour must not move now that its loop is shared with the voice agent.
describe('POST /api/chat', () => {
  it('streams the answer as lines of JSON, ending with done', async () => {
    const res = await ask(question);
    expect(res.headers['content-type']).toMatch(/^application\/x-ndjson/);
    expect(events(res.text)).toEqual([
      { type: 'text', delta: 'Up to 300 guests.' },
      { type: 'done' },
    ]);
  });

  it('sends an action as its own event, not inside the text', async () => {
    runChatTool.mockImplementation(async (_name, _args, context: ChatToolContext) => {
      context.emit({ action: 'book_viewing', prefill: { guests: 120 } });
      return 'A button is shown.';
    });
    provider.current = scriptedProvider([[toolCall('offer_viewing_booking')], [text('Here.')]]);

    expect(events((await ask(question)).text)).toEqual([
      { type: 'action', action: 'book_viewing', prefill: { guests: 120 } },
      { type: 'text', delta: 'Here.' },
      { type: 'done' },
    ]);
  });

  it('runs tools as the visitor, in the language of the page, as a chat booking', async () => {
    runChatTool.mockResolvedValue('ok');
    provider.current = scriptedProvider([[toolCall('get_viewing_slots')], [text('Ok.')]]);
    await ask(
      {
        locale: 'ro',
        leadSource: { source: 'google' },
        messages: [
          { role: 'user', content: 'Bună' },
          { role: 'assistant', content: 'Bună! Cu ce te pot ajuta?' },
          { role: 'user', content: 'Vreau un tur' },
        ],
      },
      '198.51.100.77'
    );

    const context = runChatTool.mock.calls[0]?.[2] as ChatToolContext;
    expect(context).toMatchObject({
      ip: '198.51.100.77',
      locale: 'ro',
      leadSource: { source: 'google' },
      lastAssistantText: 'Bună! Cu ce te pot ajuta?',
    });
    expect(context.channel).toBeUndefined();
  });

  it('gives the model the chat prompt, without the rules for a call', async () => {
    await ask(question);
    const { system } = (provider.current as ReturnType<typeof scriptedProvider>).seen[0] ?? {};
    expect(system).toContain('<booking_a_tour>');
    expect(system).not.toContain('<voice_call>');
  });

  it.each([
    ['says nothing', [[]]],
    ['fails', [[new Error('quota')]]],
  ])('reports an error when the model %s', async (_case, rounds) => {
    provider.current = scriptedProvider(rounds);
    const res = await ask(question);
    expect(events(res.text).at(-1)).toEqual({ type: 'error' });
    expect(res.ended).toBe(true);
  });

  it('answers a bot as if all went well, without calling the model', async () => {
    const res = await ask({ ...question, website: 'https://spam.example' });
    expect(events(res.text)).toEqual([{ type: 'done' }]);
    expect((provider.current as ReturnType<typeof scriptedProvider>).seen).toHaveLength(0);
  });

  it('refuses a request with nothing to answer', async () => {
    expect((await ask({ messages: [] })).statusCode).toBe(400);
  });

  it('reports itself unconfigured when the model has no key', async () => {
    provider.current = scriptedProvider([], { configured: false });
    expect((await ask(question)).statusCode).toBe(503);
  });

  it('slows down a visitor who sends too much', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 21; i++) {
      provider.current = scriptedProvider([[text('ok')]]);
      statuses.push((await ask(question, '198.51.100.88')).statusCode);
    }
    expect(statuses.filter((status) => status === 200)).toHaveLength(20);
    expect(statuses.at(-1)).toBe(429);
  });
});
