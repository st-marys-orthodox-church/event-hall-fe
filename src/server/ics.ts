import ical, { type CalendarResponse, type VEvent } from 'node-ical';

import { VENUE_TIMEZONE } from '../utils/Events';

export const VENUE_TZ = VENUE_TIMEZONE;

const pad = (n: number) => String(n).padStart(2, '0');

export const isoInVenueTz = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: VENUE_TZ }).format(d);

export const isoFromAllDay = (d: Date): string =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

export const addDays = (iso: string, n: number): string => {
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const next = new Date(Date.UTC(y, m - 1, d + n));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

export const collectDates = (start: Date, end: Date, allDay: boolean, bucket: Set<string>) => {
  const startIso = allDay ? isoFromAllDay(start) : isoInVenueTz(start);
  const endIso = allDay ? isoFromAllDay(end) : isoInVenueTz(end);
  let cursor = startIso;
  while (allDay ? cursor < endIso : cursor <= endIso) {
    bucket.add(cursor);
    cursor = addDays(cursor, 1);
    if (cursor > '9999-12-31') break;
  }
};

export const isValidIsoDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const isAllDay = (vevent: VEvent): boolean =>
  (vevent as unknown as { datetype?: string }).datetype === 'date';

export const paramValue = (v: unknown): string => {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object' && 'val' in v) return String((v as { val: unknown }).val ?? '');
  return '';
};

export type Occurrence = { start: Date; end: Date };

/**
 * Expands a VEVENT (single or recurring, honouring EXDATE) into the occurrences
 * that overlap [rangeStart, rangeEnd).
 */
export const occurrencesInRange = (
  vevent: VEvent,
  rangeStart: Date,
  rangeEnd: Date
): Occurrence[] => {
  const baseStart = vevent.start as Date;
  const baseEnd = (vevent.end as Date) ?? baseStart;
  const durationMs = baseEnd.getTime() - baseStart.getTime();

  if (!vevent.rrule) {
    if (baseEnd < rangeStart || baseStart > rangeEnd) return [];
    return [{ start: baseStart, end: baseEnd }];
  }

  const exSet = new Set<number>();
  if (vevent.exdate) {
    for (const k of Object.keys(vevent.exdate)) {
      const exd = (vevent.exdate as Record<string, Date>)[k];
      if (exd instanceof Date) exSet.add(exd.getTime());
    }
  }
  return vevent.rrule
    .between(rangeStart, rangeEnd, true)
    .filter((occStart) => !exSet.has(occStart.getTime()))
    .map((occStart) => ({ start: occStart, end: new Date(occStart.getTime() + durationMs) }));
};

/** Fetches an ICS feed. Accepts file:// URLs so a local fixture can stand in for a live calendar. */
export const loadCalendar = async (url: string): Promise<CalendarResponse> => {
  if (url.startsWith('file://')) {
    return ical.async.parseFile(decodeURIComponent(new URL(url).pathname));
  }
  return ical.async.fromURL(url);
};

export const veventsOf = (data: CalendarResponse): VEvent[] =>
  Object.keys(data)
    .map((key) => data[key])
    .filter((ev): ev is VEvent => Boolean(ev) && ev?.type === 'VEVENT');
