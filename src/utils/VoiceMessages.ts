import { VOICE_TYPED_MAX_CHARS } from './Voice';

/*
 * Everything the agent and the browser say to each other besides audio travels through the RTC
 * room as binary messages: a 4-character type, a big-endian length, then a JSON body.
 */
const HEADER_BYTES = 8;

export const encodeRoomMessage = (type: string, body: unknown): ArrayBuffer => {
  const value = new TextEncoder().encode(JSON.stringify(body));
  const buffer = new ArrayBuffer(HEADER_BYTES + value.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < 4; i++) bytes[i] = type.charCodeAt(i) || 0;
  new DataView(buffer).setUint32(4, value.length, false);
  bytes.set(value, HEADER_BYTES);
  return buffer;
};

export const decodeRoomMessage = (buffer: ArrayBuffer): { type: string; body: unknown } | null => {
  if (buffer.byteLength < HEADER_BYTES) return null;
  const bytes = new Uint8Array(buffer);
  const type = String.fromCharCode(...bytes.subarray(0, 4));
  const length = new DataView(buffer).getUint32(4, false);
  if (length > buffer.byteLength - HEADER_BYTES) return null;
  try {
    const json = new TextDecoder().decode(bytes.subarray(HEADER_BYTES, HEADER_BYTES + length));
    return { type, body: JSON.parse(json) };
  } catch {
    return null;
  }
};

export type VoiceAgentStage = 'listening' | 'thinking' | 'speaking';

// Stage codes of the agent's `conv` messages: 4 is "interrupted" and 5 "finished speaking", and
// either way the agent is listening again.
const STAGES: Record<number, VoiceAgentStage> = {
  1: 'listening',
  2: 'thinking',
  3: 'speaking',
  4: 'listening',
  5: 'listening',
};

export type VoiceSubtitle = {
  userId: string;
  text: string;
  /** The sentence is final: it will not be revised by a later message. */
  definite: boolean;
  /** The speaker's turn is over. */
  paragraph: boolean;
};

export type VoiceRoomEvent =
  | { kind: 'stage'; stage: VoiceAgentStage }
  | { kind: 'subtitle'; subtitle: VoiceSubtitle };

export const readRoomEvent = (buffer: ArrayBuffer): VoiceRoomEvent | null => {
  const message = decodeRoomMessage(buffer);
  if (!message || typeof message.body !== 'object' || message.body === null) return null;

  if (message.type === 'conv') {
    const code = (message.body as { Stage?: { Code?: unknown } }).Stage?.Code;
    const stage = typeof code === 'number' ? STAGES[code] : undefined;
    return stage ? { kind: 'stage', stage } : null;
  }

  if (message.type === 'subv') {
    const first = (message.body as { data?: unknown[] }).data?.[0];
    if (typeof first !== 'object' || first === null) return null;
    const { userId, text, definite, paragraph } = first as Record<string, unknown>;
    if (typeof userId !== 'string' || typeof text !== 'string') return null;
    return {
      kind: 'subtitle',
      subtitle: { userId, text, definite: definite === true, paragraph: paragraph === true },
    };
  }

  return null;
};

export type VoiceLine = {
  role: 'user' | 'assistant';
  /** Raw text, action tags included; the widget runs it through `extractVoiceActions`. */
  content: string;
  /** Text of the sentences already final. */
  settled: string;
  done: boolean;
};

const joinPieces = (before: string, piece: string): string =>
  !before || !piece || /\s$/.test(before) || /^[\s.,!?;:)\]]/.test(piece)
    ? `${before}${piece}`
    : `${before} ${piece}`;

/**
 * Folds one subtitle into the transcript. The visitor's speech arrives as revisions of the
 * sentence being recognized; the agent's arrives as the pieces of its reply, in order.
 */
export const applySubtitle = (
  lines: VoiceLine[],
  subtitle: VoiceSubtitle,
  agentUserId: string
): VoiceLine[] => {
  const role = subtitle.userId === agentUserId ? 'assistant' : 'user';
  const last = lines.at(-1);
  const open = last && last.role === role && !last.done ? last : null;
  const settled = open?.settled ?? '';

  let content: string;
  let nextSettled = settled;
  if (role === 'assistant') {
    content = joinPieces(open?.content ?? '', subtitle.text);
    nextSettled = content;
  } else {
    content = settled ? `${settled} ${subtitle.text}` : subtitle.text;
    if (subtitle.definite) nextSettled = content;
  }

  const line: VoiceLine = { role, content, settled: nextSettled, done: subtitle.paragraph };
  if (!content.trim()) return open ? [...lines.slice(0, -1), line] : lines;
  return open ? [...lines.slice(0, -1), line] : [...lines, line];
};

/** A typed message sent into the call, in the shape and within the limits BytePlus expects. */
export const typedMessage = (text: string): ArrayBuffer | null => {
  const trimmed = text.trim().replace(/\s+/g, ' ').slice(0, VOICE_TYPED_MAX_CHARS);
  if (!trimmed) return null;
  const message = /[.!?]$/.test(trimmed)
    ? trimmed
    : `${trimmed.slice(0, VOICE_TYPED_MAX_CHARS - 1)}.`;
  // Priority 1 cuts in on whatever the agent is saying: the visitor just answered its question.
  return encodeRoomMessage('ctrl', {
    Command: 'ExternalTextToLLM',
    Message: message,
    InterruptMode: 1,
  });
};
