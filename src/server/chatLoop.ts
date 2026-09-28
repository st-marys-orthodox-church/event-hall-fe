import { type ChatAction, type ChatToolContext, runChatTool } from './chatAgent';
import type { ChatTool, ChatTurn, LlmProvider } from './llm';
import type { LlmToolCall, LlmToolResult } from './llm/types';

const MAX_TURNS = 24;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOOL_ROUNDS = 4;

const FALLBACK_CONTACT: ChatAction = {
  action: 'contact',
  channels: ['call', 'whatsapp', 'form'],
  whatsapp: {},
};

/** Narrows an untrusted message list to a history that ends on the visitor's turn. */
export const parseChatHistory = (raw: unknown): ChatTurn[] | null => {
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

type ChatLoopInput = {
  provider: LlmProvider;
  system: string;
  history: ChatTurn[];
  tools: ChatTool[];
  signal: AbortSignal;
  /** `emit` is where the tools' on-screen actions go; the text goes to `onText`. */
  toolContext: ChatToolContext;
  onText: (delta: string) => void;
};

/**
 * One visitor turn: the model answers, calling tools as it goes. The text chat and the voice
 * agent both run this, so a booking behaves the same whichever way the visitor asked for it.
 * Resolves to whether the model said anything at all.
 */
export const runChatLoop = async ({
  provider,
  system,
  history,
  tools,
  signal,
  toolContext,
  onText,
}: ChatLoopInput): Promise<boolean> => {
  const session = provider.start({ system, history, tools, signal });
  let answered = false;
  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const calls: LlmToolCall[] = [];
    for await (const event of session.stream()) {
      if (event.type === 'tool_call') {
        calls.push(event.call);
      } else {
        answered = true;
        onText(event.delta);
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
        toolContext.emit(FALLBACK_CONTACT);
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
  return answered;
};
