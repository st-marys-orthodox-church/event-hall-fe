import { AppConfig } from './AppConfig';

export type Sop = {
  id: string;
  title: string;
  when: string;
  steps: string[];
  watchOut?: string[];
};

const EMAIL = AppConfig.email;

// Names, passwords and phone numbers of individuals never go here: the repo is public.
// Point to the Account directory instead.
export const SOPS: Sop[] = [
  {
    id: 'inquiries',
    title: 'Answer an inquiry or a viewing booking',
    when: `Every business day. Inquiries arrive at ${EMAIL}, on WhatsApp (${AppConfig.telephone}) and through the site chat.`,
    steps: [
      `Open the ${EMAIL} inbox. Contact-form messages arrive there with the visitor's address set as Reply-To, so replying goes straight to them.`,
      'Reply the same or next business day. Thank them, then ask for anything missing: event type, date, guest count.',
      'Check the date on the calendar before promising it (see "Block or free a date").',
      'Send the packages link (events.saintmaryro.org/packages) and offer a tour.',
      `Online viewing bookings need no reply. The visitor is emailed a confirmation and ${EMAIL} gets a "Viewing booked" notice. Confirm the tour is on the Zoho "Viewings" calendar.`,
      'To reschedule or cancel a viewing, move or delete it on the Viewings calendar, then email the visitor.',
      'WhatsApp and chat handoffs: answer from the same phone, and note anything promised so the next person sees it.',
    ],
    watchOut: [
      'Self-serve tours run Wednesday to Friday 10:00 to 12:00 and Saturday 10:00 to 14:00, in 30-minute slots, 2 to 30 days ahead. Anything else is arranged by hand.',
      'Parties over 300 guests are not offered a self-serve tour. Talk to them first.',
      'The site turns away church event days automatically. If someone still wants that day, decide it personally.',
    ],
  },
  {
    id: 'calendar',
    title: 'Block or free a date',
    when: 'A booking is confirmed, cancelled, or the church schedules its own event.',
    steps: [
      'Open Zoho Calendar with the account listed for it in the Account directory.',
      'Confirmed rental: add an all-day event on the booking calendar for the event date. It turns gray on the site calendar.',
      'Cancelled rental: delete that event. The date opens up again.',
      'Public church event (feast day, festival): add it to the "Public Events" calendar with an English title and the Romanian text in the description. It shows in gold on the calendar and on the Events page.',
      'Wait about 10 minutes, then load events.saintmaryro.org and check the date. The site caches the calendar feeds for that long.',
    ],
    watchOut: [
      'Never put a private rental on the Public Events calendar: everything on it is published.',
      'Keep the Viewings calendar for tours only. A stray event there blocks a tour slot, not an event date.',
    ],
  },
  {
    id: 'pricing',
    title: 'Change prices, packages or website text',
    when: 'A price, package inclusion, hours or any wording on the site is out of date.',
    steps: [
      'Write down the exact change and where it appears (page and section).',
      'Send it to the website developer listed in the Account directory. Website text is in code and needs a developer to publish it.',
      'The developer edits the English text, runs the translation sync for Spanish and Romanian, and a person who speaks each language reads the result.',
      'After it goes live, check the page on a phone in English, then in Spanish and Romanian using the language switcher.',
      'If the change affects hours, address, phone or price range, update every listing too (see "Keep listings consistent").',
    ],
  },
  {
    id: 'listings',
    title: 'Keep listings consistent',
    when: 'Every quarter, and whenever hours, phone, address or prices change.',
    steps: [
      'Open the "Listing details" block on this page. It is the one correct version.',
      'Compare it with Google Business Profile, Yelp, Facebook and Instagram. Name, address, phone, website and hours must match character for character.',
      'Fix any difference on that platform. Use the owner named in the Account directory, or ask them to add you as a manager.',
      'Check the photos: at least ten recent ones on Google, and the same cover image style everywhere.',
      'Set "Reviewed on" for those rows in the Account directory.',
    ],
    watchOut: [
      'Search engines lose trust when two listings disagree. A different suite number or old phone number is enough.',
    ],
  },
  {
    id: 'reviews',
    title: 'Ask for and answer reviews',
    when: 'Within three days after an event or tour, and whenever a new review appears.',
    steps: [
      'Ask: a few days after the event, message the host with a thank-you and the Google review link. One short message is enough, no reminders.',
      'Answer every new Google and Yelp review within two days, using the owner account for that platform.',
      'Positive review: thank them by first name and mention what they did (wedding, quinceañera, graduation).',
      'Negative review: apologize once, no excuses, offer to talk by phone or at the events email, and stop. Do not argue in public.',
      'To feature a review on the website, send the review link to the website developer. Reviews on the site are chosen by hand, never pulled automatically.',
    ],
    watchOut: [
      'Never offer discounts or gifts in exchange for a review.',
      "Never share a client's date, price or family details in a public reply.",
    ],
  },
  {
    id: 'social',
    title: 'Post on Instagram and Facebook',
    when: 'Once or twice a week is plenty. After an event is the best time.',
    steps: [
      'Pick two to five photos. Ask the hosts before posting anyone recognizable, and never post children without a parent saying yes.',
      'Write a warm, short caption, with the location (Dacula, GA) and the event type. Two or three hashtags such as #DaculaGA #WeddingVenue.',
      'Post from the account of whoever owns that platform in the Account directory, or from a manager role, never by sharing a password.',
      'Reply to comments and messages within a day. Send anything about dates or prices to the events email.',
    ],
  },
  {
    id: 'access',
    title: 'Add or remove someone',
    when: 'A volunteer joins the team, or leaves it.',
    steps: [
      'Adding: give them a manager or admin role on each platform they need. Do not hand over the owner password.',
      'Put them in the shared password manager vault if they need the shared logins, and tell them where the vault is.',
      'Leaving: remove their role on every platform in the Account directory first.',
      'Then change the password for any shared login they knew (the events email, Zoho, WhatsApp), and change the site passcode for this page.',
      'Update the Account directory and the site passcode setting so nobody who left can open this page.',
    ],
    watchOut: [
      'Every account must have a backup owner who is a different person, so nothing depends on one volunteer.',
    ],
  },
  {
    id: 'down',
    title: 'The website or a form stops working',
    when: 'A visitor says the site is down, or an inquiry or booking never arrived.',
    steps: [
      'Open events.saintmaryro.org in a private window and on a phone with Wi-Fi off. Note which page or form fails.',
      `Send a test through the contact form to ${EMAIL} and check the inbox and spam folder within five minutes.`,
      'If the site loads but calendars look empty or wrong, wait ten minutes and reload, then check the Zoho calendars.',
      'If it is still broken, contact the website developer listed in the Account directory with the page, time and what you saw.',
      `Meanwhile, tell callers to use WhatsApp (${AppConfig.telephone}) or ${EMAIL}. Those do not depend on the website.`,
    ],
  },
];

export type ListingDetail = { label: string; value: string };

export const LISTING_DETAILS: ListingDetail[] = [
  { label: 'Name', value: 'Fellowship Event Hall' },
  {
    label: 'Address',
    value: `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`,
  },
  { label: 'Phone', value: AppConfig.telephone },
  { label: 'Email', value: EMAIL },
  { label: 'Website', value: AppConfig.url },
  { label: 'Hours', value: 'Every day, 8:00 AM to 6:00 PM' },
  { label: 'Price range', value: AppConfig.priceRange },
  { label: 'Categories', value: 'Banquet hall, Wedding venue, Event venue' },
];
