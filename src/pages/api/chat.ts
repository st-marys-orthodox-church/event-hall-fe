import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAT_SYSTEM_PROMPT,
  CHAT_TOOLS,
  type ChatAction,
  type ChatToolContext,
  chatDateContext,
  runChatTool,
} from '../../server/chatAgent';
import { isHoneypotTripped } from '../../server/honeypot';
import { readLeadSource } from '../../server/leadSource';
import { type ChatTurn, getLlmProvider } from '../../server/llm';
import type { LlmToolCall, LlmToolResult } from '../../server/llm/types';
import { clientIp, isRateLimited } from '../../server/rateLimit';

export const config = { maxDuration: 60 };

const MAX_TURNS = 24;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOOL_ROUNDS = 4;
const MESSAGES_PER_10_MIN = 20;
// The chat's clock starts when the widget mounts, and a suggestion chip is one tap away.
const CHAT_MIN_FILL_MS = 1000;

export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | ({ type: 'action' } & ChatAction)
  | { type: 'error' }
  | { type: 'done' };

const parseHistory = (raw: unknown): ChatTurn[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const turns: ChatTurn[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const { role, content } = (item ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) turns.push({ role, content: text });
  }
  while (turns[0]?.role === 'assistant') turns.shift();
  return turns.at(-1)?.role === 'user' ? turns : null;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const provider = getLlmProvider();
  if (!provider.configured()) {
    return res.status(503).json({ error: 'not_configured' });
  }
  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;
  const history = parseHistory(body.messages);
  if (!history) return res.status(400).json({ error: 'invalid' });
  if (isHoneypotTripped(body, { form: 'chat', minFillMs: CHAT_MIN_FILL_MS })) {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    return res.status(200).end(`${JSON.stringify({ type: 'done' } satisfies ChatStreamEvent)}\n`);
  }
  if (isRateLimited(`chat:${clientIp(req)}`, MESSAGES_PER_10_MIN, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    // Stops Next's gzip from buffering the stream.
    'Content-Encoding': 'none',
  });
  const send = (event: ChatStreamEvent) => res.write(`${JSON.stringify(event)}\n`);

  const toolContext: ChatToolContext = {
    ip: clientIp(req),
    leadSource: readLeadSource(body.leadSource),
    locale: typeof body.locale === 'string' ? body.locale : 'en',
    lastAssistantText: history.at(-2)?.content ?? '',
    emit: (action) => send({ type: 'action', ...action }),
    state: { booked: false },
  };

  const controller = new AbortController();
  res.on('close', () => controller.abort());

  try {
    const session = provider.start({
      system: `${CHAT_SYSTEM_PROMPT}\n\n${chatDateContext()}`,
      history,
      tools: CHAT_TOOLS,
      signal: controller.signal,
    });
    let answered = false;
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const calls: LlmToolCall[] = [];
      for await (const event of session.stream()) {
        if (event.type === 'tool_call') {
          calls.push(event.call);
        } else {
          answered = true;
          send({ type: 'text', delta: event.delta });
        }
      }
      if (calls.length === 0) break;

      const results: LlmToolResult[] = [];
      for (const call of calls) {
        try {
          const output = await runChatTool(call.name, call.args, toolContext);
          results.push({ call, output, isError: false });
        } catch (err) {
          console.error(`chat: tool ${call.name} failed`, err);
          send({
            type: 'action',
            action: 'contact',
            channels: ['call', 'whatsapp', 'form'],
            whatsapp: {},
          });
          results.push({
            call,
            output:
              'The tool failed and nothing was booked. Apologize; contact buttons are now shown.',
            isError: true,
          });
        }
      }
      session.pushToolResults(results);
    }
    // A blocked or empty generation streams nothing; the visitor still needs a way forward.
    send(answered ? { type: 'done' } : { type: 'error' });
  } catch (err) {
    if (!controller.signal.aborted) {
      console.error(`chat: ${provider.name} failed`, err);
      send({ type: 'error' });
    }
  } finally {
    res.end();
  }
}

export default handler;
