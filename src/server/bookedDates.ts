import { collectDates, isAllDay, loadCalendar, occurrencesInRange, veventsOf } from './ics';

const ICS_URL = process.env.CALENDAR_ICS_URL;

export const isBookingsCalendarConfigured = (): boolean => Boolean(ICS_URL);

/** Days with a private booking in [from, to), YYYY-MM-DD. */
export const loadBookedDates = async (from: string, to: string): Promise<string[]> => {
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
