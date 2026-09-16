import type { PublicEvent } from '../server/publicEvents';

export const VENUE_TIMEZONE = 'America/New_York';

export const UPCOMING_EVENTS_MONTHS = 12;
export const HOME_UPCOMING_EVENTS_LIMIT = 3;
export const EVENTS_REVALIDATE_SECONDS = 600;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A public event with its dates already formatted for one locale. Formatting
 * happens in getStaticProps so the browser never re-runs Intl and risks a
 * hydration mismatch from ICU differences (thin vs. regular spaces).
 */
export type DisplayEvent = PublicEvent & {
  when: string;
  badgeMonth: string;
  badgeDay: string;
};

const plainSpaces = (s: string) => s.replace(/[\u2009\u202f]/g, ' ');

const allDayBounds = (event: PublicEvent) => {
  const start = new Date(`${event.start}T00:00:00Z`);
  const lastDay = new Date(new Date(`${event.end}T00:00:00Z`).getTime() - DAY_MS);
  return { start, end: lastDay < start ? start : lastDay };
};

/** Full human-readable date (and time) of an event, e.g. "Saturday, October 10 – Sunday, October 11, 2026". */
export const formatEventWhen = (event: PublicEvent, locale: string): string => {
  if (event.allDay) {
    const { start, end } = allDayBounds(event);
    const fmt = new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return plainSpaces(fmt.formatRange(start, end));
  }
  const fmt = new Intl.DateTimeFormat(locale, {
    timeZone: VENUE_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  return plainSpaces(fmt.formatRange(new Date(event.start), new Date(event.end)));
};

/** Short month + day for the date badge, e.g. { month: "Oct", day: "10" }. */
export const formatEventBadge = (event: PublicEvent, locale: string) => {
  const date = event.allDay ? allDayBounds(event).start : new Date(event.start);
  const timeZone = event.allDay ? 'UTC' : VENUE_TIMEZONE;
  return {
    month: new Intl.DateTimeFormat(locale, { timeZone, month: 'short' }).format(date),
    day: new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric' }).format(date),
  };
};

export const toDisplayEvent = (event: PublicEvent, locale: string): DisplayEvent => {
  const badge = formatEventBadge(event, locale);
  return {
    ...event,
    when: formatEventWhen(event, locale),
    badgeMonth: badge.month,
    badgeDay: badge.day,
  };
};

export const eventsPagePath = '/events';
export const eventAnchorHref = (event: PublicEvent) => `${eventsPagePath}/#${event.id}`;
