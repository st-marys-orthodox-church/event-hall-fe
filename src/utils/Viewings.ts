export type IViewingWindow = { start: string; end: string };

// Venue local time. Keyed by weekday, 0 = Sunday.
export const VIEWING_HOURS: Record<number, IViewingWindow[]> = {
  0: [],
  1: [],
  2: [],
  3: [{ start: '10:00', end: '12:00' }],
  4: [{ start: '10:00', end: '12:00' }],
  5: [{ start: '10:00', end: '12:00' }],
  6: [{ start: '10:00', end: '14:00' }],
};

export const VIEWING_CONFIG = {
  slotMinutes: 30,
  minLeadHours: 24,
  maxDaysAhead: 30,
  // Standing-reception limit; anything larger goes to a conversation instead of a self-serve tour.
  maxGuests: 300,
} as const;

export type ViewingDay = {
  /** Venue-local date, YYYY-MM-DD. */
  date: string;
  /** Slot start instants, ISO 8601 UTC. */
  slots: string[];
};

export type ViewingSlotsResponse = { days: ViewingDay[] };

import type { LeadSource } from './LeadSource';

export type ViewingBookingRequest = {
  name: string;
  email: string;
  phone: string;
  guests: number;
  eventDate: string;
  budgetAck: boolean;
  slot: string;
  locale: string;
  website?: string;
  leadSource?: LeadSource;
};

export type ViewingErrorCode =
  | 'invalid'
  | 'over_capacity'
  | 'date_booked'
  | 'slot_taken'
  | 'rate_limited'
  | 'not_configured'
  | 'failed';

export type ViewingPrefill = { guests?: number; eventDate?: string };
