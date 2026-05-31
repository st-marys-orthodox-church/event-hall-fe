export type ChurchCalendarSourceKey = 'programLiturgic' | 'saintMaryEvents' | 'calendarulOrthodox';

export type ChurchCalendarEvent = {
  allDay: boolean;
  description: string;
  endIso: string;
  id: string;
  location: string;
  sourceKey: ChurchCalendarSourceKey;
  startIso: string;
  title: string;
};

const CALENDAR_TZ = 'America/New_York';

const isoDateParts = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: CALENDAR_TZ,
    year: 'numeric',
  }).formatToParts(date);

const isoDateInCalendarTz = (date: Date) => {
  const parts = isoDateParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';
  return `${year}-${month}-${day}`;
};

const isoDateFromAllDay = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate()
  ).padStart(2, '0')}`;

export const getChurchCalendarEventDayKey = (event: ChurchCalendarEvent) =>
  event.allDay
    ? isoDateFromAllDay(new Date(event.startIso))
    : isoDateInCalendarTz(new Date(event.startIso));
