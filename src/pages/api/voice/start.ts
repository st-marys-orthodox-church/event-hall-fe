import type { NextApiRequest, NextApiResponse } from 'next';
import { isHoneypotTripped } from '../../../server/honeypot';
import { readLeadSource } from '../../../server/leadSource';
import { getLlmProvider } from '../../../server/llm';
import { clientIp } from '../../../server/rateLimit';
import {
  AGENT_AUTO_STOP_SECONDS,
  isVoiceConfigured,
  voiceConfig,
} from '../../../server/voice/config';
import { refuseCall } from '../../../server/voice/limits';
import { callVoiceChatApi } from '../../../server/voice/openApi';
import { createRtcToken } from '../../../server/voice/rtcToken';
import { type VoiceSession, newVoiceIds, sealVoiceSession } from '../../../server/voice/session';
import { buildStartVoiceChat } from '../../../server/voice/startConfig';
import {
  VOICE_LOCALE,
  type VoiceErrorCode,
  type VoiceStartResponse,
  isVoiceEnabled,
} from '../../../utils/Voice';

// The consent screen is one tap, so the clock is short, as it is for the chat.
const VOICE_MIN_FILL_MS = 1000;
// Room for the visitor's clock to be a little off from ours.
const TOKEN_SLACK_SECONDS = 20;

const refuse = (res: NextApiResponse, status: number, error: VoiceErrorCode) =>
  res.status(status).json({ error });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isVoiceEnabled()) return refuse(res, 404, 'disabled');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isVoiceConfigured() || !getLlmProvider().configured()) {
    return refuse(res, 503, 'not_configured');
  }
  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;
  if (body.locale !== VOICE_LOCALE) return refuse(res, 400, 'unsupported_locale');
  // The microphone never opens on a call the visitor did not agree to.
  if (body.consent !== true) return refuse(res, 400, 'consent_required');
  // A bot gets the same answer as a busy line: nothing to learn, and no call to pay for.
  if (isHoneypotTripped(body, { form: 'voice', minFillMs: VOICE_MIN_FILL_MS })) {
    return refuse(res, 503, 'busy');
  }

  const settings = voiceConfig();
  const ip = clientIp(req);
  const refusal = refuseCall(ip, settings.dailySessionCap);
  if (refusal) return refuse(res, refusal === 'busy' ? 503 : 429, refusal);

  const now = Math.floor(Date.now() / 1000);
  const session: VoiceSession = {
    ...newVoiceIds(),
    ip,
    leadSource: readLeadSource(body.leadSource),
    // The agent can outlive the visitor by its auto-stop delay, and its last turn must still
    // be answered.
    expiresAt: now + settings.maxSessionSeconds + AGENT_AUTO_STOP_SECONDS,
  };
  const sealed = sealVoiceSession(session, settings.sessionKey);

  try {
    await callVoiceChatApi(
      'StartVoiceChat',
      buildStartVoiceChat(session, sealed, settings),
      settings
    );
  } catch (err) {
    console.error('voice: could not start the call', err);
    return refuse(res, 502, 'failed');
  }

  const response: VoiceStartResponse = {
    appId: settings.rtcAppId,
    roomId: session.roomId,
    userId: session.userId,
    agentUserId: session.agentUserId,
    // Expiry is the hard cap on a call: the SDK drops the visitor from the room when it lapses.
    token: createRtcToken({
      appId: settings.rtcAppId,
      appKey: settings.rtcAppKey,
      roomId: session.roomId,
      userId: session.userId,
      expiresAt: now + settings.maxSessionSeconds + TOKEN_SLACK_SECONDS,
    }),
    session: sealed,
    maxSeconds: settings.maxSessionSeconds,
  };
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(response);
}

export default handler;
