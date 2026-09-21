import type { FunctionDeclaration } from '@google/genai';
import common from '../../public/locales/en/common.json';
import home from '../../public/locales/en/home.json';
import packages from '../../public/locales/en/packages.json';
import { AppConfig } from '../utils/AppConfig';
import { DEPOSIT_INFO } from '../utils/Packages';
import { VIEWING_CONFIG, type ViewingPrefill } from '../utils/Viewings';
import { isBookingsCalendarConfigured } from './bookedDates';
import { VENUE_TZ, isValidIsoDate, isoInVenueTz } from './ics';
import { isEventDateBooked, isViewingsConfigured, loadOpenViewingDays } from './viewings';

// The agent is grounded in the same copy the site renders, so it cannot drift from the pages.
const KNOWLEDGE = {
  venue: {
    name: 'Fellowship Event Hall',
    parish: 'St. Mary Romanian Orthodox Church',
    address: `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`,
    phone: AppConfig.telephone,
    email: AppConfig.email,
    website: AppConfig.url,
    officeHours: common.footer.hours,
    story: home.story,
    visit: home.visit,
  },
  pricingByCapacity: packages.pricingTable.tiers,
  includedInEveryPackage: packages.included.items,
  packages: packages.tiers,
  deposits: { ...DEPOSIT_INFO, note: packages.deposits.disclaimer },
  faq: [...home.faq.items, ...packages.faq.items],
  viewings: {
    lengthMinutes: VIEWING_CONFIG.slotMinutes,
    bookableUpToDaysAhead: VIEWING_CONFIG.maxDaysAhead,
    minimumNoticeHours: VIEWING_CONFIG.minLeadHours,
  },
};

export const CHAT_SYSTEM_PROMPT = `You are the website assistant for Fellowship Event Hall, the event venue at St. Mary Romanian Orthodox Church in Dacula, Georgia. Visitors are mostly families planning weddings, baptisms, quinceañeras, birthdays and similar celebrations. You answer their questions about the space and help them take the next step.

Everything you know about the venue is in the JSON below. Treat it as the only source of truth: if something is not covered there (for example a specific policy detail, a discount, vendor recommendations, or anything about church services), say you don't have that information and point them to the contact form, WhatsApp, ${AppConfig.telephone} or ${AppConfig.email}. Never guess or invent prices, policies, or availability.

What you can do:
- Check whether a specific event date is still open with check_date_availability. Always use the tool rather than assuming.
- Look up open venue-tour times with get_viewing_slots.
- When a visitor seems like a fit and wants to see the hall, call offer_viewing_booking. It shows them a button that opens the online tour booking; they pick the time and confirm there. You cannot book a tour or reserve an event date yourself, and you never confirm that anything is booked. Event dates are only held with a signed rental agreement and deposits, arranged with the staff.

The goal of the conversation: seeing the hall in person is what helps visitors decide, so once you have answered their question, steer them toward a tour. When they show real interest (they mention a date, a guest count, an event they are planning, or ask about price or what is included), invite them to come see the space and call offer_viewing_booking so the button appears. For a first casual question, a short closing line such as asking about their event or mentioning that tours can be booked online is enough. Be inviting rather than pushy: one nudge per reply, never before answering the question, and do not repeat the same invitation word for word.

Style: warm, brief, and plain. Reply in the language the visitor writes in (English, Spanish, or Romanian). Two or three short sentences is usually right. Write plain text with no markdown, since the chat window shows your text as-is. Stay on the topic of the venue and events held there; politely decline anything unrelated.

<venue_information>
${JSON.stringify(KNOWLEDGE, null, 1)}
</venue_information>`;

export const chatDateContext = (now = new Date()): string =>
  `Today is ${new Intl.DateTimeFormat('en-US', { timeZone: VENUE_TZ, dateStyle: 'full' }).format(now)} (${isoInVenueTz(now)}) at the venue.`;

export const CHAT_TOOLS: FunctionDeclaration[] = [
  {
    name: 'check_date_availability',
    description:
      'Check whether the hall is still open for a private event on a given date. Call this whenever a visitor asks about a specific date.',
    parametersJsonSchema: {
      type: 'object',
      properties: { date: { type: 'string', description: 'Event date as YYYY-MM-DD' } },
      required: ['date'],
    },
  },
  {
    name: 'get_viewing_slots',
    description:
      'List the next open times for an in-person tour of the hall. Use it when a visitor asks when they can come see the space.',
  },
  {
    name: 'offer_viewing_booking',
    description:
      'Show the visitor a button that opens the online tour booking. Call it when they want to visit or schedule a tour. Pass the guest count and event date if they have mentioned them so the form is pre-filled.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        guests: { type: 'integer', description: 'Expected guest count, if known' },
        event_date: { type: 'string', description: 'Event date as YYYY-MM-DD, if known' },
      },
    },
  },
];

export type ChatAction = { action: 'book_viewing'; prefill: ViewingPrefill };

const formatSlot = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: VENUE_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

export const runChatTool = async (
  name: string,
  rawInput: unknown,
  emit: (action: ChatAction) => void
): Promise<string> => {
  const input = (typeof rawInput === 'object' && rawInput !== null ? rawInput : {}) as Record<
    string,
    unknown
  >;

  if (name === 'check_date_availability') {
    const { date } = input;
    if (!isValidIsoDate(date)) return 'Invalid date; expected YYYY-MM-DD.';
    if (date < isoInVenueTz(new Date())) return `${date} is in the past.`;
    if (!isBookingsCalendarConfigured()) {
      return 'The availability calendar is unavailable; direct them to contact.';
    }
    return (await isEventDateBooked(date))
      ? `${date} is already booked.`
      : `${date} is currently open. It is not held until a rental agreement is signed.`;
  }

  if (name === 'get_viewing_slots') {
    if (!isViewingsConfigured())
      return 'Online tour booking is unavailable; direct them to contact.';
    const days = await loadOpenViewingDays();
    if (days.length === 0) return 'No open tour times in the coming weeks; direct them to contact.';
    return days
      .slice(0, 6)
      .map((day) => day.slots.slice(0, 4).map(formatSlot).join('; '))
      .join('\n');
  }

  if (name === 'offer_viewing_booking') {
    if (!isViewingsConfigured())
      return 'Online tour booking is unavailable; direct them to contact.';
    const prefill: ViewingPrefill = {};
    if (typeof input.guests === 'number' && input.guests > 0) prefill.guests = input.guests;
    if (isValidIsoDate(input.event_date)) prefill.eventDate = input.event_date;
    emit({ action: 'book_viewing', prefill });
    return 'A "Book a viewing" button is now shown below your reply.';
  }

  return `Unknown tool: ${name}`;
};
