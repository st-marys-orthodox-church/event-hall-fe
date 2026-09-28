import { extractVoiceActions } from '../../utils/Voice';
import { parseChatHistory } from '../chatLoop';
import type { ChatTurn } from '../llm';

/**
 * Turns the transcript BytePlus sends with each turn into the history the agent expects. A call
 * is messier than a chat: an interruption leaves two turns in a row from one side, and the
 * agent's own replies come back with their action tags still in them.
 */
export const readVoiceHistory = (raw: unknown): ChatTurn[] | null => {
  if (!Array.isArray(raw)) return null;
  const turns: ChatTurn[] = [];
  for (const item of raw) {
    const { role, content } = (item ?? {}) as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const text = role === 'assistant' ? extractVoiceActions(content).text : content.trim();
    if (!text) continue;
    const last = turns.at(-1);
    if (last?.role === role) last.content = `${last.content} ${text}`;
    else turns.push({ role, content: text });
  }
  return parseChatHistory(turns);
};
