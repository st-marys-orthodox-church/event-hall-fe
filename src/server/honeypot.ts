import { HONEYPOT_FIELD, HONEYPOT_MIN_FILL_MS, HONEYPOT_TIMING_FIELD } from '../utils/Honeypot';

type Options = { form: string; minFillMs?: number };

const tripReason = (body: Record<string, unknown>, minFillMs: number): string | null => {
  const field = body[HONEYPOT_FIELD];
  if (typeof field !== 'string') return 'field missing';
  if (field.length > 0) return 'field filled';
  const fillTime = body[HONEYPOT_TIMING_FIELD];
  if (typeof fillTime !== 'number' || !Number.isFinite(fillTime)) return 'timing missing';
  if (fillTime < minFillMs) return `submitted in ${Math.round(fillTime)}ms`;
  return null;
};

/**
 * True when a submission looks automated. Callers answer as if it succeeded so the bot has
 * nothing to learn from; the drop is logged so the traffic stays visible in the host logs.
 */
export const isHoneypotTripped = (
  body: Record<string, unknown>,
  { form, minFillMs = HONEYPOT_MIN_FILL_MS }: Options
): boolean => {
  const reason = tripReason(body, minFillMs);
  if (reason) console.info(`honeypot: dropped ${form} submission (${reason})`);
  return reason !== null;
};
