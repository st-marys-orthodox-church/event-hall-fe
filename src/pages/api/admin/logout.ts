import type { NextApiRequest, NextApiResponse } from 'next';
import { sessionCookie } from '../../../server/adminAuth';

const logout = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  res.setHeader('Set-Cookie', sessionCookie('', 0));
  return res.redirect(303, '/admin/');
};

export default logout;
