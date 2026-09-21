import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'next-i18next/pages';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import type { ChatStreamEvent } from '../../pages/api/chat';
import { useAppContext } from '../../stores/Global';
import { trackEvent } from '../../utils/Analytics';
import type { ViewingPrefill } from '../../utils/Viewings';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  viewingPrefill?: ViewingPrefill;
  failed?: boolean;
};

const MAX_SUGGESTIONS = 3;

export const ChatWidget = () => {
  const { t } = useTranslation('chat');
  const { t: tViewing } = useTranslation('viewing');
  const { handleOpenViewing, handleOpenModal, modalOpen, viewingOpen } = useAppContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the transcript changes
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const patchLast = (patch: (last: ChatMessage) => ChatMessage) =>
    setMessages((prev) => {
      const last = prev.at(-1);
      return last ? [...prev.slice(0, -1), patch(last)] : prev;
    });

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || busy) return;
    const history = [
      ...messages.filter((m) => !m.failed),
      { role: 'user' as const, content: text },
    ];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    setBusy(true);
    trackEvent('chat_message', { event_category: 'engagement' });

    const fail = (key: 'error' | 'rateLimited') =>
      patchLast((last) => ({ ...last, content: last.content || t(key), failed: true }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok || !res.body) {
        fail(res.status === 429 ? 'rateLimited' : 'error');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as ChatStreamEvent;
          if (event.type === 'text') {
            patchLast((last) => ({ ...last, content: last.content + event.delta }));
          } else if (event.type === 'action') {
            patchLast((last) => ({ ...last, viewingPrefill: event.prefill }));
          } else if (event.type === 'error') {
            fail('error');
          }
        }
      }
    } catch {
      fail('error');
    } finally {
      setBusy(false);
    }
  };

  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content));
  const suggestions = (t('suggestions', { returnObjects: true }) as string[])
    .filter((suggestion) => !asked.has(suggestion))
    .slice(0, MAX_SUGGESTIONS);
  // Once they have an answer, a tour is always one tap away, unless the reply already offers it.
  const showViewingChip = messages.length > 0 && !messages.at(-1)?.viewingPrefill;

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    ask(input);
  };

  if (modalOpen || viewingOpen) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent('chat_open', { event_category: 'engagement' });
        }}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-brand-green-deep px-4 py-3 text-sm font-medium text-white shadow-elevate transition-colors duration-300 hover:bg-brand-green-ink"
      >
        <ChatBubbleOutline fontSize="small" />
        {t('launcher')}
      </button>
    );
  }

  return (
    <section
      aria-label={t('title')}
      className="fixed inset-x-3 bottom-3 z-40 flex max-h-[min(34rem,calc(100dvh-1.5rem))] flex-col border-t-2 border-brand-gold bg-white shadow-luxe sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[24rem]"
    >
      <header className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3">
        <div>
          <h2 className="font-display text-xl text-stone-900">{t('title')}</h2>
          <p className="text-xs text-stone-500">{t('disclaimer')}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t('close')}
          className="p-1 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <CloseIcon fontSize="small" />
        </button>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm leading-relaxed"
      >
        <p className="mr-8 bg-stone-100 px-3 py-2 text-stone-800">{t('greeting')}</p>

        {messages.map((message, index) =>
          message.role === 'user' ? (
            <p key={index} className="ml-8 bg-brand-green-deep px-3 py-2 text-white">
              {message.content}
            </p>
          ) : (
            <div key={index} className="mr-8">
              <p className="whitespace-pre-wrap bg-stone-100 px-3 py-2 text-stone-800">
                {message.content || <span className="text-stone-500">{t('thinking')}</span>}
              </p>
              {message.viewingPrefill && (
                <button
                  type="button"
                  onClick={() => handleOpenViewing(message.viewingPrefill)}
                  className="mt-2 bg-brand-gold px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-brand-dark transition-colors hover:bg-brand-gold-dark"
                >
                  {tViewing('cta.button')}
                </button>
              )}
              {message.failed && (
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="mt-2 border-b border-brand-gold pb-0.5 text-xs text-brand-green-ink hover:text-brand-green-deep"
                >
                  {t('contact')}
                </button>
              )}
            </div>
          )
        )}

        {!busy && (
          <div className="flex flex-wrap gap-2">
            {showViewingChip && (
              <button
                type="button"
                onClick={() => handleOpenViewing()}
                className="border border-brand-gold bg-brand-gold/10 px-3 py-1.5 text-xs font-medium text-brand-gold-ink transition-colors hover:bg-brand-gold hover:text-brand-dark"
              >
                {tViewing('cta.button')}
              </button>
            )}
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="border border-stone-200 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-brand-gold"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-stone-200 p-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(input);
            }
          }}
          maxLength={1000}
          aria-label={t('inputLabel')}
          placeholder={t('placeholder')}
          className="min-w-0 flex-1 border border-stone-200 px-3 py-2 text-sm text-stone-900 transition-colors hover:border-brand-gold focus:border-brand-green focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label={t('send')}
          className="bg-brand-green-deep p-2 text-white transition-colors hover:bg-brand-green-ink disabled:opacity-40"
        >
          <SendIcon fontSize="small" />
        </button>
      </form>
    </section>
  );
};
