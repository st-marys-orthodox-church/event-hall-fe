import sendgrid from '@sendgrid/mail';
import type { NextApiRequest, NextApiResponse } from 'next';

sendgrid.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY as string);

const VENUE_EMAIL = 'events@saintmaryro.org';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTHS = {
  name: 200,
  email: 254,
  cap: 10,
  date: 40,
  package: 100,
  message: 5000,
} as const;

type Field = keyof typeof MAX_LENGTHS;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const readField = (body: Record<string, unknown>, field: Field): string => {
  const raw = body[field];
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, MAX_LENGTHS[field]);
};

async function sendEmail(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot: real users never see this field, so a value means a bot.
  // Report success so the bot has nothing to learn from.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json({ error: '' });
  }

  const name = readField(body, 'name');
  const email = readField(body, 'email');
  const cap = readField(body, 'cap');
  const date = readField(body, 'date');
  const eventPackage = readField(body, 'package');
  const message = readField(body, 'message');

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Event date', date],
    ['Guest count', cap],
    ['Package', eventPackage],
    ['Message', message],
  ];

  const html = `
    <div style="font-family: helvetica, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c9885;">New inquiry — Fellowship Event Hall</h2>
      <table style="border-collapse: collapse; width: 100%;">
        ${rows
          .filter(([, value]) => value)
          .map(
            ([label, value]) =>
              `<tr>
                <td style="padding: 8px 12px; border: 1px solid #e7e5e4; font-weight: bold; white-space: nowrap; vertical-align: top;">${label}</td>
                <td style="padding: 8px 12px; border: 1px solid #e7e5e4;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
              </tr>`
          )
          .join('')}
      </table>
      <p style="color: #78716c; font-size: 13px;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
    </div>`;

  try {
    if (process.env.NEXT_PUBLIC_DEV) {
      console.log('REQ.BODY', { name, email, cap, date, package: eventPackage, message });
    } else {
      await sendgrid.send({
        to: VENUE_EMAIL,
        from: VENUE_EMAIL,
        replyTo: { email, name },
        subject: `Inquiry for Fellowship Event Hall — ${name}`,
        html,
      });
    }
  } catch (error: any) {
    console.error('sendgrid: failed to send inquiry', error);
    return res.status(error.statusCode || 500).json({ error: 'Failed to send message' });
  }

  return res.status(200).json({ error: '' });
}

export default sendEmail;
