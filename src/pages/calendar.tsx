import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Link from 'next/link';
import { useState } from 'react';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import {
  type ChurchCalendarEvent,
  type ChurchCalendarSourceKey,
  getChurchCalendarEventDayKey,
} from '../utils/churchCalendarShared';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

type CalendarPageProps = {
  events: ChurchCalendarEvent[];
  unavailable: boolean;
};

const SOURCE_STYLES: Record<ChurchCalendarSourceKey, string> = {
  calendarulOrthodox: 'bg-rose-500',
  programLiturgic: 'bg-stone-500',
  saintMaryEvents: 'bg-sky-500',
};

const sourceBorderStyles: Record<ChurchCalendarSourceKey, string> = {
  calendarulOrthodox: 'border-rose-200 bg-rose-50',
  programLiturgic: 'border-stone-200 bg-white',
  saintMaryEvents: 'border-sky-200 bg-sky-50',
};

const formatMonthTitle = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'America/New_York',
    year: 'numeric',
  }).format(date);

const formatShortWeekdays = (locale: string) => {
  const baseSunday = new Date(Date.UTC(2026, 0, 4));
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      timeZone: 'America/New_York',
    }).format(new Date(baseSunday.getTime() + index * 24 * 60 * 60 * 1000))
  );
};

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const parseMonthKey = (monthKey: string) => {
  const [yearPart, monthPart] = monthKey.split('-');
  return new Date(Number(yearPart), Number(monthPart) - 1, 1);
};

const formatDayKeyLabel = (dayKey: string, locale: string) => {
  const [yearPart, monthPart, dayPart] = dayKey.split('-');
  const date = new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart));
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/New_York',
    weekday: 'long',
    year: 'numeric',
  }).format(date);
};

const formatEventTime = (event: ChurchCalendarEvent, locale: string) => {
  if (event.allDay) {
    return 'allDay';
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });

  return `${formatter.format(new Date(event.startIso))} - ${formatter.format(new Date(event.endIso))}`;
};

const CalendarPage = ({ events, unavailable }: CalendarPageProps) => {
  const { t, i18n } = useTranslation(['churchCalendar', 'common']);
  const locale = i18n.language;
  const eventsByDay = events.reduce<Record<string, ChurchCalendarEvent[]>>((bucket, event) => {
    const dayKey = getChurchCalendarEventDayKey(event);
    bucket[dayKey] = bucket[dayKey] ? [...bucket[dayKey], event] : [event];
    return bucket;
  }, {});
  const dayKeys = Object.keys(eventsByDay).sort();
  const monthKeys = Array.from(new Set(dayKeys.map((dayKey) => dayKey.slice(0, 7))));
  const defaultMonthKey = monthKeys[0] ?? toMonthKey(new Date());
  const [activeMonthKey, setActiveMonthKey] = useState(defaultMonthKey);
  const [selectedDayKey, setSelectedDayKey] = useState(dayKeys[0] ?? null);
  const activeMonthIndex = Math.max(monthKeys.indexOf(activeMonthKey), 0);
  const activeMonthDate = parseMonthKey(activeMonthKey);
  const weekdayLabels = formatShortWeekdays(locale);
  const selectedEvents = selectedDayKey ? (eventsByDay[selectedDayKey] ?? []) : [];
  const todayDayKey = toDayKey(new Date());

  const activeMonthDays = (() => {
    const firstDay = new Date(activeMonthDate.getFullYear(), activeMonthDate.getMonth(), 1);
    const offset = firstDay.getDay();
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - offset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dayKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-');

      return {
        dayKey,
        events: eventsByDay[dayKey] ?? [],
        inActiveMonth: date.getMonth() === activeMonthDate.getMonth(),
        isToday: dayKey === todayDayKey,
        label: date.getDate(),
      };
    });
  })();

  const goToMonth = (direction: -1 | 1) => {
    const nextIndex = activeMonthIndex + direction;
    if (nextIndex < 0 || nextIndex >= monthKeys.length) {
      return;
    }

    const nextMonthKey = monthKeys[nextIndex] ?? activeMonthKey;
    setActiveMonthKey(nextMonthKey);
    const nextSelectedDay = dayKeys.find((dayKey) => dayKey.startsWith(nextMonthKey));
    if (nextSelectedDay) {
      setSelectedDayKey(nextSelectedDay);
    }
  };

  const sourceEntries = (
    t('sources', { returnObjects: true }) as Array<{ key: ChurchCalendarSourceKey; label: string }>
  ).filter((source) => SOURCE_STYLES[source.key]);

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={t('seoTitle')} description={t('seoDescription')} />

      <Template topPad>
        <section className="relative overflow-hidden py-20 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,108,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(124,152,133,0.08),_transparent_24%)]" />

          <div className="relative mx-auto max-w-7xl px-4">
            <div className="max-w-3xl">
              <span className="eyebrow text-brand-gold">{t('eyebrow')}</span>
              <h1 className="mt-4 text-4xl text-stone-900 md:text-6xl">{t('title')}</h1>
              <div className="mt-5 h-px w-16 bg-brand-gold" />
              <p className="mt-8 max-w-2xl text-lg leading-8 text-stone-600">{t('intro')}</p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {sourceEntries.map((source) => (
                <div
                  key={source.key}
                  className="inline-flex items-center gap-3 rounded-sm border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${SOURCE_STYLES[source.key]}`} />
                  <span>{source.label}</span>
                </div>
              ))}
            </div>

            {unavailable ? (
              <div className="mt-12 rounded-sm border border-amber-200 bg-amber-50 px-6 py-5 text-amber-950">
                <p className="font-medium">{t('unavailableTitle')}</p>
                <p className="mt-2 leading-7">{t('unavailableBody')}</p>
              </div>
            ) : null}

            {!unavailable && events.length > 0 ? (
              <div className="mt-14 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-[0_28px_70px_-46px_rgba(28,25,23,0.35)] md:p-8">
                  <div className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="eyebrow text-brand-green">{t('monthViewEyebrow')}</span>
                      <h2 className="mt-3 text-3xl text-stone-900">
                        {formatMonthTitle(activeMonthDate, locale)}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => goToMonth(-1)}
                        disabled={activeMonthIndex === 0}
                        className="rounded-sm border border-stone-300 p-2 text-stone-700 transition-colors hover:border-brand-green hover:text-brand-green disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t('common:calendar.previousMonth')}
                      >
                        <ChevronLeftRoundedIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => goToMonth(1)}
                        disabled={activeMonthIndex === monthKeys.length - 1}
                        className="rounded-sm border border-stone-300 p-2 text-stone-700 transition-colors hover:border-brand-green hover:text-brand-green disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={t('common:calendar.nextMonth')}
                      >
                        <ChevronRightRoundedIcon />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
                    {weekdayLabels.map((weekday) => (
                      <div key={weekday} className="py-2">
                        {weekday}
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-2">
                    {activeMonthDays.map((day) => {
                      const isSelected = selectedDayKey === day.dayKey;
                      return (
                        <button
                          key={day.dayKey}
                          type="button"
                          onClick={() => setSelectedDayKey(day.dayKey)}
                          className={`min-h-[92px] rounded-sm border px-2 py-2 text-left transition-colors ${
                            isSelected
                              ? 'border-brand-gold bg-amber-50'
                              : 'border-stone-200 bg-white hover:border-brand-green'
                          } ${day.inActiveMonth ? 'text-stone-900' : 'text-stone-400'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${day.isToday ? 'text-brand-green' : ''}`}
                            >
                              {day.label}
                            </span>
                            {day.events.length > 0 ? (
                              <span className="text-[0.7rem] text-stone-500">
                                {day.events.length}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {day.events.slice(0, 4).map((event) => (
                              <span
                                key={event.id}
                                className={`h-2 w-2 rounded-full ${SOURCE_STYLES[event.sourceKey]}`}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <aside className="flex flex-col gap-6">
                  <div className="rounded-sm border border-brand-gold/60 bg-gradient-to-b from-amber-50 via-white to-white p-6 shadow-[0_28px_70px_-46px_rgba(28,25,23,0.35)]">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.22em] text-brand-gold">
                      <TodayRoundedIcon sx={{ fontSize: 18 }} />
                      <span>{selectedDayKey ? t('selectedDay') : t('upcoming')}</span>
                    </div>
                    <h2 className="mt-4 text-3xl text-stone-900">
                      {selectedDayKey
                        ? formatDayKeyLabel(selectedDayKey, locale)
                        : t('noSelection')}
                    </h2>

                    <div className="mt-6 space-y-4">
                      {selectedEvents.length > 0 ? (
                        selectedEvents.map((event) => {
                          const sourceLabel =
                            sourceEntries.find((source) => source.key === event.sourceKey)?.label ??
                            event.sourceKey;
                          const timeLabel = formatEventTime(event, locale);
                          return (
                            <article
                              key={event.id}
                              className={`rounded-sm border px-4 py-4 ${sourceBorderStyles[event.sourceKey]}`}
                            >
                              <div className="text-sm font-medium text-stone-700">
                                {timeLabel === 'allDay' ? t('allDay') : timeLabel}
                              </div>
                              <h3 className="mt-2 text-2xl text-stone-900">{event.title}</h3>
                              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-500">
                                {sourceLabel}
                              </p>
                              {event.description ? (
                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-stone-600">
                                  {event.description}
                                </p>
                              ) : null}
                              {event.location ? (
                                <p className="mt-3 text-sm text-stone-500">{event.location}</p>
                              ) : null}
                            </article>
                          );
                        })
                      ) : (
                        <div className="rounded-sm border border-dashed border-stone-300 bg-white px-4 py-6 text-stone-600">
                          {t('emptyDay')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-sm border border-stone-200 bg-white p-6 shadow-[0_28px_70px_-46px_rgba(28,25,23,0.35)]">
                    <span className="eyebrow text-brand-green">{t('donateEyebrow')}</span>
                    <h2 className="mt-3 text-3xl text-stone-900">{t('donateTitle')}</h2>
                    <p className="mt-4 leading-7 text-stone-600">{t('donateBody')}</p>
                    <div className="mt-6">
                      <ModernButton
                        component={Link}
                        href="/donate"
                        buttonVariant="primary"
                        size="large"
                      >
                        {t('donateCta')}
                      </ModernButton>
                    </div>
                  </div>
                </aside>
              </div>
            ) : null}

            {!unavailable && events.length === 0 ? (
              <div className="mt-12 rounded-sm border border-stone-200 bg-white px-6 py-8 text-stone-700 shadow-[0_28px_70px_-46px_rgba(28,25,23,0.35)]">
                <p className="font-medium">{t('emptyCalendarTitle')}</p>
                <p className="mt-2 leading-7">{t('emptyCalendarBody')}</p>
              </div>
            ) : null}
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<CalendarPageProps> = async ({ locale }) => {
  const { getChurchCalendarEvents } = await import('../server/churchCalendar');
  const { events, unavailable } = await getChurchCalendarEvents();

  return {
    props: {
      ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
        'common',
        'churchCalendar',
      ])),
      events,
      unavailable,
    },
  };
};

export default CalendarPage;
