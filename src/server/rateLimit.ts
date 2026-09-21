import type { NextApiRequest } from 'next';

const hits = new Map<string, number[]>();

export const clientIp = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || req.socket.remoteAddress || 'unknown';
};

/**
 * Sliding-window limiter held in memory, so it is per serverless instance: it slows a single
 * abusive client down, it is not a hard guarantee.
 */
export const isRateLimited = (key: string, limit: number, windowMs: number): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return false;
};
