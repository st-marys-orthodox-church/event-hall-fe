import type { ChatAction } from '../server/chatAgent';

/** Voice is English-only at launch; Spanish and Romanian stay on the text chat. */
export const VOICE_LOCALE = 'en';

export const isVoiceEnabled = () => process.env.NEXT_PUBLIC_VOICE_ENABLED === '1';

// BytePlus caps a typed message sent into a live call at 200 characters.
export const VOICE_TYPED_MAX_CHARS = 200;

export type VoiceStartResponse = {
  appId: string;
  roomId: string;
  userId: string;
  agentUserId: string;
  token: string;
  /** Opaque; handed back to /api/voice/stop. */
  session: string;
  maxSeconds: number;
};

export type VoiceErrorCode =
  | 'disabled'
  | 'not_configured'
  | 'invalid'
  | 'unsupported_locale'
  | 'consent_required'
  | 'rate_limited'
  | 'busy'
  | 'failed';

/*
 * The voice pipeline only carries text, so an on-screen action (contact buttons, the booked
 * card) rides inside the reply as a bracketed tag. Text-to-speech is told to skip square
 * brackets, and the widget lifts the tag out of the subtitles. The payload is base64url so it
 * holds no bracket, space or punctuation for the pipeline to split on.
 */
const TAG_PREFIX = '[fx_';
// Subtitles arrive in pieces that the widget joins with spaces, so a tag may come back with
// whitespace inside it.
const TAG_PATTERN = /\[\s*fx_([A-Za-z0-9_\-\s]+)\]/g;

const toBase64Url = (text: string): string => {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (encoded: string): string => {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
};

const ACTION_NAMES = ['book_viewing', 'contact', 'viewing_booked'];

const isChatAction = (value: unknown): value is ChatAction =>
  typeof value === 'object' &&
  value !== null &&
  ACTION_NAMES.includes((value as { action?: unknown }).action as string);

export const encodeVoiceAction = (action: ChatAction): string =>
  `${TAG_PREFIX}${toBase64Url(JSON.stringify(action))}]`;

/** Splits what the agent said from the actions that rode along with it. */
export const extractVoiceActions = (raw: string): { text: string; actions: ChatAction[] } => {
  const actions: ChatAction[] = [];
  const text = raw
    .replace(TAG_PATTERN, (_tag, payload: string) => {
      try {
        const action: unknown = JSON.parse(fromBase64Url(payload.replace(/\s+/g, '')));
        if (isChatAction(action)) actions.push(action);
      } catch {
        // A tag mangled in transit is dropped; the agent has also said it aloud.
      }
      return '';
    })
    // A tag still arriving must not flash on screen as raw text.
    .replace(/\[\s*(f|fx|fx_[A-Za-z0-9_\-\s]*)?$/, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  return { text, actions };
};
