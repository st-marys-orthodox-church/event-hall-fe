import type { IRTCEngine } from '@byteplus/rtc';
import { useCallback, useEffect, useRef, useState } from 'react';
import { trackEvent } from '../utils/Analytics';
import type { HoneypotFields } from '../utils/Honeypot';
import { getLeadSource } from '../utils/LeadSource';
import {
  VOICE_LOCALE,
  type VoiceCallError,
  type VoiceStartResponse,
  callErrorFor,
} from '../utils/Voice';
import {
  type VoiceAgentStage,
  type VoiceLine,
  applySubtitle,
  readRoomEvent,
  typedMessage,
} from '../utils/VoiceMessages';

type Sdk = typeof import('@byteplus/rtc');

export type VoiceCallStatus = 'idle' | 'requesting_mic' | 'connecting' | 'live' | 'ended' | 'error';

export type VoiceEndReason = 'hangUp' | 'timeUp';

// Trailing slashes spare a redirect, which a beacon from a closing page may not survive.
const START_URL = '/api/voice/start/';
const STOP_URL = '/api/voice/stop/';

const stopBody = (session: string) => JSON.stringify({ session });

const micProblem = async (): Promise<VoiceCallError> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'audioinput') ? 'micDenied' : 'noMic';
  } catch {
    return 'micDenied';
  }
};

/**
 * One voice call, from the visitor agreeing to it to either side hanging up. The RTC SDK is
 * fetched here, on the visitor's tap, so a page that never starts a call never downloads it.
 */
export const useVoiceCall = (honeypot: () => HoneypotFields) => {
  const [status, setStatus] = useState<VoiceCallStatus>('idle');
  const [stage, setStage] = useState<VoiceAgentStage>('listening');
  const [error, setError] = useState<VoiceCallError | null>(null);
  const [endReason, setEndReason] = useState<VoiceEndReason>('hangUp');
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const [muted, setMuted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false);

  const sdkRef = useRef<Sdk | null>(null);
  const engineRef = useRef<IRTCEngine | null>(null);
  const callRef = useRef<VoiceStartResponse | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  // Bumped whenever a call starts or ends, so a step that was still in flight can tell it lost.
  const runRef = useRef(0);

  const release = useCallback(async () => {
    runRef.current += 1;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const call = callRef.current;
    const engine = engineRef.current;
    callRef.current = null;
    engineRef.current = null;

    if (call) {
      // Left alone the agent waits three minutes for the visitor, and is billed for them.
      fetch(STOP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: stopBody(call.session),
        keepalive: true,
      }).catch(() => {});
      trackEvent('voice_call_end', {
        event_category: 'engagement',
        value: Math.round((Date.now() - startedAtRef.current) / 1000),
      });
    }
    if (engine) {
      try {
        await engine.stopAudioCapture();
        await engine.leaveRoom();
      } catch {
        // Already out of the room.
      }
      sdkRef.current?.default.destroyEngine(engine);
    }
  }, []);

  const fail = useCallback(
    (reason: VoiceCallError) => {
      release();
      setError(reason);
      setStatus('error');
      trackEvent('voice_call_error', { event_category: 'engagement', event_label: reason });
    },
    [release]
  );

  const end = useCallback(
    (reason: VoiceEndReason = 'hangUp') => {
      release();
      setEndReason(reason);
      setStatus('ended');
    },
    [release]
  );

  const start = useCallback(async () => {
    await release();
    const run = runRef.current;
    const lost = () => runRef.current !== run;
    setError(null);
    setLines([]);
    setMuted(false);
    setAudioBlocked(false);
    setStage('listening');
    setStatus('requesting_mic');

    let sdk: Sdk;
    try {
      sdk = await import('@byteplus/rtc');
      sdkRef.current = sdk;
      if (!(await sdk.default.isSupported())) return fail('unsupported');
    } catch {
      return fail('unsupported');
    }
    if (lost()) return;

    // The microphone comes first: a call that cannot hear the visitor is never started, or paid
    // for.
    const devices = await sdk.default
      .enableDevices({ audio: true, video: false })
      .catch(() => ({ audio: false }));
    if (lost()) return;
    if (!devices.audio) return fail(await micProblem());

    setStatus('connecting');
    let call: VoiceStartResponse;
    try {
      const res = await fetch(START_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: VOICE_LOCALE,
          consent: true,
          ...honeypot(),
          leadSource: getLeadSource(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return fail(callErrorFor((body as { error?: unknown }).error));
      call = body as VoiceStartResponse;
    } catch {
      return fail('failed');
    }
    // From here on there is an agent running, so every way out goes through `release`.
    callRef.current = call;
    startedAtRef.current = Date.now();
    if (lost()) {
      release();
      return;
    }

    try {
      const { default: rtc, RoomProfileType } = sdk;
      const engine = rtc.createEngine(call.appId);
      engineRef.current = engine;

      engine.on(rtc.events.onRoomBinaryMessageReceived, ({ message }) => {
        const event = readRoomEvent(message);
        if (event?.kind === 'stage') setStage(event.stage);
        if (event?.kind === 'subtitle') {
          setLines((prev) => applySubtitle(prev, event.subtitle, call.agentUserId));
        }
      });
      engine.on(rtc.events.onUserLeave, ({ userInfo }) => {
        if (userInfo.userId === call.agentUserId && callRef.current === call) fail('dropped');
      });
      engine.on(rtc.events.onError, ({ errorCode }) => {
        if (callRef.current !== call) return;
        if (errorCode === 'TOKEN_EXPIRED') end('timeUp');
        else fail('dropped');
      });
      engine.on(rtc.events.onAutoplayFailed, () => setAudioBlocked(true));

      await engine.joinRoom(
        call.token,
        call.roomId,
        { userId: call.userId },
        { isAutoPublish: true, isAutoSubscribeAudio: true, roomProfileType: RoomProfileType.chat }
      );
      await engine.startAudioCapture();
    } catch (err) {
      console.warn('voice: could not join the call', err);
      if (callRef.current === call) fail('failed');
      return;
    }
    if (callRef.current !== call) return;

    setSecondsLeft(call.maxSeconds);
    timerRef.current = setInterval(() => {
      const left = call.maxSeconds - Math.floor((Date.now() - startedAtRef.current) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) end('timeUp');
    }, 1000);
    setStatus('live');
    trackEvent('voice_call_start', { event_category: 'engagement' });
  }, [release, fail, end, honeypot]);

  const toggleMute = useCallback(async () => {
    const engine = engineRef.current;
    const sdk = sdkRef.current;
    if (!engine || !sdk) return;
    const next = !muted;
    try {
      if (next) await engine.unpublishStream(sdk.MediaType.AUDIO);
      else await engine.publishStream(sdk.MediaType.AUDIO);
      setMuted(next);
    } catch (err) {
      console.warn('voice: could not change the microphone', err);
    }
  }, [muted]);

  const sendTyped = useCallback((text: string): boolean => {
    const engine = engineRef.current;
    const call = callRef.current;
    const message = typedMessage(text);
    if (!engine || !call || !message) return false;
    engine.sendUserBinaryMessage(call.agentUserId, message).catch(() => {});
    const content = text.trim();
    setLines((prev) => {
      const settled = prev.map((line) => (line.done ? line : { ...line, done: true }));
      return [...settled, { role: 'user', content, settled: content, done: true }];
    });
    return true;
  }, []);

  const unblockAudio = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    engineRef.current
      ?.play(call.agentUserId)
      .then(() => setAudioBlocked(false))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // A tab that is closing cannot wait on a fetch; a beacon outlives the page.
    const onPageHide = () => {
      const call = callRef.current;
      if (!call) return;
      navigator.sendBeacon(
        STOP_URL,
        new Blob([stopBody(call.session)], { type: 'application/json' })
      );
    };
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      release();
    };
  }, [release]);

  return {
    status,
    stage,
    error,
    endReason,
    lines,
    muted,
    secondsLeft,
    audioBlocked,
    start,
    end,
    toggleMute,
    sendTyped,
    unblockAudio,
  };
};
