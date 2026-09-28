import chat from '../../../public/locales/en/chat.json';
import type { VoiceConfig } from './config';
import type { VoiceSession } from './session';

// BytePlus keeps 3 rounds by default. A tour booking gathers six details over many more turns
// than that, and the read-back check needs the agent's previous reply to still be there.
const HISTORY_ROUNDS = 20;
// English square brackets, which is where the on-screen action tags travel.
const SKIP_SQUARE_BRACKETS = 4;
// Subtitles straight from the reply text: the only mode that keeps the action tags intact.
const SUBTITLES_FROM_REPLY = 1;
const SILENCE_BEFORE_REPLY_MS = 800;

export const VOICE_SESSION_HEADER = 'x-voice-session';
export const VOICE_LLM_PATH = '/api/voice/llm';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const merge = (base: Json, patch: Json): Json => {
  const merged: Json = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = merged[key];
    merged[key] = isObject(current) && isObject(value) ? merge(current, value) : value;
  }
  return merged;
};

/**
 * The whole StartVoiceChat request, built here so the browser never chooses a model, a prompt or
 * a credential. `VOICE_CONFIG_OVERRIDES` patches `Config` for the details BytePlus's docs and its
 * sample app disagree on, without a redeploy of code.
 */
export const buildStartVoiceChat = (
  session: VoiceSession,
  sealedSession: string,
  config: VoiceConfig
): Json => ({
  AppId: config.rtcAppId,
  RoomId: session.roomId,
  TaskId: session.taskId,
  AgentConfig: {
    TargetUserID: [session.userId],
    UserID: session.agentUserId,
    WelcomeMessage: chat.voice.spoken.welcome,
    EnableConversationStateCallback: true,
  },
  Config: merge(
    {
      ASRConfig: {
        Provider: 'BytePlus',
        ProviderParams: {
          Mode: 'SeedASR',
          Language: 'en-US',
          AppId: config.asrAppId,
          AccessToken: config.asrAccessToken,
          ApiResourceId: 'volc.seedasr.sauc.duration',
          StreamMode: 2,
          enable_nonstream: true,
        },
        VADConfig: { SilenceTime: SILENCE_BEFORE_REPLY_MS },
      },
      TTSConfig: {
        Provider: 'BytePlus',
        ProviderParams: {
          app: { appid: config.ttsAppId, token: config.ttsToken },
          audio: { voice_type: config.ttsSpeaker },
          resourceId: 'seed-tts-2.0',
        },
        IgnoreBracketText: [SKIP_SQUARE_BRACKETS],
      },
      LLMConfig: {
        Mode: 'CustomLLM',
        Url: `${config.publicBaseUrl}${VOICE_LLM_PATH}`,
        APIKey: config.llmBearer,
        ModelName: 'fellowship-event-hall',
        HistoryLength: HISTORY_ROUNDS,
        ExtraHeader: { [VOICE_SESSION_HEADER]: sealedSession },
        // Same value as the header, for the case where only the body is passed through.
        Custom: JSON.stringify({ session: sealedSession }),
      },
      SubtitleConfig: { DisableRTSSubtitle: false, SubtitleMode: SUBTITLES_FROM_REPLY },
      InterruptMode: 0,
    },
    config.overrides
  ),
});
