import { isRateLimited } from '../rateLimit';

const DAY_MS = 24 * 60 * 60 * 1000;
const CALLS_PER_VISITOR_PER_DAY = 3;
// A person manages a turn every few seconds at most; past this it is not a conversation.
const TURNS_PER_CALL = 80;

export type CallRefusal = 'rate_limited' | 'busy';

/*
 * Voice is billed by the minute, so calls are capped per visitor and across the site. The
 * counters live in memory like the rest of the rate limiting, which makes the site-wide cap a
 * per-instance one: it bounds a runaway, it is not an exact budget. The hard bound on any single
 * call is the room token's expiry.
 */
export const refuseCall = (ip: string, dailyCap: number): CallRefusal | null => {
  if (isRateLimited(`voice:${ip}`, CALLS_PER_VISITOR_PER_DAY, DAY_MS)) return 'rate_limited';
  if (isRateLimited('voice:all', dailyCap, DAY_MS)) return 'busy';
  return null;
};

export const isCallOverTurns = (roomId: string): boolean =>
  isRateLimited(`voice-turns:${roomId}`, TURNS_PER_CALL, DAY_MS);
