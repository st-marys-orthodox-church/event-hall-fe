import { createHmac } from 'node:crypto';
import { AppConfig } from '../../utils/AppConfig';

const DEFAULT_OPENAPI_URL = 'https://open.byteplusapi.com';
const DEFAULT_OPENAPI_REGION = 'ap-singapore-1';
// "Ivy", one of the two voices BytePlus lists for customer service. Pick by ear once there is an
// account to listen with.
const DEFAULT_SPEAKER = 'en_female_lana_del_rey_parky_s_p1_uranus_bigtts';
const DEFAULT_MAX_SESSION_SECONDS = 360;
const DEFAULT_DAILY_SESSION_CAP = 40;

/** The agent keeps running, and billing, this long after the visitor leaves without a stop. */
export const AGENT_AUTO_STOP_SECONDS = 180;

const REQUIRED = [
  'BYTEPLUS_ACCESS_KEY_ID',
  'BYTEPLUS_SECRET_ACCESS_KEY',
  'BYTEPLUS_RTC_APP_ID',
  'BYTEPLUS_RTC_APP_KEY',
  'BYTEPLUS_ASR_APP_ID',
  'BYTEPLUS_ASR_ACCESS_TOKEN',
  'BYTEPLUS_TTS_APP_ID',
  'BYTEPLUS_TTS_TOKEN',
  'VOICE_LLM_SECRET',
] as const;

export const isVoiceConfigured = (): boolean => REQUIRED.every((name) => process.env[name]);

const positiveInt = (raw: string | undefined, fallback: number): number => {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const readOverrides = (): Record<string, unknown> => {
  const raw = process.env.VOICE_CONFIG_OVERRIDES;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Falls through to the warning below.
  }
  console.error('voice: VOICE_CONFIG_OVERRIDES is not a JSON object, ignoring it');
  return {};
};

// The one secret is never used as-is, so what BytePlus holds cannot sign a session.
const derive = (purpose: string): string =>
  createHmac('sha256', process.env.VOICE_LLM_SECRET ?? '')
    .update(purpose)
    .digest('hex');

/** Read at call time so a test, or a redeploy, sees the environment it set. */
export const voiceConfig = () => ({
  accessKeyId: process.env.BYTEPLUS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.BYTEPLUS_SECRET_ACCESS_KEY ?? '',
  openApiUrl: (process.env.BYTEPLUS_OPENAPI_URL || DEFAULT_OPENAPI_URL).replace(/\/$/, ''),
  openApiRegion: process.env.BYTEPLUS_OPENAPI_REGION || DEFAULT_OPENAPI_REGION,
  rtcAppId: process.env.BYTEPLUS_RTC_APP_ID ?? '',
  rtcAppKey: process.env.BYTEPLUS_RTC_APP_KEY ?? '',
  asrAppId: process.env.BYTEPLUS_ASR_APP_ID ?? '',
  asrAccessToken: process.env.BYTEPLUS_ASR_ACCESS_TOKEN ?? '',
  ttsAppId: process.env.BYTEPLUS_TTS_APP_ID ?? '',
  ttsToken: process.env.BYTEPLUS_TTS_TOKEN ?? '',
  ttsSpeaker: process.env.VOICE_TTS_SPEAKER || DEFAULT_SPEAKER,
  publicBaseUrl: (process.env.VOICE_PUBLIC_BASE_URL || AppConfig.url).replace(/\/$/, ''),
  maxSessionSeconds: positiveInt(
    process.env.VOICE_MAX_SESSION_SECONDS,
    DEFAULT_MAX_SESSION_SECONDS
  ),
  dailySessionCap: positiveInt(process.env.VOICE_DAILY_SESSION_CAP, DEFAULT_DAILY_SESSION_CAP),
  overrides: readOverrides(),
  llmBearer: derive('bearer'),
  sessionKey: derive('session'),
});

export type VoiceConfig = ReturnType<typeof voiceConfig>;
