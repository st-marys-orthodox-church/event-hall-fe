import type { LlmProvider } from '../../src/server/llm';
import type { LlmEvent, LlmToolResult } from '../../src/server/llm/types';

export type ScriptedProvider = LlmProvider & {
  /** What `start` was given, and the tool results pushed back after each round. */
  seen: { system: string; history: { role: string; content: string }[] }[];
  toolResults: LlmToolResult[][];
};

/** A model that plays back one scripted round per `stream()` call. */
export const scriptedProvider = (
  rounds: (LlmEvent | Error)[][],
  { configured = true } = {}
): ScriptedProvider => {
  const provider: ScriptedProvider = {
    name: 'scripted',
    seen: [],
    toolResults: [],
    configured: () => configured,
    start: ({ system, history }) => {
      provider.seen.push({ system, history });
      let round = 0;
      return {
        async *stream() {
          for (const event of rounds[round++] ?? []) {
            if (event instanceof Error) throw event;
            yield event;
          }
        },
        pushToolResults: (results) => {
          provider.toolResults.push(results);
        },
      };
    },
  };
  return provider;
};

export const text = (delta: string): LlmEvent => ({ type: 'text', delta });

export const toolCall = (name: string, args: unknown = {}, id = `call_${name}`): LlmEvent => ({
  type: 'tool_call',
  call: { id, name, args },
});
