import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidIsoDate, isoInVenueTz } from '../../../server/ics';
import { clientIp, isRateLimited } from '../../../server/rateLimit';
import { sendViewingEmails } from '../../../server/viewingEmail';
import {
  bookViewingSlot,
  isEventDateBooked,
  isSlotOpen,
  isViewingsConfigured,
} from '../../../server/viewings';
import { VIEWING_CONFIG, type ViewingErrorCode } from '../../../utils/Viewings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+.-]{7,25}$/;
const BOOKINGS_PER_HOUR = 5;

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fail = (status: number, error: ViewingErrorCode) => res.status(status).json({ error });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isViewingsConfigured()) return fail(503, 'not_configured');

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot, same contract as the contact form: pretend it worked.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json({ error: '' });
  }

  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const phone = text(body.phone, 25);
  const eventDate = text(body.eventDate, 10);
  const slot = text(body.slot, 30);
  const locale = text(body.locale, 5);
  const guests = typeof body.guests === 'number' ? Math.floor(body.guests) : Number.NaN;

  if (
    !name ||
    !EMAIL_RE.test(email) ||
    !PHONE_RE.test(phone) ||
    !Number.isFinite(guests) ||
    guests < 1 ||
    body.budgetAck !== true ||
    !isValidIsoDate(eventDate) ||
    eventDate < isoInVenueTz(new Date()) ||
    Number.isNaN(new Date(slot).getTime())
  ) {
    return fail(400, 'invalid');
  }
  if (guests > VIEWING_CONFIG.maxGuests) return fail(422, 'over_capacity');

  if (isRateLimited(`viewing:${clientIp(req)}`, BOOKINGS_PER_HOUR, 60 * 60 * 1000)) {
    return fail(429, 'rate_limited');
  }

  try {
    if (await isEventDateBooked(eventDate)) return fail(422, 'date_booked');
    // Re-derived from the live calendar right before writing, so two visitors can't hold one slot.
    if (!(await isSlotOpen(new Date(slot).toISOString()))) return fail(409, 'slot_taken');

    const { start, end } = await bookViewingSlot(slot, {
      title: `Viewing — ${name} (${guests} guests)`,
      description: [
        'Booked online via events.saintmaryro.org',
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Guests: ${guests}`,
        `Event date: ${eventDate}`,
      ].join('\n'),
    });

    try {
      await sendViewingEmails({ name, email, phone, guests, eventDate, locale, start, end });
    } catch (err) {
      // The calendar entry is the booking; a failed email must not tell the visitor it didn't happen.
      console.error('viewings: booked but failed to send emails', err);
    }

    return res.status(200).json({ error: '', start: start.toISOString() });
  } catch (err) {
    console.error('viewings: failed to book', err);
    return fail(502, 'failed');
  }
}

export default handler;
