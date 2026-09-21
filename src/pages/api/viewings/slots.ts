import type { NextApiRequest, NextApiResponse } from 'next';
import { isViewingsConfigured, loadOpenViewingDays } from '../../../server/viewings';
import type { ViewingSlotsResponse } from '../../../utils/Viewings';

async function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (!isViewingsConfigured()) {
    return res.status(503).json({ error: 'not_configured' });
  }

  try {
    const body: ViewingSlotsResponse = { days: await loadOpenViewingDays() };
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(body);
  } catch (err) {
    console.error('viewings: failed to load slots', err);
    return res.status(502).json({ error: 'failed' });
  }
}

export default handler;
