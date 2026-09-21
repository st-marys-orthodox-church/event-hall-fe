import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import SendIcon from '@mui/icons-material/Send';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import type { ChatStreamEvent } from '../../pages/api/chat';
import type { ChatAction } from '../../server/chatAgent';
import { useAppContext } from '../../stores/Global';
import { trackEvent } from '../../utils/Analytics';
import { PHONE_NUMBER, generateWhatsAppUrl } from '../../utils/Constants';
import { VENUE_TIMEZONE } from '../../utils/Events';
import type { ViewingPrefill } from '../../utils/Viewings';

type ContactOptions = Omit<Extract<ChatAction, { action: 'contact' }>, 'action'>;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  viewingPrefill?: ViewingPrefill;
  contact?: ContactOptions;
  booked?: { start: string; email: string };
  failed?: boolean;
};

const MAX_SUGGESTIONS = 3;
// Tailwind's `sm` breakpoint: below it the chat is a full-screen sheet.
const PHONE_QUERY = '(max-width: 639px)';

export const ChatWidget = () => {
  const { t } = useTranslation('chat');
  const { t: tViewing } = useTranslation('viewing');
  const { locale = 'en' } = useRouter();
  const { handleOpenViewing, handleOpenModal, modalOpen, viewingOpen } = useAppContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the transcript changes
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const sync = () => setIsPhone(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const visible = open && !modalOpen && !viewingOpen;

  // Focusing on a phone would throw the keyboard over the greeting before they have read it.
  useEffect(() => {
    if (visible && !isPhone) inputRef.current?.focus();
  }, [visible, isPhone]);

  // The on-screen keyboard overlays fixed elements instead of resizing the page, so on phones the
  // sheet tracks the visual viewport: the input always sits right above the keyboard.
  useEffect(() => {
    const panel = panelRef.current;
    if (!visible || !isPhone || !panel) return;
    const viewport = window.visualViewport;
    const fit = () => {
      if (viewport) {
        panel.style.height = `${viewport.height}px`;
        panel.style.top = `${viewport.offsetTop}px`;
      }
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    };
    fit();
    viewport?.addEventListener('resize', fit);
    viewport?.addEventListener('scroll', fit);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      viewport?.removeEventListener('resize', fit);
      viewport?.removeEventListener('scroll', fit);
      document.body.style.overflow = overflow;
      panel.style.height = '';
      panel.style.top = '';
    };
  }, [visible, isPhone]);

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
          locale,
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
            if (event.action === 'book_viewing') {
              patchLast((last) => ({ ...last, viewingPrefill: event.prefill }));
            } else if (event.action === 'contact') {
              const { channels, whatsapp } = event;
              patchLast((last) => ({ ...last, contact: { channels, whatsapp } }));
            } else {
              const { start, email } = event;
              patchLast((last) => ({ ...last, booked: { start, email } }));
              trackEvent('chat_viewing_booked', { event_category: 'conversion' });
            }
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
  const showViewingChip =
    messages.length > 0 &&
    !messages.at(-1)?.viewingPrefill &&
    !messages.at(-1)?.contact &&
    !messages.some((message) => message.booked);

  const formatWhen = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: VENUE_TIMEZONE,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));

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
        aria-label={t('launcher')}
        className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center gap-2 bg-brand-green-deep text-sm font-medium text-white shadow-elevate transition-colors duration-300 hover:bg-brand-green-ink sm:bottom-5 sm:right-5 sm:h-auto sm:w-auto sm:px-4 sm:py-3"
      >
        <ChatBubbleOutline fontSize={isPhone ? 'medium' : 'small'} />
        <span className="hidden sm:inline">{t('launcher')}</span>
      </button>
    );
  }

  return (
    <section
      ref={panelRef}
      aria-label={t('title')}
      className="fixed inset-x-0 top-0 z-[1200] flex h-dvh flex-col border-t-2 border-brand-gold bg-white shadow-luxe sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-5 sm:z-40 sm:h-auto sm:max-h-[min(34rem,calc(100dvh-2.5rem))] sm:w-[24rem]"
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
          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 sm:m-0 sm:h-auto sm:w-auto sm:p-1"
        >
          <CloseIcon fontSize={isPhone ? 'medium' : 'small'} />
        </button>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 text-[15px] leading-relaxed sm:text-sm"
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
                  className="mt-2 bg-brand-gold px-4 py-3 text-xs font-medium uppercase sm:px-3 sm:py-2 tracking-[0.14em] text-brand-dark transition-colors hover:bg-brand-gold-dark"
                >
                  {tViewing('cta.button')}
                </button>
              )}
              {message.booked && (
                <div className="mt-2 border-l-2 border-brand-green bg-primary-100 px-3 py-2">
                  <p className="flex items-center gap-1.5 font-medium text-brand-green-ink">
                    <CheckCircleOutline fontSize="small" />
                    {t('booked.heading')}
                  </p>
                  <p className="mt-1 text-sm text-stone-700 sm:text-xs">
                    {t('booked.body', {
                      when: formatWhen(message.booked.start),
                      email: message.booked.email,
                    })}
                  </p>
                </div>
              )}
              {message.contact && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.contact.channels.includes('call') && (
                    <a
                      href={`tel:${PHONE_NUMBER.replace(/[^\d+]/g, '')}`}
                      onClick={() =>
                        trackEvent('chat_call_click', { event_category: 'engagement' })
                      }
                      className="flex items-center gap-1.5 bg-brand-green-deep px-4 py-3 text-sm sm:px-3 sm:py-2 sm:text-xs font-medium text-white no-underline transition-colors hover:bg-brand-green-ink"
                    >
                      <PhoneIcon sx={{ fontSize: 16 }} />
                      {t('call')}
                    </a>
                  )}
                  {message.contact.channels.includes('whatsapp') && (
                    <a
                      href={generateWhatsAppUrl(message.contact.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent('chat_whatsapp_click', { event_category: 'engagement' })
                      }
                      className="flex items-center gap-1.5 bg-whatsapp px-4 py-3 text-sm sm:px-3 sm:py-2 sm:text-xs font-medium text-brand-dark no-underline transition-colors hover:bg-whatsapp-ink hover:text-white"
                    >
                      <WhatsAppIcon sx={{ fontSize: 16 }} />
                      {t('whatsapp')}
                    </a>
                  )}
                  {message.contact.channels.includes('form') && (
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent('chat_contact_form_click', { event_category: 'engagement' });
                        handleOpenModal();
                      }}
                      className="border border-brand-gold px-4 py-3 text-sm font-medium text-brand-gold-ink sm:px-3 sm:py-2 sm:text-xs transition-colors hover:bg-brand-gold hover:text-brand-dark"
                    >
                      {t('contactForm')}
                    </button>
                  )}
                </div>
              )}
              {message.failed && !message.contact && (
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="mt-2 border-b border-brand-gold py-2 text-sm text-brand-green-ink sm:py-0 sm:pb-0.5 sm:text-xs hover:text-brand-green-deep"
                >
                  {t('contact')}
                </button>
              )}
            </div>
          )
        )}

        {!busy && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {showViewingChip && (
              <button
                type="button"
                onClick={() => handleOpenViewing()}
                className="shrink-0 whitespace-nowrap border border-brand-gold bg-brand-gold/10 px-3.5 py-3 text-sm font-medium sm:px-3 sm:py-1.5 sm:text-xs text-brand-gold-ink transition-colors hover:bg-brand-gold hover:text-brand-dark"
              >
                {tViewing('cta.button')}
              </button>
            )}
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="shrink-0 whitespace-nowrap border border-stone-200 px-3.5 py-3 text-sm text-stone-700 sm:px-3 sm:py-1.5 sm:text-xs transition-colors hover:border-brand-gold"
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
          enterKeyHint="send"
          autoComplete="off"
          aria-label={t('inputLabel')}
          placeholder={t('placeholder')}
          className="min-w-0 flex-1 border border-stone-200 px-3 py-2.5 text-base text-stone-900 sm:py-2 sm:text-sm transition-colors hover:border-brand-gold focus:border-brand-green focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label={t('send')}
          // Keeps focus in the input so a phone's keyboard stays up between messages.
          onMouseDown={(e) => e.preventDefault()}
          className="flex h-11 w-11 shrink-0 items-center justify-center bg-brand-green-deep text-white sm:h-auto sm:w-auto sm:p-2 transition-colors hover:bg-brand-green-ink disabled:opacity-40"
        >
          <SendIcon fontSize="small" />
        </button>
      </form>
    </section>
  );
};
