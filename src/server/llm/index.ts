import { geminiProvider } from './gemini';
import { modelArkProvider } from './modelark';
import type { LlmProvider } from './types';

export type { ChatTool, ChatTurn, LlmProvider } from './types';

const PROVIDERS: Record<string, LlmProvider> = {
  gemini: geminiProvider,
  modelark: modelArkProvider,
};

export const getLlmProvider = (): LlmProvider =>
  PROVIDERS[process.env.CHAT_PROVIDER ?? 'gemini'] ?? geminiProvider;
