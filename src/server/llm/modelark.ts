import type { LlmProvider, LlmToolCall } from './types';

const DEFAULT_BASE_URL = 'https://ark.ap-southeast.bytepluses.com/api/v3';

type ArkMessage =
  | { role: 'system' | 'user'; content: string }
  | {
      role: 'assistant';
      content: string | null;
      tool_calls?: {
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }[];
    }
  | { role: 'tool'; tool_call_id: string; content: string };

type ArkChunk = {
  choices?: {
    delta?: {
      content?: string | null;
      tool_calls?: {
        index: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }[];
    };
  }[];
};

const parseArgs = (raw: string): unknown => {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const modelArkProvider: LlmProvider = {
  name: 'modelark',
  configured: () => Boolean(process.env.MODELARK_API_KEY && process.env.MODELARK_MODEL),
  start: ({ system, history, tools, signal }) => {
    const baseUrl = (process.env.MODELARK_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
    const messages: ArkMessage[] = [
      { role: 'system', content: system },
      ...history.map((turn): ArkMessage => ({ role: turn.role, content: turn.content })),
    ];
    let roundText = '';
    let roundCalls: LlmToolCall[] = [];

    return {
      async *stream() {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.MODELARK_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.MODELARK_MODEL,
            messages,
            stream: true,
            max_tokens: 2048,
            tools: tools.map((tool) => ({
              type: 'function',
              function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parametersJsonSchema,
              },
            })),
          }),
          signal,
        });
        if (!response.ok || !response.body) {
          console.error(`chat: ModelArk error ${response.status}`, await response.text());
          throw new Error(`ModelArk ${response.status}`);
        }

        roundText = '';
        roundCalls = [];
        const pending = new Map<number, { id: string; name: string; args: string }>();
        const decoder = new TextDecoder();
        const reader = response.body.getReader();
        let buffer = '';
        let done = false;
        while (!done) {
          const read = await reader.read();
          buffer += decoder.decode(read.value, { stream: !read.done });
          const lines = buffer.split('\n');
          buffer = read.done ? '' : (lines.pop() ?? '');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') {
              done = true;
              break;
            }
            let chunk: ArkChunk;
            try {
              chunk = JSON.parse(data);
            } catch {
              continue;
            }
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              roundText += delta.content;
              yield { type: 'text', delta: delta.content };
            }
            for (const piece of delta?.tool_calls ?? []) {
              const entry = pending.get(piece.index) ?? { id: '', name: '', args: '' };
              entry.id = piece.id || entry.id;
              entry.name = piece.function?.name || entry.name;
              entry.args += piece.function?.arguments ?? '';
              pending.set(piece.index, entry);
            }
          }
          if (read.done) done = true;
        }

        for (const [index, entry] of [...pending.entries()].sort((a, b) => a[0] - b[0])) {
          const call = {
            id: entry.id || `call_${index}`,
            name: entry.name,
            args: parseArgs(entry.args),
          };
          roundCalls.push(call);
          yield { type: 'tool_call', call };
        }
      },
      pushToolResults(results) {
        messages.push({
          role: 'assistant',
          content: roundText || null,
          tool_calls: roundCalls.map((call) => ({
            id: call.id,
            type: 'function',
            function: { name: call.name, arguments: JSON.stringify(call.args ?? {}) },
          })),
        });
        for (const { call, output } of results) {
          messages.push({ role: 'tool', tool_call_id: call.id, content: output });
        }
      },
    };
  },
};
