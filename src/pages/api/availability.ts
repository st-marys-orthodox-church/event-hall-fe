import type { NextApiRequest, NextApiResponse } from 'next';
import ical, { type VEvent } from 'node-ical';

const VENUE_TZ = 'America/New_York';
const ICS_URL = process.env.CALENDAR_ICS_URL;

const pad = (n: number) => String(n).padStart(2, '0');

const isoInVenueTz = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: VENUE_TZ }).format(d);

const isoFromAllDay = (d: Date): string =>
  `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

const addDays = (iso: string, n: number): string => {
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  const next = new Date(Date.UTC(y, m - 1, d + n));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
};

const collectDates = (start: Date, end: Date, allDay: boolean, bucket: Set<string>) => {
  const startIso = allDay ? isoFromAllDay(start) : isoInVenueTz(start);
  const endIso = allDay ? isoFromAllDay(end) : isoInVenueTz(end);
  let cursor = startIso;
  while (allDay ? cursor < endIso : cursor <= endIso) {
    bucket.add(cursor);
    cursor = addDays(cursor, 1);
    if (cursor > '9999-12-31') break;
  }
};

const isValidIsoDate = (s: unknown): s is string =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query;

  if (!isValidIsoDate(from) || !isValidIsoDate(to) || from >= to) {
    return res.status(400).json({ error: 'from and to must be YYYY-MM-DD with from < to' });
  }

  if (!ICS_URL) {
    return res.status(500).json({ error: 'Calendar not configured' });
  }

  try {
    const data = await ical.async.fromURL(ICS_URL);
    const rangeStart = new Date(`${from}T00:00:00Z`);
    const rangeEnd = new Date(`${to}T00:00:00Z`);
    const dates = new Set<string>();

    for (const key of Object.keys(data)) {
      const ev = data[key];
      if (!ev || ev.type !== 'VEVENT') continue;
      const vevent = ev as VEvent;
      const allDay = (vevent as unknown as { datetype?: string }).datetype === 'date';
      const baseStart = vevent.start as Date;
      const baseEnd = (vevent.end as Date) ?? baseStart;
      const durationMs = baseEnd.getTime() - baseStart.getTime();

      if (vevent.rrule) {
        const exSet = new Set<number>();
        if (vevent.exdate) {
          for (const k of Object.keys(vevent.exdate)) {
            const exd = (vevent.exdate as Record<string, Date>)[k];
            if (exd instanceof Date) exSet.add(exd.getTime());
          }
        }
        const occurrences = vevent.rrule.between(rangeStart, rangeEnd, true);
        for (const occStart of occurrences) {
          if (exSet.has(occStart.getTime())) continue;
          const occEnd = new Date(occStart.getTime() + durationMs);
          collectDates(occStart, occEnd, allDay, dates);
        }
      } else {
        if (baseEnd < rangeStart || baseStart > rangeEnd) continue;
        collectDates(baseStart, baseEnd, allDay, dates);
      }
    }

    const filtered = Array.from(dates)
      .filter((d) => d >= from && d < to)
      .sort();

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json({ dates: filtered });
  } catch (err) {
    console.error('availability: failed to fetch calendar', err);
    return res.status(502).json({ error: 'Failed to fetch calendar' });
  }
}

export default handler;
