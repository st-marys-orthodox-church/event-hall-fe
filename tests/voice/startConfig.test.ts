import { afterEach, describe, expect, it, vi } from 'vitest';
import chat from '../../public/locales/en/chat.json';
import { voiceConfig } from '../../src/server/voice/config';
import type { VoiceSession } from '../../src/server/voice/session';
import { buildStartVoiceChat } from '../../src/server/voice/startConfig';
import { VOICE_ENV } from '../helpers/http';

// biome-ignore lint/suspicious/noExplicitAny: the request is read at arbitrary depth
type Json = Record<string, any>;

const session: VoiceSession = {
  roomId: 'hall_1',
  taskId: 'task_1',
  userId: 'visitor_1',
  agentUserId: 'agent_1',
  ip: '198.51.100.4',
  leadSource: null,
  expiresAt: 2_000_000_000,
};

const build = (env: Record<string, string> = {}): Json => {
  for (const [name, value] of Object.entries({ ...VOICE_ENV, ...env })) vi.stubEnv(name, value);
  return buildStartVoiceChat(session, 'sealed.session', voiceConfig());
};

describe('buildStartVoiceChat', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('puts the agent in the room the visitor was given a token for', () => {
    const request = build();
    expect(request).toMatchObject({
      AppId: VOICE_ENV.BYTEPLUS_RTC_APP_ID,
      RoomId: 'hall_1',
      TaskId: 'task_1',
      AgentConfig: {
        TargetUserID: ['visitor_1'],
        UserID: 'agent_1',
        WelcomeMessage: chat.voice.spoken.welcome,
        EnableConversationStateCallback: true,
      },
    });
  });

  it('points the model at our own endpoint with the session attached', () => {
    const { LLMConfig } = build().Config;
    expect(LLMConfig).toMatchObject({
      Mode: 'CustomLLM',
      // The trailing slash matters: without it the site answers with a redirect.
      Url: 'https://hall.example.test/api/voice/llm/',
      ExtraHeader: { 'x-voice-session': 'sealed.session' },
    });
    expect(JSON.parse(LLMConfig.Custom)).toEqual({ session: 'sealed.session' });
    expect(LLMConfig.ModelName).toBeTruthy();
    expect(LLMConfig.APIKey).toBe(voiceConfig().llmBearer);
  });

  it('never hands BytePlus the secret itself, only a key derived from it', () => {
    expect(JSON.stringify(build())).not.toContain(VOICE_ENV.VOICE_LLM_SECRET);
  });

  it('leaves the prompt and the tools on our side', () => {
    const { LLMConfig, FunctionCallingConfig } = build().Config;
    expect(LLMConfig.SystemMessages).toBeUndefined();
    expect(LLMConfig.Tools).toBeUndefined();
    expect(FunctionCallingConfig).toBeUndefined();
  });

  it('keeps enough history for a booking, not the default three rounds', () => {
    expect(build().Config.LLMConfig.HistoryLength).toBeGreaterThanOrEqual(12);
  });

  it('listens and speaks in English with the BytePlus speech services', () => {
    const { ASRConfig, TTSConfig } = build().Config;
    expect(ASRConfig).toMatchObject({
      Provider: 'BytePlus',
      ProviderParams: {
        Mode: 'SeedASR',
        Language: 'en-US',
        AppId: 'asr-app',
        AccessToken: 'asr-token',
      },
    });
    expect(TTSConfig).toMatchObject({
      Provider: 'BytePlus',
      ProviderParams: { app: { appid: 'tts-app', token: 'tts-token' } },
    });
    expect(TTSConfig.ProviderParams.audio.voice_type).toMatch(/^en_/);
  });

  it('has speech skip square brackets and subtitles keep them, for the action tags', () => {
    const { TTSConfig, SubtitleConfig } = build().Config;
    expect(TTSConfig.IgnoreBracketText).toContain(4);
    expect(SubtitleConfig).toEqual({ DisableRTSSubtitle: false, SubtitleMode: 1 });
  });

  it('uses the voice chosen in the environment', () => {
    const request = build({ VOICE_TTS_SPEAKER: 'en_female_skye_uranus_bigtts' });
    expect(request.Config.TTSConfig.ProviderParams.audio.voice_type).toBe(
      'en_female_skye_uranus_bigtts'
    );
  });

  it('lets an override change one setting without dropping its neighbours', () => {
    const request = build({
      VOICE_CONFIG_OVERRIDES: JSON.stringify({
        TTSConfig: { Provider: 'byteplus_Bidirectional_streaming' },
        LLMConfig: { HistoryLength: 10 },
      }),
    });
    expect(request.Config.TTSConfig.Provider).toBe('byteplus_Bidirectional_streaming');
    expect(request.Config.TTSConfig.ProviderParams.app.appid).toBe('tts-app');
    expect(request.Config.LLMConfig).toMatchObject({ Mode: 'CustomLLM', HistoryLength: 10 });
  });

  it.each(['not json', '[1,2]', '"text"'])('ignores the unusable override %s', (raw) => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(build({ VOICE_CONFIG_OVERRIDES: raw }).Config.TTSConfig.Provider).toBe('BytePlus');
  });
});
