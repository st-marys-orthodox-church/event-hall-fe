import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChatAction, ChatToolContext } from '../src/server/chatAgent';
import { scriptedProvider, text, toolCall } from './helpers/llm';

const runChatTool = vi.hoisted(() => vi.fn());
vi.mock('../src/server/chatAgent', async (original) => ({
  ...(await original<typeof import('../src/server/chatAgent')>()),
  runChatTool,
}));

const { parseChatHistory, runChatLoop } = await import('../src/server/chatLoop');

const run = async (provider: ReturnType<typeof scriptedProvider>) => {
  const spoken: string[] = [];
  const actions: ChatAction[] = [];
  const toolContext: ChatToolContext = {
    ip: '203.0.113.7',
    leadSource: null,
    locale: 'en',
    lastAssistantText: '',
    emit: (action) => actions.push(action),
    state: { booked: false },
  };
  const answered = await runChatLoop({
    provider,
    system: 'system',
    history: [{ role: 'user', content: 'Is June 14 open?' }],
    tools: [],
    signal: new AbortController().signal,
    toolContext,
    onText: (delta) => spoken.push(delta),
  });
  return { answered, spoken: spoken.join(''), actions, toolContext };
};

describe('runChatLoop', () => {
  beforeEach(() => {
    runChatTool.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('streams a plain answer', async () => {
    const result = await run(scriptedProvider([[text('It holds '), text('300 guests.')]]));
    expect(result).toMatchObject({ answered: true, spoken: 'It holds 300 guests.' });
    expect(runChatTool).not.toHaveBeenCalled();
  });

  it('runs the tool the model asked for and lets it answer from the result', async () => {
    runChatTool.mockResolvedValue('2027-06-14 is currently open.');
    const provider = scriptedProvider([
      [text('Let me check. '), toolCall('check_date_availability', { date: '2027-06-14' })],
      [text('June 14 is open.')],
    ]);
    const result = await run(provider);

    expect(runChatTool).toHaveBeenCalledWith(
      'check_date_availability',
      { date: '2027-06-14' },
      result.toolContext
    );
    expect(provider.toolResults).toEqual([
      [
        expect.objectContaining({
          output: '2027-06-14 is currently open.',
          isError: false,
        }),
      ],
    ]);
    expect(result.spoken).toBe('Let me check. June 14 is open.');
  });

  it('tells the model a tool failed and shows the visitor a way to reach a person', async () => {
    runChatTool.mockRejectedValue(new Error('calendar down'));
    const provider = scriptedProvider([[toolCall('get_viewing_slots')], [text('Sorry.')]]);
    const result = await run(provider);

    expect(provider.toolResults[0]?.[0]).toMatchObject({ isError: true });
    expect(provider.toolResults[0]?.[0]?.output).toContain('nothing was booked');
    expect(result.actions).toEqual([expect.objectContaining({ action: 'contact' })]);
    expect(result.answered).toBe(true);
  });

  it('stops a model that keeps calling tools', async () => {
    runChatTool.mockResolvedValue('ok');
    const provider = scriptedProvider(Array.from({ length: 20 }, () => [toolCall('loop')]));
    const result = await run(provider);

    expect(runChatTool).toHaveBeenCalledTimes(5);
    expect(result.answered).toBe(false);
  });

  it('reports a model that said nothing', async () => {
    expect((await run(scriptedProvider([[]]))).answered).toBe(false);
  });

  it('passes a model failure up to the caller', async () => {
    await expect(run(scriptedProvider([[new Error('quota')]]))).rejects.toThrow('quota');
  });
});

describe('parseChatHistory', () => {
  it('keeps the latest turns and trims each message', () => {
    const long = Array.from({ length: 40 }, (_, i) => ({
      role: i % 2 ? 'assistant' : 'user',
      content: ` turn ${i} `,
    }));
    const history = parseChatHistory([...long, { role: 'user', content: 'x'.repeat(5000) }]);
    expect(history?.length).toBeLessThanOrEqual(24);
    expect(history?.at(-1)?.content).toHaveLength(1000);
    expect(history?.[0]?.role).toBe('user');
  });

  it.each([
    ['not a list', 'hello'],
    ['an unknown role', [{ role: 'system', content: 'hi' }]],
    ['a message that is not text', [{ role: 'user', content: { text: 'hi' } }]],
    ['the agent speaking last', [{ role: 'assistant', content: 'hi' }]],
  ])('refuses %s', (_case, raw) => {
    expect(parseChatHistory(raw)).toBeNull();
  });
});
