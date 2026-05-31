import ical, { type VEvent } from 'node-ical';
import type { ChurchCalendarEvent, ChurchCalendarSourceKey } from '../utils/churchCalendarShared';

const CALENDAR_TZ = 'America/New_York';
const FETCH_WINDOW_DAYS = 365;

type CalendarSource = {
  key: ChurchCalendarSourceKey;
  url: string | undefined;
};

const CALENDAR_SOURCES: CalendarSource[] = [
  { key: 'programLiturgic', url: process.env.PROGRAM_LITURGIC_ICAL_URL },
  { key: 'saintMaryEvents', url: process.env.SAINT_MARY_EVENTS_ICAL_URL },
  { key: 'calendarulOrthodox', url: process.env.CALENDARUL_ORTHODOX_ICAL_URL },
];

const isoDateParts = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: CALENDAR_TZ,
    year: 'numeric',
  }).formatToParts(date);

const _isoDateInCalendarTz = (date: Date) => {
  const parts = isoDateParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
};

const _isoDateFromAllDay = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate()
  ).padStart(2, '0')}`;

const normalizeDescription = (value: string | undefined) =>
  (value ?? '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();

const normalizeLocation = (value: string | undefined) => (value ?? '').trim();

const readTextValue = (
  value:
    | string
    | {
        params?: Record<string, string>;
        val: string;
      }
    | undefined
) => {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'val' in value) {
    return value.val;
  }

  return '';
};

const rangeStartDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const rangeEndDate = (start: Date) => {
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + FETCH_WINDOW_DAYS);
  return end;
};

const serializeEvent = ({
  allDay,
  description,
  end,
  id,
  location,
  sourceKey,
  start,
  title,
}: {
  allDay: boolean;
  description: string;
  end: Date;
  id: string;
  location: string;
  sourceKey: ChurchCalendarSourceKey;
  start: Date;
  title: string;
}): ChurchCalendarEvent => ({
  allDay,
  description,
  endIso: end.toISOString(),
  id,
  location,
  sourceKey,
  startIso: start.toISOString(),
  title,
});

const parseEventsFromSource = async (
  source: CalendarSource,
  rangeStart: Date,
  rangeEnd: Date
): Promise<ChurchCalendarEvent[]> => {
  if (!source.url) {
    return [];
  }

  const data = await ical.async.fromURL(source.url);
  const events: ChurchCalendarEvent[] = [];

  for (const [entryKey, entryValue] of Object.entries(data)) {
    if (!entryValue || entryValue.type !== 'VEVENT') {
      continue;
    }

    const vevent = entryValue as VEvent;
    const allDay = (vevent as unknown as { datetype?: string }).datetype === 'date';
    const baseStart = vevent.start as Date;
    const baseEnd = (vevent.end as Date | undefined) ?? baseStart;
    const durationMs = Math.max(baseEnd.getTime() - baseStart.getTime(), 0);
    const title = readTextValue(vevent.summary).trim();

    if (!title) {
      continue;
    }

    const description = normalizeDescription(readTextValue(vevent.description));
    const location = normalizeLocation(readTextValue(vevent.location));

    if (vevent.rrule) {
      const exdates = new Set<number>();

      if (vevent.exdate) {
        for (const exdate of Object.values(vevent.exdate as Record<string, Date>)) {
          if (exdate instanceof Date) {
            exdates.add(exdate.getTime());
          }
        }
      }

      const occurrences = vevent.rrule.between(rangeStart, rangeEnd, true);
      for (const occurrenceStart of occurrences) {
        if (exdates.has(occurrenceStart.getTime())) {
          continue;
        }

        const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
        events.push(
          serializeEvent({
            allDay,
            description,
            end: occurrenceEnd,
            id: `${source.key}-${entryKey}-${occurrenceStart.toISOString()}`,
            location,
            sourceKey: source.key,
            start: occurrenceStart,
            title,
          })
        );
      }

      continue;
    }

    if (baseEnd < rangeStart || baseStart > rangeEnd) {
      continue;
    }

    events.push(
      serializeEvent({
        allDay,
        description,
        end: baseEnd,
        id: `${source.key}-${entryKey}-${baseStart.toISOString()}`,
        location,
        sourceKey: source.key,
        start: baseStart,
        title,
      })
    );
  }

  return events;
};

export const getChurchCalendarEvents = async () => {
  const start = rangeStartDate();
  const end = rangeEndDate(start);
  const sourceUrls = CALENDAR_SOURCES.filter((source) => source.url);

  if (sourceUrls.length === 0) {
    return {
      events: [] as ChurchCalendarEvent[],
      unavailable: true,
    };
  }

  const results = await Promise.all(
    sourceUrls.map((source) => parseEventsFromSource(source, start, end))
  );
  const events = results
    .flat()
    .sort(
      (left, right) =>
        left.startIso.localeCompare(right.startIso) || left.title.localeCompare(right.title)
    );

  return {
    events,
    unavailable: false,
  };
};
