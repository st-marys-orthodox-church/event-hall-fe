import {
  ApiError,
  type Content,
  type FunctionCall,
  GoogleGenAI,
  type Part,
  ThinkingLevel,
} from '@google/genai';
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

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.CHAT_MODEL || 'gemini-3.8-flash';
const MAX_TURNS = 24;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOOL_ROUNDS = 4;
const MESSAGES_PER_10_MIN = 20;

export type ChatStreamEvent =
  | { type: 'text'; delta: string }
  | ({ type: 'action' } & ChatAction)
  | { type: 'error' }
  | { type: 'done' };

const parseHistory = (raw: unknown): Content[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const contents: Content[] = [];
  for (const item of raw.slice(-MAX_TURNS)) {
    const { role, content } = (item ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const text = content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (text) contents.push({ role: role === 'user' ? 'user' : 'model', parts: [{ text }] });
  }
  while (contents[0]?.role === 'model') contents.shift();
  return contents.at(-1)?.role === 'user' ? contents : null;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!API_KEY) {
    return res.status(503).json({ error: 'not_configured' });
  }
  const contents = parseHistory((req.body as { messages?: unknown } | null)?.messages);
  if (!contents) return res.status(400).json({ error: 'invalid' });
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

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const controller = new AbortController();
  res.on('close', () => controller.abort());

  try {
    let answered = false;
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const stream = await ai.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          systemInstruction: `${CHAT_SYSTEM_PROMPT}\n\n${chatDateContext()}`,
          tools: [{ functionDeclarations: CHAT_TOOLS }],
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          abortSignal: controller.signal,
        },
      });

      // Every part goes back verbatim on the next round: thought signatures ride on them.
      const modelParts: Part[] = [];
      const calls: FunctionCall[] = [];
      for await (const chunk of stream) {
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          modelParts.push(part);
          if (part.functionCall) calls.push(part.functionCall);
          else if (part.text && !part.thought) {
            answered = true;
            send({ type: 'text', delta: part.text });
          }
        }
      }
      if (calls.length === 0) break;

      contents.push({ role: 'model', parts: modelParts });
      const results: Part[] = [];
      for (const call of calls) {
        const name = call.name ?? '';
        try {
          const output = await runChatTool(name, call.args, (action) =>
            send({ type: 'action', ...action })
          );
          results.push({ functionResponse: { id: call.id, name, response: { output } } });
        } catch (err) {
          console.error(`chat: tool ${name} failed`, err);
          results.push({
            functionResponse: {
              id: call.id,
              name,
              response: { error: 'The lookup failed. Suggest contacting the venue directly.' },
            },
          });
        }
      }
      contents.push({ role: 'user', parts: results });
    }
    // A blocked or empty generation streams nothing; the visitor still needs a way forward.
    send(answered ? { type: 'done' } : { type: 'error' });
  } catch (err) {
    if (!controller.signal.aborted) {
      if (err instanceof ApiError) {
        console.error(`chat: Gemini API error ${err.status}`, err.message);
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
