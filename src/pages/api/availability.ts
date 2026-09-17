import type { NextApiRequest, NextApiResponse } from 'next';
import {
  collectDates,
  isAllDay,
  isValidIsoDate,
  loadCalendar,
  occurrencesInRange,
  veventsOf,
} from '../../server/ics';
import {
  type PublicEvent,
  isPublicEventsConfigured,
  loadPublicEvents,
} from '../../server/publicEvents';

const ICS_URL = process.env.CALENDAR_ICS_URL;

export type AvailabilityResponse = {
  /** Days with a private booking, YYYY-MM-DD. */
  dates: string[];
  /** Public church events touching the range; may be empty when the feed is not configured. */
  events: PublicEvent[];
  /** Whether PUBLIC_EVENTS_ICS_URL is set on this deployment, so an empty list can be diagnosed. */
  eventsConfigured: boolean;
};

const loadBookedDates = async (from: string, to: string): Promise<string[]> => {
  if (!ICS_URL) throw new Error('CALENDAR_ICS_URL is not set');
  const data = await loadCalendar(ICS_URL);
  const rangeStart = new Date(`${from}T00:00:00Z`);
  const rangeEnd = new Date(`${to}T00:00:00Z`);
  const dates = new Set<string>();

  for (const vevent of veventsOf(data)) {
    const allDay = isAllDay(vevent);
    for (const occ of occurrencesInRange(vevent, rangeStart, rangeEnd)) {
      collectDates(occ.start, occ.end, allDay, dates);
    }
  }

  return Array.from(dates)
    .filter((d) => d >= from && d < to)
    .sort();
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query;

  if (!isValidIsoDate(from) || !isValidIsoDate(to) || from >= to) {
    return res.status(400).json({ error: 'from and to must be YYYY-MM-DD with from < to' });
  }

  if (!ICS_URL) {
    return res.status(500).json({ error: 'Calendar not configured' });
  }

  try {
    const [dates, events] = await Promise.all([
      loadBookedDates(from, to),
      loadPublicEvents(from, to).catch((err) => {
        console.error('availability: failed to fetch public events', err);
        return [] as PublicEvent[];
      }),
    ]);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    const body: AvailabilityResponse = {
      dates,
      events,
      eventsConfigured: isPublicEventsConfigured(),
    };
    return res.status(200).json(body);
  } catch (err) {
    console.error('availability: failed to fetch calendar', err);
    return res.status(502).json({ error: 'Failed to fetch calendar' });
  }
}

export default handler;
