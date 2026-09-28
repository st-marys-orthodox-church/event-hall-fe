export type ChatTool = {
  name: string;
  description: string;
  parametersJsonSchema: Record<string, unknown>;
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type LlmToolCall = { id: string; name: string; args: unknown };

export type LlmEvent = { type: 'text'; delta: string } | { type: 'tool_call'; call: LlmToolCall };

export type LlmToolResult = { call: LlmToolCall; output: string; isError: boolean };

export type LlmSession = {
  // Streams one model round. Text deltas arrive as they are generated; tool calls are yielded
  // once complete. The round is over when the iterator ends.
  stream: () => AsyncIterable<LlmEvent>;
  // Answers the tool calls of the round that just streamed, ready for the next `stream()`.
  pushToolResults: (results: LlmToolResult[]) => void;
};

export type LlmProvider = {
  name: string;
  configured: () => boolean;
  start: (input: {
    system: string;
    history: ChatTurn[];
    tools: ChatTool[];
    signal: AbortSignal;
  }) => LlmSession;
};
