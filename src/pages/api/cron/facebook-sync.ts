import type { NextApiRequest, NextApiResponse } from 'next';

const isAuthorized = (req: NextApiRequest) => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  return req.headers.authorization === `Bearer ${cronSecret}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { syncFacebookPosts } = await import('../../../server/facebookSync');
    const { getFacebookPostCount } = await import('../../../server/facebookPostsStore');
    const result = await syncFacebookPosts();

    return res.status(200).json({
      ok: true,
      postCount: getFacebookPostCount(),
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    console.error('facebook-sync failed', error);
    return res.status(500).json({ error: message, ok: false });
  }
}
