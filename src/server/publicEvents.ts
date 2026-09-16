import {
  VENUE_TZ,
  addDays,
  collectDates,
  isAllDay,
  isoFromAllDay,
  isoInVenueTz,
  loadCalendar,
  occurrencesInRange,
  paramValue,
  veventsOf,
} from './ics';

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  url: string;
  allDay: boolean;
  /** ISO 8601. Date-only for all-day events, otherwise a venue-local datetime with offset. */
  start: string;
  /** Exclusive end, same format as `start`. */
  end: string;
  /** Every venue-local calendar day the event touches, YYYY-MM-DD. */
  dates: string[];
};

const PUBLIC_EVENTS_ICS_URL = process.env.PUBLIC_EVENTS_ICS_URL;

export const isPublicEventsConfigured = () => Boolean(PUBLIC_EVENTS_ICS_URL);

const venueLocalIso = (d: Date): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VENUE_TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'longOffset',
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const offset = get('timeZoneName').replace('GMT', '') || 'Z';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}${offset}`;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

const parseRange = (from: string, to: string) => ({
  rangeStart: new Date(`${from}T00:00:00Z`),
  rangeEnd: new Date(`${to}T00:00:00Z`),
});

/**
 * Reads the church's public events calendar and returns every occurrence that
 * touches [from, to). Returns [] when the feed is not configured.
 */
export const loadPublicEvents = async (from: string, to: string): Promise<PublicEvent[]> => {
  if (!PUBLIC_EVENTS_ICS_URL) return [];

  const data = await loadCalendar(PUBLIC_EVENTS_ICS_URL);
  const { rangeStart, rangeEnd } = parseRange(from, to);
  const events: PublicEvent[] = [];

  for (const vevent of veventsOf(data)) {
    const title = paramValue(vevent.summary).trim();
    if (!title) continue;
    const allDay = isAllDay(vevent);
    const description = paramValue(vevent.description).trim();
    const location = paramValue(vevent.location).trim();
    const url = typeof vevent.url === 'string' ? vevent.url : '';

    for (const occ of occurrencesInRange(vevent, rangeStart, rangeEnd)) {
      const dates = new Set<string>();
      collectDates(occ.start, occ.end, allDay, dates);
      const sortedDates = Array.from(dates).sort();
      const firstDay = sortedDates[0];
      if (!firstDay || firstDay >= to || (sortedDates.at(-1) ?? '') < from) continue;

      events.push({
        id: `${slug(title)}-${firstDay}`,
        title,
        description,
        location,
        url,
        allDay,
        start: allDay ? isoFromAllDay(occ.start) : venueLocalIso(occ.start),
        end: allDay ? isoFromAllDay(occ.end) : venueLocalIso(occ.end),
        dates: sortedDates,
      });
    }
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
};

/** Upcoming events from today (venue time) for the next `months` months. */
export const loadUpcomingPublicEvents = async (months = 12, limit?: number) => {
  const today = isoInVenueTz(new Date());
  const to = addDays(today, Math.round(months * 30.5));
  try {
    const events = (await loadPublicEvents(today, to)).filter(
      (ev) => (ev.dates.at(-1) ?? '') >= today
    );
    return limit ? events.slice(0, limit) : events;
  } catch (err) {
    console.error('publicEvents: failed to fetch calendar', err);
    return [];
  }
};
