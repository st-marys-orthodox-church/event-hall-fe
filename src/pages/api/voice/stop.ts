import type { NextApiRequest, NextApiResponse } from 'next';
import { isVoiceConfigured, voiceConfig } from '../../../server/voice/config';
import { callVoiceChatApi } from '../../../server/voice/openApi';
import { openVoiceSession } from '../../../server/voice/session';
import { isVoiceEnabled } from '../../../utils/Voice';

const readBody = (req: NextApiRequest): Record<string, unknown> => {
  // A page that is closing reports through sendBeacon, which may not label its body as JSON.
  if (typeof req.body === 'string') {
    try {
      const parsed: unknown = JSON.parse(req.body);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : {};
    } catch {
      return {};
    }
  }
  return typeof req.body === 'object' && req.body !== null ? req.body : {};
};

/**
 * Ends the agent's side of a call. Left alone, the agent waits 180 seconds for the visitor to
 * come back and is billed for all of them.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isVoiceEnabled()) return res.status(404).json({ error: 'disabled' });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isVoiceConfigured()) return res.status(503).json({ error: 'not_configured' });

  const settings = voiceConfig();
  // An expired session is still a call worth stopping; the signature is what proves it is ours.
  const session = openVoiceSession(readBody(req).session, settings.sessionKey, {
    ignoreExpiry: true,
  });
  if (!session) return res.status(400).json({ error: 'invalid' });

  try {
    await callVoiceChatApi(
      'StopVoiceChat',
      { AppId: settings.rtcAppId, RoomId: session.roomId, TaskId: session.taskId },
      settings
    );
  } catch (err) {
    // Stopping twice, or after the agent stopped itself, fails harmlessly.
    console.info('voice: stop did not go through', err);
  }
  return res.status(200).json({ ok: true });
}

export default handler;
