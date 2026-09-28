import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAT_SYSTEM_PROMPT,
  CHAT_TOOLS,
  type ChatAction,
  type ChatToolContext,
  chatDateContext,
} from '../../server/chatAgent';
import { parseChatHistory, runChatLoop } from '../../server/chatLoop';
import { isHoneypotTripped } from '../../server/honeypot';
import { readLeadSource } from '../../server/leadSource';
import { getLlmProvider } from '../../server/llm';
import { clientIp, isRateLimited } from '../../server/rateLimit';

export const config = { maxDuration: 60 };

const MESSAGES_PER_10_MIN = 20;
// The chat's clock starts when the widget mounts, and a suggestion chip is one tap away.
const CHAT_MIN_FILL_MS = 1000;

export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | ({ type: 'action' } & ChatAction)
  | { type: 'error' }
  | { type: 'done' };

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
  const history = parseChatHistory(body.messages);
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
    const answered = await runChatLoop({
      provider,
      system: `${CHAT_SYSTEM_PROMPT}\n\n${chatDateContext()}`,
      history,
      tools: CHAT_TOOLS,
      signal: controller.signal,
      toolContext,
      onText: (delta) => send({ type: 'text', delta }),
    });
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
