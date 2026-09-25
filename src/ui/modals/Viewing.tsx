import CalendarMonth from '@mui/icons-material/CalendarMonth';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import type { AvailabilityResponse } from '../../pages/api/availability';
import { useAppContext } from '../../stores/Global';
import { trackEvent } from '../../utils/Analytics';
import { AppConfig } from '../../utils/AppConfig';
import { generateWhatsAppUrl } from '../../utils/Constants';
import { VENUE_TIMEZONE } from '../../utils/Events';
import { getLeadSource } from '../../utils/LeadSource';
import {
  VIEWING_CONFIG,
  type ViewingBookingRequest,
  type ViewingDay,
  type ViewingErrorCode,
  type ViewingSlotsResponse,
} from '../../utils/Viewings';
import { ModernButton } from '../components/ModernButton';

type Step = 'qualify' | 'slots' | 'details' | 'success';
type Blocker = 'overCapacity' | 'dateBooked' | null;
type SlotsState = 'loading' | 'ready' | 'unavailable';

const STEPS: Step[] = ['qualify', 'slots', 'details'];

const inputClass =
  'h-[3.125rem] sm:h-11 w-full border border-stone-200 bg-white px-3 py-3 text-base text-stone-900 transition-colors sm:text-sm duration-300 hover:border-brand-gold focus:border-brand-green focus:outline-none';
const labelClass = 'block text-sm text-stone-600 mb-1.5';

const pad = (n: number) => String(n).padStart(2, '0');
const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const nextDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const ERROR_KEYS: Partial<Record<ViewingErrorCode, string>> = {
  invalid: 'errors.invalid',
  slot_taken: 'errors.slotTaken',
  rate_limited: 'errors.rateLimited',
};

export function ViewingModal() {
  const { viewingOpen, viewingPrefill, handleCloseViewing, handleOpenModal } = useAppContext();
  const { t } = useTranslation('viewing');
  const { locale = 'en' } = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('qualify');
  const [guests, setGuests] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [dateFocused, setDateFocused] = useState(false);
  const [budgetAck, setBudgetAck] = useState(false);
  const [blocker, setBlocker] = useState<Blocker>(null);
  const [checking, setChecking] = useState(false);

  const [slotsState, setSlotsState] = useState<SlotsState>('loading');
  const [days, setDays] = useState<ViewingDay[]>([]);
  const [activeDate, setActiveDate] = useState('');
  const [slot, setSlot] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!viewingOpen) return;
    setStep('qualify');
    setBlocker(null);
    setSlot('');
    setError('');
    if (viewingPrefill?.guests) setGuests(String(viewingPrefill.guests));
    if (viewingPrefill?.eventDate) setEventDate(viewingPrefill.eventDate);
    dialogRef.current?.focus();
  }, [viewingOpen, viewingPrefill]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: handleCloseViewing is a stable context callback
  useEffect(() => {
    if (!viewingOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseViewing();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [viewingOpen]);

  if (!viewingOpen) return null;

  const formatDay = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(`${date}T12:00:00Z`));
  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: VENUE_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  const formatWhen = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: VENUE_TIMEZONE,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));

  const loadSlots = async () => {
    setSlotsState('loading');
    try {
      const res = await fetch('/api/viewings/slots');
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as ViewingSlotsResponse;
      setDays(body.days);
      setActiveDate(body.days[0]?.date ?? '');
      setSlotsState('ready');
    } catch {
      setSlotsState('unavailable');
    }
  };

  const contactInstead = () => handleOpenModal();
  const telHref = `tel:${AppConfig.telephone.replace(/[^\d+]/g, '')}`;
  const whatsAppHref = generateWhatsAppUrl({
    date: eventDate || undefined,
    guests: guests || undefined,
  });
  const talkLinkClass =
    'eyebrow text-brand-green-ink hover:text-brand-green-deep border-b border-brand-gold pb-0.5';

  const talkInstead = (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
      <button type="button" onClick={contactInstead} className={talkLinkClass}>
        {t('qualify.contactInstead')}
      </button>
      <a href={telHref} onClick={() => trackEvent('viewing_call_click')} className={talkLinkClass}>
        {t('fallback.call')}
      </a>
      <a
        href={whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('viewing_whatsapp_click')}
        className={talkLinkClass}
      >
        {t('fallback.whatsapp')}
      </a>
    </div>
  );

  const submitQualify = async (e: SyntheticEvent) => {
    e.preventDefault();
    setBlocker(null);
    if (Number(guests) > VIEWING_CONFIG.maxGuests) {
      setBlocker('overCapacity');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/availability?from=${eventDate}&to=${nextDay(eventDate)}`);
      if (res.ok) {
        const body = (await res.json()) as AvailabilityResponse;
        if (body.dates.includes(eventDate)) {
          setBlocker('dateBooked');
          return;
        }
      }
    } catch {
      // The booking endpoint re-checks the date, so a failed pre-check should not block the visitor.
    } finally {
      setChecking(false);
    }
    setStep('slots');
    loadSlots();
  };

  const submitBooking = async (e: SyntheticEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const payload: ViewingBookingRequest = {
      name,
      email,
      phone,
      guests: Number(guests),
      eventDate,
      budgetAck,
      slot,
      locale,
      website,
      leadSource: getLeadSource(),
    };
    try {
      const res = await fetch('/api/viewings/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error: ViewingErrorCode | '' };
      if (!body.error) {
        trackEvent('viewing_booked', { event_category: 'conversion' });
        setStep('success');
        return;
      }
      if (body.error === 'date_booked' || body.error === 'over_capacity') {
        setBlocker(body.error === 'date_booked' ? 'dateBooked' : 'overCapacity');
        setStep('qualify');
        return;
      }
      setError(t(ERROR_KEYS[body.error] ?? 'errors.failed'));
      if (body.error === 'slot_taken') {
        setSlot('');
        setStep('slots');
        loadSlots();
      }
    } catch {
      setError(t('errors.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const activeDay = days.find((d) => d.date === activeDate);
  const stepIndex = STEPS.indexOf(step);
  const address = `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t('modal.closeAriaLabel')}
        tabIndex={-1}
        onClick={handleCloseViewing}
        className="absolute inset-0 cursor-default bg-[rgba(15,23,23,0.55)]"
      />
      <div
        ref={dialogRef}
        // biome-ignore lint/a11y/useSemanticElements: <dialog> would need showModal() wiring; this mirrors the contact modal's behaviour
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewing-heading"
        tabIndex={-1}
        className="relative bg-white shadow-luxe max-w-xl w-full max-h-[90vh] overflow-y-auto border-t-2 border-brand-gold outline-none"
      >
        <div className="flex justify-between items-start px-8 pt-8 pb-5">
          <div>
            <span className="eyebrow text-brand-gold-ink">{t('modal.eyebrow')}</span>
            <h2
              id="viewing-heading"
              className="mt-2 font-display text-3xl md:text-4xl text-stone-900 leading-tight"
            >
              {step === 'success' ? t('success.heading') : t('modal.heading')}
            </h2>
            <div className="mt-3 w-10 h-px bg-brand-gold" />
            {step !== 'success' && (
              <p className="mt-3 text-sm text-stone-500 leading-relaxed max-w-sm">
                {t('modal.subheading')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCloseViewing}
            aria-label={t('modal.closeAriaLabel')}
            className="p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-8 pb-8">
          {stepIndex >= 0 && (
            <div className="eyebrow text-stone-500 mb-5">
              {t('modal.stepLabel', { current: stepIndex + 1, total: STEPS.length })}
            </div>
          )}

          {error && (
            <div role="alert" className="mb-5 border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
              {talkInstead}
            </div>
          )}

          {step === 'qualify' && (
            <form onSubmit={submitQualify} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="viewing-guests" className={labelClass}>
                    {t('qualify.guests')}
                  </label>
                  <input
                    id="viewing-guests"
                    type="number"
                    min={1}
                    required
                    value={guests}
                    onChange={(e) => {
                      setGuests(e.target.value);
                      setBlocker(null);
                    }}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="viewing-event-date" className={labelClass}>
                    {t('qualify.eventDate')}
                  </label>
                  <div className="relative">
                    <input
                      id="viewing-event-date"
                      type="date"
                      min={todayInput()}
                      required
                      value={eventDate}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        setBlocker(null);
                      }}
                      onFocus={() => setDateFocused(true)}
                      onBlur={() => setDateFocused(false)}
                      onClick={(e) => {
                        try {
                          e.currentTarget.showPicker?.();
                        } catch {}
                      }}
                      aria-describedby="viewing-event-date-hint"
                      className={`${inputClass} date-input pr-11 ${
                        !eventDate && !dateFocused ? 'date-input-empty' : ''
                      }`}
                    />
                    {!eventDate && !dateFocused && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base text-stone-400 sm:text-sm"
                      >
                        {t('qualify.eventDatePlaceholder')}
                      </span>
                    )}
                    <CalendarMonth
                      aria-hidden
                      fontSize="small"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold"
                    />
                  </div>
                  <p id="viewing-event-date-hint" className="mt-1 text-xs text-stone-500">
                    {t('qualify.eventDateHint')}
                  </p>
                </div>
              </div>
              <label className="flex items-start gap-3 text-sm text-stone-600 leading-relaxed">
                <input
                  type="checkbox"
                  required
                  checked={budgetAck}
                  onChange={(e) => setBudgetAck(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-brand-green-deep"
                />
                <span>{t('qualify.budgetAck')}</span>
              </label>

              {blocker && (
                <div role="alert" className="border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {blocker === 'overCapacity'
                      ? t('qualify.overCapacity', { max: VIEWING_CONFIG.maxGuests })
                      : t('qualify.dateBooked')}
                  </p>
                  {talkInstead}
                </div>
              )}

              <div className="flex justify-end mt-2">
                <ModernButton type="submit" size="large" disabled={checking}>
                  {checking ? t('qualify.checking') : t('modal.continue')}
                </ModernButton>
              </div>
            </form>
          )}

          {step === 'slots' && (
            <div>
              <h3 className="font-display text-2xl text-stone-900">{t('slots.heading')}</h3>
              <p className="mt-1 text-xs text-stone-500">
                {t('slots.timezone', { minutes: VIEWING_CONFIG.slotMinutes })}
              </p>

              {slotsState === 'loading' && (
                <p className="mt-6 text-sm text-stone-500">{t('slots.loading')}</p>
              )}

              {(slotsState === 'unavailable' || (slotsState === 'ready' && days.length === 0)) && (
                <div className="mt-6 border border-stone-200 bg-stone-50 p-4">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {slotsState === 'unavailable' ? t('slots.unavailable') : t('slots.none')}
                  </p>
                  {talkInstead}
                </div>
              )}

              {slotsState === 'ready' && days.length > 0 && (
                <>
                  <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                    {days.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        aria-pressed={day.date === activeDate}
                        onClick={() => {
                          setActiveDate(day.date);
                          setSlot('');
                        }}
                        className={`shrink-0 border px-3 py-2 text-sm capitalize transition-colors ${
                          day.date === activeDate
                            ? 'border-brand-green-deep bg-brand-green-deep text-white'
                            : 'border-stone-200 text-stone-700 hover:border-brand-gold'
                        }`}
                      >
                        {formatDay(day.date)}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {activeDay?.slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={s === slot}
                        onClick={() => setSlot(s)}
                        className={`border px-2 py-2.5 text-sm transition-colors ${
                          s === slot
                            ? 'border-brand-gold bg-brand-gold text-brand-dark'
                            : 'border-stone-200 text-stone-700 hover:border-brand-gold'
                        }`}
                      >
                        {formatTime(s)}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="flex justify-between items-center mt-6">
                <ModernButton buttonVariant="ghost" onClick={() => setStep('qualify')}>
                  {t('modal.back')}
                </ModernButton>
                <ModernButton
                  size="large"
                  disabled={!slot}
                  onClick={() => {
                    setError('');
                    setStep('details');
                  }}
                >
                  {t('modal.continue')}
                </ModernButton>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={submitBooking} className="flex flex-col gap-4">
              <div>
                <h3 className="font-display text-2xl text-stone-900">{t('details.heading')}</h3>
                <p className="mt-1 text-sm text-brand-green-ink">
                  {t('details.summary', { when: formatWhen(slot) })}
                </p>
              </div>
              {/* Honeypot — hidden from real users, bots that fill it are dropped server-side */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              />
              <div>
                <label htmlFor="viewing-name" className={labelClass}>
                  {t('details.name')}
                </label>
                <input
                  id="viewing-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="viewing-email" className={labelClass}>
                    {t('details.email')}
                  </label>
                  <input
                    id="viewing-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="viewing-phone" className={labelClass}>
                    {t('details.phone')}
                  </label>
                  <input
                    id="viewing-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <ModernButton buttonVariant="ghost" onClick={() => setStep('slots')}>
                  {t('modal.back')}
                </ModernButton>
                <ModernButton type="submit" size="large" disabled={submitting}>
                  {submitting ? t('details.booking') : t('details.confirm')}
                </ModernButton>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-start gap-4">
              <CheckCircleOutline className="text-brand-green" fontSize="large" />
              <p className="text-stone-700 leading-relaxed">
                {t('success.body', { when: formatWhen(slot), email })}
              </p>
              <p className="text-sm text-stone-500">{t('success.address', { address })}</p>
              <div className="self-end">
                <ModernButton size="large" onClick={handleCloseViewing}>
                  {t('success.done')}
                </ModernButton>
              </div>
            </div>
          )}

          {step !== 'success' && (
            <p className="mt-8 pt-5 border-t border-stone-200 text-sm text-stone-500 leading-relaxed">
              {t('fallback.prefer')}{' '}
              <a
                href={telHref}
                onClick={() => trackEvent('viewing_call_click')}
                className="text-brand-green-ink hover:text-brand-green-deep underline underline-offset-4 decoration-brand-gold"
              >
                {AppConfig.telephone}
              </a>{' '}
              {t('fallback.or')}{' '}
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('viewing_whatsapp_click')}
                className="text-brand-green-ink hover:text-brand-green-deep underline underline-offset-4 decoration-brand-gold"
              >
                {t('fallback.whatsapp')}
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
