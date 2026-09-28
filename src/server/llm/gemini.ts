import {
  ApiError,
  type Content,
  type FunctionCall,
  GoogleGenAI,
  type Part,
  ThinkingLevel,
} from '@google/genai';
import type { LlmProvider } from './types';

export const geminiProvider: LlmProvider = {
  name: 'gemini',
  configured: () => Boolean(process.env.GEMINI_API_KEY),
  start: ({ system, history, tools, signal }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = process.env.CHAT_MODEL || 'gemini-3.8-flash';
    const contents: Content[] = history.map((turn) => ({
      role: turn.role === 'user' ? 'user' : 'model',
      parts: [{ text: turn.content }],
    }));
    let modelParts: Part[] = [];

    return {
      async *stream() {
        try {
          const stream = await ai.models.generateContentStream({
            model,
            contents,
            config: {
              systemInstruction: system,
              tools: [{ functionDeclarations: tools }],
              maxOutputTokens: 2048,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              abortSignal: signal,
            },
          });

          // Every part goes back verbatim on the next round: thought signatures ride on them.
          modelParts = [];
          for await (const chunk of stream) {
            for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
              modelParts.push(part);
              const call: FunctionCall | undefined = part.functionCall;
              if (call) {
                yield {
                  type: 'tool_call',
                  call: { id: call.id ?? call.name ?? '', name: call.name ?? '', args: call.args },
                };
              } else if (part.text && !part.thought) {
                yield { type: 'text', delta: part.text };
              }
            }
          }
        } catch (err) {
          if (err instanceof ApiError) console.error(`chat: Gemini API error ${err.status}`);
          throw err;
        }
      },
      pushToolResults(results) {
        contents.push({ role: 'model', parts: modelParts });
        contents.push({
          role: 'user',
          parts: results.map(({ call, output, isError }) => ({
            functionResponse: {
              id: call.id,
              name: call.name,
              response: isError ? { error: output } : { output },
            },
          })),
        });
      },
    };
  },
};
