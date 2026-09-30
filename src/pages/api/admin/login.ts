import type { NextApiRequest, NextApiResponse } from 'next';
import {
  ADMIN_SESSION_SECONDS,
  createSessionValue,
  isAdminConfigured,
  isPasscodeCorrect,
  sessionCookie,
} from '../../../server/adminAuth';
import { clientIp, isRateLimited } from '../../../server/rateLimit';

const ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

const login = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!isAdminConfigured()) return res.status(404).end();
  if (isRateLimited(`admin-login:${clientIp(req)}`, ATTEMPTS, WINDOW_MS)) {
    return res.redirect(303, '/admin/?error=limit');
  }

  const attempt = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
  if (!isPasscodeCorrect(attempt)) return res.redirect(303, '/admin/?error=1');

  res.setHeader('Set-Cookie', sessionCookie(createSessionValue(), ADMIN_SESSION_SECONDS));
  return res.redirect(303, '/admin/');
};

export default login;
