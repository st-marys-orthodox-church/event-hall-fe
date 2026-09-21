import type { NextApiRequest, NextApiResponse } from 'next';
import { isBookingsCalendarConfigured, loadBookedDates } from '../../server/bookedDates';
import { isValidIsoDate } from '../../server/ics';
import {
  type PublicEvent,
  isPublicEventsConfigured,
  loadPublicEvents,
} from '../../server/publicEvents';

export type AvailabilityResponse = {
  /** Days with a private booking, YYYY-MM-DD. */
  dates: string[];
  /** Public church events touching the range; may be empty when the feed is not configured. */
  events: PublicEvent[];
  /** Whether PUBLIC_EVENTS_ICS_URL is set on this deployment, so an empty list can be diagnosed. */
  eventsConfigured: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to } = req.query;

  if (!isValidIsoDate(from) || !isValidIsoDate(to) || from >= to) {
    return res.status(400).json({ error: 'from and to must be YYYY-MM-DD with from < to' });
  }

  if (!isBookingsCalendarConfigured()) {
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
