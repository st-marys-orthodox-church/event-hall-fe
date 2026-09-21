import { VIEWING_CONFIG, type ViewingErrorCode } from '../utils/Viewings';
import { isValidIsoDate, isoInVenueTz } from './ics';
import { isRateLimited } from './rateLimit';
import { sendViewingEmails } from './viewingEmail';
import { bookViewingSlot, isEventDateBooked, isSlotOpen, isViewingsConfigured } from './viewings';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+.-]{7,25}$/;
// One bucket per IP, shared by the form and the chat agent.
const BOOKINGS_PER_HOUR = 5;
const LOCALES = ['en', 'es', 'ro'];

export type ViewingBookingResult =
  | { ok: true; start: Date; end: Date }
  | { ok: false; status: number; error: ViewingErrorCode };

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * The one way a viewing gets booked. The website form and the chat agent both land here, so the
 * input is treated as untrusted whichever side it came from.
 */
export const submitViewingBooking = async (
  body: Record<string, unknown>,
  ip: string,
  source: 'form' | 'chat'
): Promise<ViewingBookingResult> => {
  const fail = (status: number, error: ViewingErrorCode): ViewingBookingResult => ({
    ok: false,
    status,
    error,
  });

  if (!isViewingsConfigured()) return fail(503, 'not_configured');

  const name = text(body.name, 200);
  const email = text(body.email, 254);
  const phone = text(body.phone, 25);
  const eventDate = text(body.eventDate, 10);
  const slot = text(body.slot, 30);
  const requestedLocale = text(body.locale, 5);
  const locale = LOCALES.includes(requestedLocale) ? requestedLocale : 'en';
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

  if (isRateLimited(`viewing:${ip}`, BOOKINGS_PER_HOUR, 60 * 60 * 1000)) {
    return fail(429, 'rate_limited');
  }

  try {
    if (await isEventDateBooked(eventDate)) return fail(422, 'date_booked');
    // Re-derived from the live calendar right before writing, so two visitors can't hold one slot.
    if (!(await isSlotOpen(new Date(slot).toISOString()))) return fail(409, 'slot_taken');

    const { start, end } = await bookViewingSlot(slot, {
      title: `Viewing — ${name} (${guests} guests)`,
      description: [
        `Booked online via events.saintmaryro.org${source === 'chat' ? ' (chat assistant)' : ''}`,
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

    return { ok: true, start, end };
  } catch (err) {
    console.error('viewings: failed to book', err);
    return fail(502, 'failed');
  }
};
