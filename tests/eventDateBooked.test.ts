import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const dir = mkdtempSync(join(tmpdir(), 'event-date-'));

const feed = (name: string, days: Array<[summary: string, start: string, end: string]>) => {
  const path = join(dir, name);
  const events = days.map(([summary, start, end], i) =>
    [
      'BEGIN:VEVENT',
      `UID:${name}-${i}`,
      'DTSTAMP:20260901T000000Z',
      `SUMMARY:${summary}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      'END:VEVENT',
    ].join('\r\n')
  );
  writeFileSync(
    path,
    ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//test//EN', ...events, 'END:VCALENDAR'].join(
      '\r\n'
    )
  );
  return pathToFileURL(path).href;
};

const bookings = feed('bookings.ics', [['Private rental', '20301214', '20301215']]);
const churchEvents = feed('church.ics', [['Festival', '20301221', '20301222']]);

const load = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return (await import('../src/server/viewings')).isEventDateBooked;
};

beforeEach(() => {
  vi.stubEnv('CALENDAR_ICS_URL', '');
  vi.stubEnv('PUBLIC_EVENTS_ICS_URL', '');
});

describe('isEventDateBooked', () => {
  it('turns away a day with a private booking', async () => {
    const isEventDateBooked = await load({ CALENDAR_ICS_URL: bookings });
    expect(await isEventDateBooked('2030-12-14')).toBe(true);
    expect(await isEventDateBooked('2030-12-15')).toBe(false);
  });

  it('turns away a church event day, as the calendar on the site does', async () => {
    const isEventDateBooked = await load({
      CALENDAR_ICS_URL: bookings,
      PUBLIC_EVENTS_ICS_URL: churchEvents,
    });
    expect(await isEventDateBooked('2030-12-21')).toBe(true);
    expect(await isEventDateBooked('2030-12-14')).toBe(true);
    expect(await isEventDateBooked('2030-12-19')).toBe(false);
  });

  it('still answers from the bookings when the church events feed is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const isEventDateBooked = await load({
      CALENDAR_ICS_URL: bookings,
      PUBLIC_EVENTS_ICS_URL: pathToFileURL(join(dir, 'missing.ics')).href,
    });
    expect(await isEventDateBooked('2030-12-14')).toBe(true);
    expect(await isEventDateBooked('2030-12-21')).toBe(false);
  });
});
