import type { NextApiRequest, NextApiResponse } from 'next';
import { clientIp } from '../../../server/rateLimit';
import { submitViewingBooking } from '../../../server/viewingBooking';
import { isViewingsConfigured } from '../../../server/viewings';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isViewingsConfigured()) return res.status(503).json({ error: 'not_configured' });

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as Record<
    string,
    unknown
  >;

  // Honeypot, same contract as the contact form: pretend it worked.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json({ error: '' });
  }

  const result = await submitViewingBooking(body, clientIp(req), 'form');
  if (!result.ok) return res.status(result.status).json({ error: result.error });
  return res.status(200).json({ error: '', start: result.start.toISOString() });
}

export default handler;
