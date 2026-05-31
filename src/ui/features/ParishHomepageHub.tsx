import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import Link from 'next/link';
import type {
  ChurchCalendarEvent,
  ChurchCalendarSourceKey,
} from '../../utils/churchCalendarShared';

type EventTone = 'blue' | 'gold' | 'red' | 'stone';

type ScheduleEvent = {
  event: ChurchCalendarEvent;
};

type ScheduleDay = {
  dayKey: string;
  events: ChurchCalendarEvent[];
};

type PostPreview = {
  date: string;
  excerpt: string;
  title: string;
};

const POST_IMAGES = [
  'https://lh3.googleusercontent.com/pw/AP1GczMaaELi5AY5fUb_FgfahChiz7f9H-8wGPivBg--ptekXNPuvTapBty7OGWRmgVJLrdHpc6uD8txRw0W39-dIqwcsq_e-sJGF3J12QO0sxHHyYGa01GYFOuTW8SdVSFhxA-mBuGVg1L5XzUh6Wa2ovrY=w1174-h1566-s-no-gm',
  'https://lh3.googleusercontent.com/pw/AP1GczO34FyZhnsSN01qdBOm3O9YRPnmbIlHpQe9VJ3E5hxylE6URXBQ1izSqI93fhIgJLFVe0j3GNPjQ3-N2ASTknoDoALBQQK4yzKvKZPMqNW0GBiY9fW9Wfo8nfJ7OTY63kAaB4UERYScUNEy4z7nxr5k=w1174-h1566-s-no-gm',
] as const;

const toneClasses: Record<EventTone, string> = {
  blue: 'border-sky-500/80 bg-sky-50 text-sky-950',
  gold: 'border-brand-gold/80 bg-amber-50 text-amber-950',
  red: 'border-rose-400/80 bg-rose-50 text-rose-950',
  stone: 'border-stone-300 bg-white text-stone-900',
};

const toneBySource: Record<ChurchCalendarSourceKey, EventTone> = {
  calendarulOrthodox: 'red',
  programLiturgic: 'stone',
  saintMaryEvents: 'blue',
};

const formatEventTime = (
  event: ChurchCalendarEvent,
  locale: string,
  t: (key: string) => string
) => {
  if (event.allDay) {
    return t('homepageHub.schedule.allDay');
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
  });

  return `${formatter.format(new Date(event.startIso))} - ${formatter.format(new Date(event.endIso))}`;
};

const formatDayParts = (dayKey: string, locale: string) => {
  const [yearPart, monthPart, dayPart] = dayKey.split('-');
  const date = new Date(Number(yearPart), Number(monthPart) - 1, Number(dayPart));
  const month = new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'America/New_York',
  }).format(date);

  return {
    dateNumber: dayPart,
    month,
    year: yearPart,
  };
};

const sourceLabelKey: Record<ChurchCalendarSourceKey, string> = {
  calendarulOrthodox: 'homepageHub.schedule.sourceLabels.calendarulOrthodox',
  programLiturgic: 'homepageHub.schedule.sourceLabels.programLiturgic',
  saintMaryEvents: 'homepageHub.schedule.sourceLabels.saintMaryEvents',
};

const ScheduleEventCard = ({
  event,
  locale,
  t,
}: {
  event: ChurchCalendarEvent;
  locale: string;
  t: (key: string) => string;
}) => (
  <article
    className={`rounded-sm border px-4 py-2.5 shadow-[0_16px_40px_-34px_rgba(28,25,23,0.5)] ${toneClasses[toneBySource[event.sourceKey]]}`}
  >
    <div className="flex items-center gap-2 text-sm font-medium">
      <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
      <span>{formatEventTime(event, locale, t)}</span>
    </div>
    <h3 className="mt-2 text-[1.05rem] leading-tight font-display">{event.title}</h3>
    <p className="mt-1.5 text-xs uppercase tracking-[0.24em] text-current/70">
      {t(sourceLabelKey[event.sourceKey])}
    </p>
    {event.description ? (
      <p className="mt-2 text-sm leading-6 text-current/80">{event.description}</p>
    ) : null}
  </article>
);

const ScheduleDayColumn = ({
  day,
  locale,
  t,
}: {
  day: ScheduleDay;
  locale: string;
  t: (key: string) => string;
}) => {
  const parts = formatDayParts(day.dayKey, locale);

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-3 border-b border-stone-200 pb-2">
        <span className="font-display text-2xl leading-none text-stone-900">
          {parts.dateNumber}
        </span>
        <span className="text-sm uppercase tracking-[0.22em] text-stone-500">
          {parts.month} {parts.year}
        </span>
      </div>
      <div className="space-y-2.5">
        {day.events.map((event) => (
          <ScheduleEventCard key={event.id} event={event} locale={locale} t={t} />
        ))}
      </div>
    </div>
  );
};

export const ParishHomepageHub = ({
  calendarUnavailable,
  todayEvents,
  upcomingDays,
}: {
  calendarUnavailable: boolean;
  todayEvents: ChurchCalendarEvent[];
  upcomingDays: ScheduleDay[];
}) => {
  const { t, i18n } = useTranslation('home');
  const locale = i18n.language;
  const postPreviews = t('homepageHub.news.items', {
    returnObjects: true,
  }) as PostPreview[];

  return (
    <section className="relative overflow-hidden bg-stone-50 py-20 md:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(201,168,108,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(124,152,133,0.08),_transparent_28%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-12">
        <div>
          <div className="flex items-end gap-3 border-b border-stone-200 pb-4">
            <h2 className="text-3xl font-semibold uppercase tracking-[0.04em] text-stone-900 md:text-4xl">
              {t('homepageHub.schedule.titlePrefix')}{' '}
              <span className="text-brand-gold">{t('homepageHub.schedule.titleAccent')}</span>
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-[50rem] rounded-sm border border-brand-gold/70 bg-gradient-to-b from-amber-50 via-white to-white p-3 shadow-[0_24px_60px_-42px_rgba(138,115,64,0.5)]">
            <div className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-brand-gold">
              <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
              <span>{t('homepageHub.schedule.todayLabel')}</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <ScheduleEventCard key={event.id} event={event} locale={locale} t={t} />
                ))
              ) : calendarUnavailable ? (
                <div className="rounded-sm border border-dashed border-brand-gold/60 bg-white px-4 py-6 text-center text-stone-600">
                  {t('homepageHub.schedule.calendarUnavailable')}
                </div>
              ) : (
                <div className="rounded-sm border border-dashed border-brand-gold/60 bg-white px-4 py-6 text-center text-stone-600">
                  {t('homepageHub.schedule.todayEmpty')}
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-[50rem] space-y-5">
            {upcomingDays.length > 0 ? (
              upcomingDays.map((day) => (
                <ScheduleDayColumn key={day.dayKey} day={day} locale={locale} t={t} />
              ))
            ) : (
              <div className="rounded-sm border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-stone-600">
                {t('homepageHub.schedule.noUpcoming')}
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/calendar"
              className="inline-flex items-center justify-center rounded-sm border border-stone-300 bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-stone-700 transition-colors duration-300 hover:border-brand-green hover:text-brand-green"
            >
              {t('homepageHub.schedule.viewAll')}
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-end gap-3 border-b border-stone-200 pb-4">
            <h2 className="text-3xl font-semibold uppercase tracking-[0.04em] text-stone-900 md:text-4xl">
              {t('homepageHub.news.titlePrefix')}{' '}
              <span className="text-brand-green">{t('homepageHub.news.titleAccent')}</span>
            </h2>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {postPreviews.map((post, index) => (
              <article
                key={`${post.date}-${post.title}`}
                className="overflow-hidden rounded-sm border border-stone-200 bg-white shadow-[0_22px_48px_-42px_rgba(28,25,23,0.55)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                  <Image
                    src={POST_IMAGES[index % POST_IMAGES.length] ?? POST_IMAGES[0]}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>

                <div className="border-t border-stone-100 px-6 py-4 text-sm text-stone-500">
                  {post.date}
                </div>

                <div className="px-6 pb-7 text-center">
                  <h3 className="text-3xl text-stone-900">{post.title}</h3>
                  <p className="mt-5 line-clamp-4 text-base leading-8 text-stone-600">
                    {post.excerpt}
                  </p>
                  <Link
                    href="/stiri-evenimente"
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium uppercase tracking-[0.18em] text-brand-green transition-colors duration-300 hover:text-brand-gold"
                  >
                    <span>{t('homepageHub.news.readMore')}</span>
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
