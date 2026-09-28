import { randomUUID } from 'node:crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import chat from '../../../../public/locales/en/chat.json';
import { CHAT_TOOLS, type ChatToolContext } from '../../../server/chatAgent';
import { runChatLoop } from '../../../server/chatLoop';
import { getLlmProvider } from '../../../server/llm';
import { isVoiceConfigured, voiceConfig } from '../../../server/voice/config';
import { readVoiceHistory } from '../../../server/voice/history';
import { isCallOverTurns } from '../../../server/voice/limits';
import { voiceSystemPrompt } from '../../../server/voice/prompt';
import { openVoiceSession, safeEqual } from '../../../server/voice/session';
import { VOICE_SESSION_HEADER } from '../../../server/voice/startConfig';
import { VOICE_LOCALE, encodeVoiceAction, isVoiceEnabled } from '../../../utils/Voice';

export const config = { maxDuration: 60 };

const MODEL = 'fellowship-event-hall';

// The error body BytePlus expects from a custom model; it reports the code and ends the turn.
const refuse = (res: NextApiResponse, status: number, Code: string, Message: string) =>
  res.status(status).json({ Error: { Code, Message } });

const sessionToken = (req: NextApiRequest, body: Record<string, unknown>): unknown => {
  const header = req.headers[VOICE_SESSION_HEADER];
  if (typeof header === 'string' && header) return header;
  if (typeof body.custom !== 'string') return undefined;
  try {
    return (JSON.parse(body.custom) as { session?: unknown }).session;
  } catch {
    return undefined;
  }
};

/**
 * The model BytePlus calls on every turn of a voice call: an OpenAI-style chat completion
 * stream. Behind it is the same agent as the text chat, tools included, so BytePlus only ever
 * sees the words to be spoken.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isVoiceEnabled()) return refuse(res, 404, 'NotFound', 'Voice is not enabled.');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return refuse(res, 405, 'MethodNotAllowed', 'Use POST.');
  }
  const provider = getLlmProvider();
  if (!isVoiceConfigured() || !provider.configured()) {
    return refuse(res, 503, 'NotConfigured', 'Voice is not configured.');
  }

  const settings = voiceConfig();
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
  if (!safeEqual(bearer, settings.llmBearer)) {
    return refuse(res, 401, 'AuthenticationError', 'The API key is missing or invalid.');
  }
  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;
  const session = openVoiceSession(sessionToken(req, body), settings.sessionKey);
  if (!session) {
    return refuse(res, 401, 'AuthenticationError', 'The session is missing or has expired.');
  }
  const history = readVoiceHistory(body.messages);
  if (!history) return refuse(res, 400, 'InvalidParameter', 'No visitor message to answer.');
  if (isCallOverTurns(session.roomId)) {
    return refuse(res, 429, 'RateLimited', 'Too many turns in this call.');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Stops Next's gzip from buffering the stream.
    'Content-Encoding': 'none',
  });
  const id = randomUUID();
  const created = Math.floor(Date.now() / 1000);
  const chunk = (delta: Record<string, string>, finishReason: string | null = null) =>
    res.write(
      `data: ${JSON.stringify({
        id,
        object: 'chat.completion.chunk',
        created,
        model: MODEL,
        choices: [{ index: 0, delta, finish_reason: finishReason }],
      })}\n\n`
    );
  // Sent before the model is even called: BytePlus gives up on a silent endpoint after 10 s.
  chunk({ role: 'assistant' });

  const toolContext: ChatToolContext = {
    channel: 'voice',
    ip: session.ip,
    leadSource: session.leadSource,
    locale: VOICE_LOCALE,
    lastAssistantText: history.at(-2)?.content ?? '',
    // The space keeps the tag from fusing with the word before it in the subtitles.
    emit: (action) => chunk({ content: ` ${encodeVoiceAction(action)} ` }),
    state: { booked: false },
  };

  const controller = new AbortController();
  res.on('close', () => controller.abort());

  let answered = false;
  try {
    answered = await runChatLoop({
      provider,
      system: voiceSystemPrompt(),
      history,
      tools: CHAT_TOOLS,
      signal: controller.signal,
      toolContext,
      onText: (delta) => {
        answered = true;
        chunk({ content: delta });
      },
    });
  } catch (err) {
    if (!controller.signal.aborted) console.error(`voice: ${provider.name} failed`, err);
  } finally {
    if (!controller.signal.aborted) {
      // Silence on a call reads as a dropped line, so a failed turn still says something.
      if (!answered) {
        toolContext.emit({ action: 'contact', channels: ['call', 'whatsapp'], whatsapp: {} });
        chunk({ content: chat.voice.spoken.fallback });
      }
      chunk({}, 'stop');
      // Without the terminator BytePlus cannot tell the turn ended and stops keeping history.
      res.write('data: [DONE]\n\n');
    }
    res.end();
  }
}

export default handler;
