/**
 * Shared contract between the forms and the API routes that receive them. A hidden text field
 * that real users never see, plus how long the form was open before it was submitted: bots fill
 * the field, post without it, or post faster than a person could type.
 */
export const HONEYPOT_FIELD = 'website';
export const HONEYPOT_TIMING_FIELD = 'fillTime';
export const HONEYPOT_MIN_FILL_MS = 2000;

export type HoneypotFields = {
  [HONEYPOT_FIELD]: string;
  [HONEYPOT_TIMING_FIELD]: number;
};
