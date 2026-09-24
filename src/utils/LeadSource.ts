export type LeadSource = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  gclid?: string;
  referrer?: string;
  landingPage?: string;
};

export const LEAD_SOURCE_KEYS: (keyof LeadSource)[] = [
  'source',
  'medium',
  'campaign',
  'term',
  'content',
  'gclid',
  'referrer',
  'landingPage',
];

const STORAGE_KEY = 'fellowship-lead-source';

const QUERY_PARAMS: [string, keyof LeadSource][] = [
  ['utm_source', 'source'],
  ['utm_medium', 'medium'],
  ['utm_campaign', 'campaign'],
  ['utm_term', 'term'],
  ['utm_content', 'content'],
  ['gclid', 'gclid'],
];

/**
 * Records where this session came from, once, on the first page it lands on.
 * Later navigations keep the original value so the lead is attributed to the
 * listing or ad that actually brought the visitor.
 */
export const captureLeadSource = () => {
  if (typeof window === 'undefined') return;
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    const url = new URL(window.location.href);
    const lead: LeadSource = { landingPage: url.pathname };
    for (const [param, key] of QUERY_PARAMS) {
      const value = url.searchParams.get(param)?.trim();
      if (value) lead[key] = value;
    }
    const referrer = document.referrer;
    if (referrer && !referrer.startsWith(url.origin)) lead.referrer = referrer;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lead));
  } catch {
    // Storage can be unavailable in private windows; attribution is best effort.
  }
};

export const getLeadSource = (): LeadSource | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LeadSource) : undefined;
  } catch {
    return undefined;
  }
};
