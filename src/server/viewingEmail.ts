import sendgrid from '@sendgrid/mail';
import en from '../../public/locales/en/viewing.json';
import es from '../../public/locales/es/viewing.json';
import ro from '../../public/locales/ro/viewing.json';
import { AppConfig } from '../utils/AppConfig';
import { escapeHtml } from './html';
import { VENUE_TZ } from './ics';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? '';
if (SENDGRID_API_KEY) sendgrid.setApiKey(SENDGRID_API_KEY);

const EMAIL_COPY = { en: en.email, es: es.email, ro: ro.email };
type EmailLocale = keyof typeof EMAIL_COPY;

const isEmailLocale = (locale: string): locale is EmailLocale => locale in EMAIL_COPY;

const fill = (template: string, vars: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');

const ADDRESS = `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`;

export const formatViewingWhen = (start: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    timeZone: VENUE_TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(start);

const icsStamp = (d: Date) => `${d.toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`;

const icsText = (s: string) => s.replace(/([\;,])/g, '\\$1').replace(/\n/g, '\\n');

const buildIcs = (title: string, start: Date, end: Date): string =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fellowship Event Hall//Viewings//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:viewing-${start.getTime()}@events.saintmaryro.org`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsText(title)}`,
    `LOCATION:${icsText(ADDRESS)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

export type ViewingEmailInput = {
  name: string;
  email: string;
  phone: string;
  guests: number;
  eventDate: string;
  locale: string;
  start: Date;
  end: Date;
};

export const sendViewingEmails = async (input: ViewingEmailInput): Promise<void> => {
  const locale = isEmailLocale(input.locale) ? input.locale : 'en';
  const copy = EMAIL_COPY[locale];
  const when = formatViewingWhen(input.start, locale);
  const whenEn = formatViewingWhen(input.start, 'en');

  const visitorHtml = `
    <div style="font-family: helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c9885;">${escapeHtml(copy.heading)}</h2>
      <p>${escapeHtml(fill(copy.greeting, { name: input.name }))}</p>
      <p>${escapeHtml(copy.body)}</p>
      <p><strong>${escapeHtml(copy.whenLabel)}:</strong> ${escapeHtml(when)}<br>
      <strong>${escapeHtml(copy.whereLabel)}:</strong> ${escapeHtml(ADDRESS)}</p>
      <p style="color: #78716c; font-size: 13px;">${escapeHtml(copy.reschedule)}</p>
    </div>`;

  const staffRows: [string, string][] = [
    ['When', whenEn],
    ['Name', input.name],
    ['Email', input.email],
    ['Phone', input.phone],
    ['Guest count', String(input.guests)],
    ['Event date', input.eventDate],
    ['Language', locale],
  ];
  const staffHtml = `
    <div style="font-family: helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c9885;">Viewing booked — Fellowship Event Hall</h2>
      <p>Booked online and already added to the Viewings calendar. No action needed.</p>
      <table style="border-collapse: collapse; width: 100%;">
        ${staffRows
          .map(
            ([label, value]) =>
              `<tr>
                <td style="padding: 8px 12px; border: 1px solid #e7e5e4; font-weight: bold; white-space: nowrap;">${label}</td>
                <td style="padding: 8px 12px; border: 1px solid #e7e5e4;">${escapeHtml(value)}</td>
              </tr>`
          )
          .join('')}
      </table>
    </div>`;

  if (process.env.NEXT_PUBLIC_DEV) {
    console.log('VIEWING EMAILS (dev, not sent)', { to: input.email, when, locale });
    return;
  }

  const ics = Buffer.from(buildIcs(copy.calendarTitle, input.start, input.end)).toString('base64');
  await Promise.all([
    sendgrid.send({
      to: input.email,
      from: AppConfig.email,
      replyTo: AppConfig.email,
      subject: fill(copy.subject, { when }),
      html: visitorHtml,
      attachments: [
        {
          content: ics,
          filename: 'viewing.ics',
          type: 'text/calendar',
          disposition: 'attachment',
        },
      ],
    }),
    sendgrid.send({
      to: AppConfig.email,
      from: AppConfig.email,
      replyTo: { email: input.email, name: input.name },
      subject: `Viewing booked — ${input.name}, ${whenEn}`,
      html: staffHtml,
    }),
  ]);
};
