import { VIEWING_CONFIG, VIEWING_HOURS, type ViewingDay } from '../utils/Viewings';
import { isBookingsCalendarConfigured, loadBookedDates } from './bookedDates';
import { VENUE_TZ, addDays, isoInVenueTz } from './ics';
import {
  type BusyInterval,
  type NewViewingEvent,
  createViewingEvent,
  isZohoConfigured,
  listViewingBusy,
} from './zohoCalendar';

const HOUR_MS = 60 * 60 * 1000;
const SLOT_MS = VIEWING_CONFIG.slotMinutes * 60 * 1000;

// Without Zoho credentials, local dev keeps bookings in memory so the whole flow can be exercised.
const devBusy: BusyInterval[] = [];
const useDevCalendar = () => !isZohoConfigured() && Boolean(process.env.NEXT_PUBLIC_DEV);

export const isViewingsConfigured = (): boolean => isZohoConfigured() || useDevCalendar();

const tzOffsetMs = (instant: Date): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VENUE_TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
};

/** The instant at which the venue's wall clock reads `date` `time` (HH:mm). */
export const venueTimeToUtc = (date: string, time: string): Date => {
  const naive = new Date(`${date}T${time}:00Z`).getTime();
  const guess = naive - tzOffsetMs(new Date(naive));
  // Second pass settles the hour on either side of a DST change.
  return new Date(naive - tzOffsetMs(new Date(guess)));
};

const overlaps = (start: number, end: number, busy: BusyInterval[]) =>
  busy.some((b) => start < b.end.getTime() && end > b.start.getTime());

export const loadOpenViewingDays = async (now = new Date()): Promise<ViewingDay[]> => {
  const today = isoInVenueTz(now);
  const lastDay = addDays(today, VIEWING_CONFIG.maxDaysAhead);
  const earliest = now.getTime() + VIEWING_CONFIG.minLeadHours * HOUR_MS;

  const [bookedDates, busy] = await Promise.all([
    isBookingsCalendarConfigured()
      ? loadBookedDates(today, addDays(lastDay, 1))
      : Promise.resolve([] as string[]),
    useDevCalendar()
      ? Promise.resolve(devBusy)
      : listViewingBusy(now, venueTimeToUtc(addDays(lastDay, 1), '00:00')),
  ]);
  const booked = new Set(bookedDates);

  const days: ViewingDay[] = [];
  for (let date = today; date <= lastDay; date = addDays(date, 1)) {
    // The hall is in use on booked days, so nobody is free to give a tour.
    if (booked.has(date)) continue;
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const slots: string[] = [];
    for (const window of VIEWING_HOURS[weekday] ?? []) {
      const windowEnd = venueTimeToUtc(date, window.end).getTime();
      for (
        let start = venueTimeToUtc(date, window.start).getTime();
        start + SLOT_MS <= windowEnd;
        start += SLOT_MS
      ) {
        if (start >= earliest && !overlaps(start, start + SLOT_MS, busy)) {
          slots.push(new Date(start).toISOString());
        }
      }
    }
    if (slots.length > 0) days.push({ date, slots });
  }
  return days;
};

export const isSlotOpen = async (slot: string): Promise<boolean> => {
  const days = await loadOpenViewingDays();
  return days.some((day) => day.slots.includes(slot));
};

export const bookViewingSlot = async (
  slot: string,
  event: Omit<NewViewingEvent, 'start' | 'end'>
): Promise<{ start: Date; end: Date }> => {
  const start = new Date(slot);
  const end = new Date(start.getTime() + SLOT_MS);
  if (useDevCalendar()) {
    devBusy.push({ start, end });
    console.log('VIEWING BOOKED (dev calendar)', { ...event, start, end });
  } else {
    await createViewingEvent({ ...event, start, end });
  }
  return { start, end };
};

export const isEventDateBooked = async (eventDate: string): Promise<boolean> => {
  if (!isBookingsCalendarConfigured()) return false;
  const dates = await loadBookedDates(eventDate, addDays(eventDate, 1));
  return dates.includes(eventDate);
};
