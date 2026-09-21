import { VENUE_TZ } from './ics';

const CLIENT_ID = process.env.ZOHO_CLIENT_ID;
const CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
const CALENDAR_UID = process.env.ZOHO_VIEWINGS_CALENDAR_UID;
// Zoho accounts live in regional data centres (.com, .eu, .in, ...); the token and API hosts must match.
const ACCOUNTS_URL = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com';
const CALENDAR_URL = process.env.ZOHO_CALENDAR_URL || 'https://calendar.zoho.com';

export const isZohoConfigured = (): boolean =>
  Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN && CALENDAR_UID);

export type BusyInterval = { start: Date; end: Date };

let cachedToken: { value: string; expiresAt: number } | null = null;

const getAccessToken = async (): Promise<string> => {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const params = new URLSearchParams({
    refresh_token: REFRESH_TOKEN ?? '',
    client_id: CLIENT_ID ?? '',
    client_secret: CLIENT_SECRET ?? '',
    grant_type: 'refresh_token',
  });
  const res = await fetch(`${ACCOUNTS_URL}/oauth/v2/token`, { method: 'POST', body: params });
  const json = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(`zoho: token refresh failed (${json.error ?? res.status})`);
  }
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
};

const zohoFetch = async (path: string, init?: RequestInit) => {
  const token = await getAccessToken();
  const res = await fetch(`${CALENDAR_URL}/api/v1${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) {
    throw new Error(`zoho: ${init?.method ?? 'GET'} ${path.split('?')[0]} -> ${res.status}`);
  }
  return res.json();
};

const pad = (n: number) => String(n).padStart(2, '0');

const toZohoUtc = (d: Date): string =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

// Zoho returns "20260925T170000-0400", "20260925T210000Z", or "20260925" for all-day events.
const parseZohoDate = (raw: string): Date | null => {
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z|[+-]\d{4})?)?$/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00', zone = 'Z'] = m;
  const offset = zone === 'Z' ? 'Z' : `${zone.slice(0, 3)}:${zone.slice(3)}`;
  const date = new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}${offset}`);
  return Number.isNaN(date.getTime()) ? null : date;
};

type ZohoEvent = { dateandtime?: { start?: string; end?: string } };

/** Busy intervals on the viewings calendar. Zoho caps the range at 31 days. */
export const listViewingBusy = async (from: Date, to: Date): Promise<BusyInterval[]> => {
  const range = JSON.stringify({ start: toZohoUtc(from), end: toZohoUtc(to) });
  const json = (await zohoFetch(
    `/calendars/${CALENDAR_UID}/events?range=${encodeURIComponent(range)}&byinstance=true`
  )) as { events?: ZohoEvent[] };

  const busy: BusyInterval[] = [];
  for (const ev of json.events ?? []) {
    const start = parseZohoDate(ev.dateandtime?.start ?? '');
    const end = parseZohoDate(ev.dateandtime?.end ?? '');
    if (start && end) busy.push({ start, end });
  }
  return busy;
};

export type NewViewingEvent = { title: string; description: string; start: Date; end: Date };

export const createViewingEvent = async (event: NewViewingEvent): Promise<void> => {
  const eventdata = JSON.stringify({
    title: event.title,
    description: event.description,
    dateandtime: {
      timezone: VENUE_TZ,
      start: toZohoUtc(event.start),
      end: toZohoUtc(event.end),
    },
    reminders: [{ action: 'popup', minutes: -60 }],
  });
  await zohoFetch(`/calendars/${CALENDAR_UID}/events?eventdata=${encodeURIComponent(eventdata)}`, {
    method: 'POST',
  });
};
