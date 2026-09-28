import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SendIcon from '@mui/icons-material/Send';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useTranslation } from 'next-i18next/pages';
import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useHoneypot } from '../../hooks/UseHoneypot';
import { useVoiceCall } from '../../hooks/UseVoiceCall';
import type { ChatAction } from '../../server/chatAgent';
import { trackEvent } from '../../utils/Analytics';
import { VOICE_TYPED_MAX_CHARS, extractVoiceActions } from '../../utils/Voice';
import { HoneypotField } from '../base/HoneypotField';
import { ChatActions, type ChatActionsProps } from './ChatActions';

type VoicePanelProps = {
  /** Leaves the call screen for the text chat. */
  onBack: () => void;
};

const PRIMARY_BUTTON =
  'bg-brand-green-deep px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-green-ink';
const SECONDARY_BUTTON =
  'border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-brand-gold';

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const actionProps = (actions: ChatAction[]): ChatActionsProps => {
  const props: ChatActionsProps = { channel: 'voice' };
  for (const action of actions) {
    if (action.action === 'book_viewing') props.viewingPrefill = action.prefill;
    else if (action.action === 'contact') {
      props.contact = { channels: action.channels, whatsapp: action.whatsapp };
    } else props.booked = { start: action.start, email: action.email };
  }
  return props;
};

export const VoicePanel = ({ onBack }: VoicePanelProps) => {
  const { t } = useTranslation('chat');
  const honeypot = useHoneypot();
  const call = useVoiceCall(honeypot.payload);
  const [typed, setTyped] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  const bookedRef = useRef(false);

  const transcript = useMemo(
    () =>
      call.lines
        .map((line) => ({ role: line.role, ...extractVoiceActions(line.content) }))
        .filter((line) => line.text || line.actions.length > 0),
    [call.lines]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the transcript changes
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [transcript]);

  useEffect(() => {
    const booked = transcript.some((line) =>
      line.actions.some((action) => action.action === 'viewing_booked')
    );
    if (booked && !bookedRef.current) {
      bookedRef.current = true;
      trackEvent('voice_viewing_booked', { event_category: 'conversion' });
    }
  }, [transcript]);

  const startCall = () => {
    bookedRef.current = false;
    call.start();
  };

  const onSubmitTyped = (e: SyntheticEvent) => {
    e.preventDefault();
    if (call.sendTyped(typed)) setTyped('');
  };

  if (call.status === 'idle') {
    return (
      <div className="relative flex flex-1 flex-col overflow-y-auto px-4 py-4 text-[15px] leading-relaxed text-stone-700 sm:text-sm">
        <HoneypotField {...honeypot.fieldProps} />
        <h3 className="font-display text-lg text-stone-900">{t('voice.consent.heading')}</h3>
        <p className="mt-2">{t('voice.consent.body')}</p>
        <p className="mt-2">{t('voice.consent.booking')}</p>
        <p className="mt-2 text-stone-500">{t('voice.consent.limit')}</p>
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" onClick={startCall} className={PRIMARY_BUTTON}>
            {t('voice.consent.accept')}
          </button>
          <button type="button" onClick={onBack} className={SECONDARY_BUTTON}>
            {t('voice.consent.decline')}
          </button>
        </div>
      </div>
    );
  }

  if (call.status === 'requesting_mic' || call.status === 'connecting') {
    return (
      <div
        aria-live="polite"
        className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-sm text-stone-600"
      >
        <span className="flex h-14 w-14 animate-pulse items-center justify-center bg-primary-100 text-brand-green-deep">
          <MicIcon />
        </span>
        <p>
          {t(
            call.status === 'requesting_mic'
              ? 'voice.status.requestingMic'
              : 'voice.status.connecting'
          )}
        </p>
        <button type="button" onClick={() => call.end()} className={SECONDARY_BUTTON}>
          {t('voice.end')}
        </button>
      </div>
    );
  }

  if (call.status === 'error' || call.status === 'ended') {
    const failed = call.status === 'error';
    // A refused call will be refused again; the other failures are worth another try.
    const canRetry =
      !failed || !['busy', 'rateLimited', 'unsupported', 'noMic'].includes(call.error ?? '');
    return (
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 text-[15px] leading-relaxed text-stone-700 sm:text-sm">
        {failed ? (
          <p role="alert">{t(`voice.errors.${call.error ?? 'failed'}`)}</p>
        ) : (
          <>
            <h3 className="font-display text-lg text-stone-900">{t('voice.ended.heading')}</h3>
            <p className="mt-2">
              {t(call.endReason === 'timeUp' ? 'voice.ended.timeUp' : 'voice.ended.body')}
            </p>
          </>
        )}
        {failed && ['busy', 'dropped', 'failed'].includes(call.error ?? '') && (
          <ChatActions channel="voice" contact={{ channels: ['call', 'whatsapp'], whatsapp: {} }} />
        )}
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" onClick={onBack} className={PRIMARY_BUTTON}>
            {t('voice.back')}
          </button>
          {canRetry && (
            <button type="button" onClick={startCall} className={SECONDARY_BUTTON}>
              {t('voice.ended.again')}
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusKey = call.muted ? 'muted' : call.stage;

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-primary-100 px-4 py-2 text-sm">
        <p aria-live="polite" className="flex items-center gap-2 font-medium text-brand-green-ink">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${
              call.muted ? 'bg-stone-400' : 'bg-brand-green-deep'
            } ${call.stage === 'thinking' || call.muted ? '' : 'animate-pulse'}`}
          />
          {t(`voice.status.${statusKey}`)}
        </p>
        <p className="tabular-nums text-stone-600">
          {t('voice.timeLeft', { time: clock(call.secondsLeft) })}
        </p>
      </div>

      {call.audioBlocked && (
        <button
          type="button"
          onClick={call.unblockAudio}
          className="flex items-center justify-center gap-2 bg-brand-gold px-4 py-3 text-sm font-medium text-brand-dark"
        >
          <VolumeUpIcon fontSize="small" />
          {t('voice.unblockAudio')}
        </button>
      )}

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 text-[15px] leading-relaxed sm:text-sm"
      >
        {transcript.map((line, index) =>
          line.role === 'user' ? (
            <p key={index} className="ml-8 bg-brand-green-deep px-3 py-2 text-white">
              {line.text}
            </p>
          ) : (
            <div key={index} className="mr-8">
              {line.text && (
                <p className="whitespace-pre-wrap bg-stone-100 px-3 py-2 text-stone-800">
                  {line.text}
                </p>
              )}
              <ChatActions {...actionProps(line.actions)} />
            </div>
          )
        )}
      </div>

      <form
        onSubmit={onSubmitTyped}
        className="flex items-center gap-2 border-t border-stone-200 px-3 pt-3"
      >
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          maxLength={VOICE_TYPED_MAX_CHARS - 1}
          enterKeyHint="send"
          autoComplete="off"
          autoCapitalize="off"
          aria-label={t('voice.typed.label')}
          placeholder={t('voice.typed.placeholder')}
          className="min-w-0 flex-1 border border-stone-200 px-3 py-2.5 text-base text-stone-900 sm:py-2 sm:text-sm transition-colors hover:border-brand-gold focus:border-brand-green focus:outline-none"
        />
        <button
          type="submit"
          disabled={!typed.trim()}
          aria-label={t('voice.typed.send')}
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-green-deep text-white sm:h-auto sm:w-auto sm:p-2 transition-colors hover:bg-brand-green-ink disabled:opacity-40"
        >
          <SendIcon fontSize="small" />
        </button>
      </form>

      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={call.toggleMute}
          aria-pressed={call.muted}
          className={`flex flex-1 items-center justify-center gap-2 ${SECONDARY_BUTTON}`}
        >
          {call.muted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          {t(call.muted ? 'voice.unmute' : 'voice.mute')}
        </button>
        <button
          type="button"
          onClick={() => call.end()}
          className="flex flex-1 items-center justify-center gap-2 bg-red-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-800"
        >
          <CallEndIcon fontSize="small" />
          {t('voice.end')}
        </button>
      </div>
    </>
  );
};
