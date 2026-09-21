import Anthropic from '@anthropic-ai/sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  CHAT_SYSTEM_PROMPT,
  CHAT_TOOLS,
  type ChatAction,
  chatDateContext,
  runChatTool,
} from '../../server/chatAgent';
import { clientIp, isRateLimited } from '../../server/rateLimit';

export const config = { maxDuration: 60 };

const MODEL = process.env.CHAT_MODEL || 'claude-opus-5';
const MAX_TURNS = 24;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOOL_ROUNDS = 4;
const MESSAGES_PER_10_MIN = 20;

export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | ({ type: 'action' } & ChatAction)
  | { type: 'error' }
  | { type: 'done' };

const parseHistory = (raw: unknown): Anthropic.MessageParam[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const messages: Anthropic.MessageParam[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const { role, content } = (item ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) messages.push({ role, content: text });
  }
  while (messages[0]?.role === 'assistant') messages.shift();
  return messages.at(-1)?.role === 'user' ? messages : null;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'not_configured' });
  }
  const messages = parseHistory((req.body as { messages?: unknown } | null)?.messages);
  if (!messages) return res.status(400).json({ error: 'invalid' });
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

  const client = new Anthropic();
  const controller = new AbortController();
  res.on('close', () => controller.abort());

  try {
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const stream = client.messages.stream(
        {
          model: MODEL,
          max_tokens: 2048,
          output_config: { effort: 'low' },
          system: [
            { type: 'text', text: CHAT_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
            { type: 'text', text: chatDateContext() },
          ],
          tools: CHAT_TOOLS,
          messages,
        },
        { signal: controller.signal }
      );
      stream.on('text', (delta) => send({ type: 'text', delta }));
      const message = await stream.finalMessage();

      if (message.stop_reason === 'refusal') {
        send({ type: 'error' });
        break;
      }
      if (message.stop_reason !== 'tool_use') break;

      messages.push({ role: 'assistant', content: message.content });
      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const block of message.content) {
        if (block.type !== 'tool_use') continue;
        try {
          const content = await runChatTool(block.name, block.input, (action) =>
            send({ type: 'action', ...action })
          );
          results.push({ type: 'tool_result', tool_use_id: block.id, content });
        } catch (err) {
          console.error(`chat: tool ${block.name} failed`, err);
          results.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: 'The lookup failed. Suggest contacting the venue directly.',
            is_error: true,
          });
        }
      }
      messages.push({ role: 'user', content: results });
    }
    send({ type: 'done' });
  } catch (err) {
    if (!controller.signal.aborted) {
      if (err instanceof Anthropic.AuthenticationError) {
        console.error('chat: ANTHROPIC_API_KEY was rejected');
      } else if (err instanceof Anthropic.RateLimitError) {
        console.error('chat: Anthropic rate limit hit');
      } else if (err instanceof Anthropic.APIError) {
        console.error(`chat: Anthropic API error ${err.status}`, err.message);
      } else {
        console.error('chat: failed', err);
      }
      send({ type: 'error' });
    }
  } finally {
    res.end();
  }
}

export default handler;
