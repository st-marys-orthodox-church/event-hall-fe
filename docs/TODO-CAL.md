# Spec: Google Calendar Availability Widget

## Goal

Show a month-view calendar on the public site that marks dates as **Available** or **Booked** based on events in a shared Google Calendar. No event details leak to the public; managers see them only inside Google Calendar itself.

## Scope (v1)

**In:**
- One shared Google Calendar is the source of truth.
- Public widget shows current month + next 2–3 months, with navigation.
- Each day shows one of three states: `available`, `booked`, `past`.
- Prospects can see booked dates before starting a contact-form inquiry.
- Pre-selecting a date on the widget pre-fills the contact form's "preferred date" field.

**Out (future):**
- Partial-day booking (all events treated as full-day for display).
- Holds / tentative bookings (only confirmed events render as booked).
- Admin UI in the site itself — managers use Google Calendar directly.
- Booking conflicts across multiple halls (single calendar).

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Google         │◄────┤  Next.js API     │◄────┤  <Availability  │
│  Calendar API   │     │  /api/availability│    │   Calendar />   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        ▲                       │                        ▲
        │                       ▼                        │
┌─────────────────┐     ┌──────────────────┐             │
│  Shared cal     │     │  In-memory cache │             │
│  (managers      │     │  (60 min TTL)    │             │
│   edit here)    │     └──────────────────┘             │
└─────────────────┘                                      │
                                                ┌────────┴───────┐
                                                │ Contact form   │
                                                │ pre-fill date  │
                                                └────────────────┘
```

**Data flow:** Client mounts → fetches `/api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` → API checks cache → if miss, calls Google Calendar `events.list` → returns `{ bookedDates: ["2026-04-16", ...] }` → client renders grid.

## Google Calendar setup

1. Create a dedicated calendar: **"Fellowship Hall Bookings"** (not a personal calendar).
2. Owner: a role-based Google account (`bookings@saintmaryro.org` or similar) — not tied to one person.
3. Sharing:
   - **"Make changes to events"** for each hall manager.
   - **"Make changes and manage sharing"** for 1–2 admins.
   - **"See only free/busy (hide details)"** for public access permission.
4. Copy the **Calendar ID** from Settings → Integrate calendar.

## Auth strategy

**Recommendation: API key + public free/busy access.**

- Simplest, no OAuth, no key rotation, no service account.
- The calendar is effectively "public free/busy" — anyone who has the Calendar ID can already see free/busy via Google's iCal feed. An API key adds no new exposure.
- Risk: if someone guesses the Calendar ID they can query it. Acceptable for a church venue.

**Rejected alternatives:**
- **Service account** — adds GCP project, JSON key file, key rotation burden. Worth it only if the calendar must stay fully private.
- **OAuth** — irrelevant; we're not acting on behalf of a user.

**Env vars (`.env.local` + host):**
```
GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
GOOGLE_CALENDAR_API_KEY=AIza...
```

Restrict the API key in GCP Console: **HTTP referrer restriction** to the production domain + **API restriction** to "Google Calendar API" only.

## API contract

**Endpoint:** `GET /api/availability`

**Query params:**
- `from` — ISO date (YYYY-MM-DD). Inclusive. Required.
- `to` — ISO date. Inclusive. Required. Max 180 days from `from`.

**Response 200:**
```json
{
  "timeZone": "America/New_York",
  "from": "2026-04-01",
  "to": "2026-06-30",
  "bookedDates": ["2026-04-16", "2026-04-17", "2026-05-03"],
  "cachedAt": "2026-04-17T14:22:00Z"
}
```

**Response 400** — invalid params (bad date, range > 180 days).
**Response 502** — upstream Google Calendar failure. Client should show "Calendar temporarily unavailable — call us at (xxx) xxx-xxxx."

**Caching:**
- Server: in-memory `Map<rangeKey, { data, expiresAt }>`, 60-minute TTL. Good enough for a single Vercel region.
- HTTP: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
- No Redis/KV needed at this volume.

## Server implementation

**File:** `src/pages/api/availability.ts`

**Dependencies:** `googleapis` (official SDK) — ~1 dep, widely used, handles auth + pagination.

**Logic:**
1. Validate query params (use `zod` — already conventional in Next apps, add if missing, or hand-roll).
2. Build cache key: `${from}:${to}`.
3. On cache hit + not expired → return.
4. On miss → call `calendar.events.list({ calendarId, timeMin, timeMax, singleEvents: true, orderBy: 'startTime', maxResults: 500 })`.
5. Expand each event into the set of UTC dates it covers (handle multi-day events, all-day events, timezone quirks — see below).
6. Dedupe into `bookedDates`, sort ascending, cache, return.

**Timezone handling (important):**
- Google returns events as either `start.date` (all-day) or `start.dateTime` (timed).
- For timed events, convert to the venue's timezone (`America/New_York` — store in `AppConfig.ts`) before extracting the calendar date. Otherwise a 10pm EST wedding shows as the next day.
- Use `date-fns-tz` or `Intl.DateTimeFormat` with the venue TZ.

**Error handling:**
- Google API 403/404 → log + return 502 with a generic message (never leak the API key error).
- Rate limits → exponential backoff is overkill at this volume; one retry after 500ms, then 502.

## Client component

**File:** `src/ui/features/AvailabilityCalendar.tsx`

**Props:**
```ts
type Props = {
  monthsToShow?: number; // default 3
  onDateSelect?: (date: string) => void; // ISO date
  className?: string;
};
```

**Behavior:**
- Fetches `/api/availability` via `useEffect` on mount with `from=today`, `to=today + monthsToShow months`.
- Renders a month grid (7 cols × 5–6 rows) per month. Header: month name + prev/next buttons.
- Each cell shows day number. Legend below: a small dot or label for Available / Booked / Past.
- Booked cells: sage-green muted background + "Booked" label on hover (desktop) / always visible (mobile).
- Available cells: clickable → calls `onDateSelect`. Use `<button>` for keyboard access.
- Past cells: stone-300, not interactive.
- Loading: skeleton grid using Tailwind `animate-pulse`.
- Error: fallback card: "Calendar temporarily unavailable — please call (xxx) xxx-xxxx or submit the contact form."

**Styling:** Tailwind utilities, brand palette (`#7c9885` sage, `#c9a86c` gold, stone neutrals). No new MUI components.

**Accessibility:**
- `<table>` semantics or `role="grid"` with `role="gridcell"`.
- `aria-label` per cell: `"April 16, 2026, booked"` / `"April 17, 2026, available, select"`.
- Keyboard nav: arrow keys move between cells (nice-to-have, not blocking for v1).
- Respect `prefers-reduced-motion`.

## Integration points

**Landing page (`src/pages/index.tsx`):**
- New section titled **"Check Availability"** between the packages showcase and the contact form. Headline copy lives in `AppConfig.ts` per convention.

**Contact form:**
- `onDateSelect` scrolls to the contact form and pre-fills the preferred-date input. Requires lifting state up or using `URL` hash params (`#contact?date=2026-04-16`). Hash param is simpler and survives page reloads.

**Packages page:** optional — same widget embedded at the bottom. Defer to v2.

## SEO

- Widget renders client-side only, so Googlebot sees a skeleton. That's fine — the page already has strong above-the-fold content. Don't SSR the calendar data; it would pin the page to one snapshot per build.
- No new structured data needed. (Future: if we add `Event` JSON-LD for public events, that's a separate effort.)

## Security

- API key stored in env vars only; never shipped to client. The `/api/availability` route is the only thing that touches Google.
- Rate-limit `/api/availability` to prevent scraping: 30 req/min per IP via a simple in-memory token bucket or `@vercel/edge` rate limiter. Low priority for v1.
- No PII in responses — just dates. Safe to cache at CDN.

## Observability

- Log cache hits/misses + Google API latency to console (Vercel captures).
- Count 502s — if > 1%/day, investigate.
- No new monitoring tool needed.

## Testing

**Manual QA checklist:**
- [ ] Add an all-day event in Google Calendar → date shows as Booked within 60 min (or instantly if cache cleared).
- [ ] Add a timed event (6pm–11pm EST) → correct date shows Booked, not the next day.
- [ ] Add a multi-day event (Fri–Sun) → all three days show Booked.
- [ ] Delete event → date returns to Available after cache expiry.
- [ ] Invalid Calendar ID in env → site shows graceful error, not crash.
- [ ] Works on iOS Safari, Chrome Android, Firefox desktop.
- [ ] Screen reader announces "booked" / "available" per cell (VoiceOver smoke test).

**Automated:** none for v1. A single unit test for the date-expansion helper (multi-day + TZ edge cases) is worth it.

## Rollout

1. Create calendar + share with managers.
2. Issue API key in GCP, restrict it, add env vars to Vercel.
3. Implement `/api/availability` + ship behind no flag (unauth endpoint).
4. Implement `<AvailabilityCalendar />`, add to landing page.
5. Run Lighthouse — confirm no CLS regression.
6. Announce internally; ask managers to do a dry-run booking.
7. Monitor for 1 week; tune cache TTL if needed.

## Effort estimate

- Calendar setup + API key: **30 min**
- API route + caching + TZ handling: **3–4 hrs**
- Calendar component + styling: **3–4 hrs**
- Contact form pre-fill wiring: **1 hr**
- QA + copy polish: **1–2 hrs**

**Total: ~1 focused day.**

## Open questions

1. **Timezone** — confirm venue is `America/New_York` (Dacula, GA)?
2. **How many months ahead** should the public see? 3 feels right; 6 is doable.
3. **Contact form date field** — does it already exist, or do we add it?
4. **Single calendar** — any chance there's a second space (e.g., a smaller room) that books independently? Affects whether this is 1 calendar or N.
5. **Manager list** — who gets "Make changes" vs "Manage sharing"? Needed before the calendar is provisioned.
