import { LEAD_SOURCE_KEYS, type LeadSource } from '../utils/LeadSource';

const MAX_LENGTH = 300;

/** Narrows an untrusted request field to the known lead-source keys, each length-capped. */
export const readLeadSource = (raw: unknown): LeadSource | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const input = raw as Record<string, unknown>;
  const lead: LeadSource = {};
  for (const key of LEAD_SOURCE_KEYS) {
    const value = input[key];
    if (typeof value === 'string' && value.trim()) lead[key] = value.trim().slice(0, MAX_LENGTH);
  }
  return Object.keys(lead).length > 0 ? lead : null;
};

const channel = (lead: LeadSource): string => {
  if (lead.source || lead.medium) {
    const parts = [`${lead.source ?? '?'} / ${lead.medium ?? '?'}`];
    if (lead.campaign) parts.push(lead.campaign);
    return parts.join(' · ');
  }
  if (lead.gclid) return 'google / cpc';
  if (lead.referrer) {
    try {
      return `${new URL(lead.referrer).hostname} / referral`;
    } catch {
      return 'referral';
    }
  }
  return 'direct';
};

/** Rows for the staff notification emails. */
export const leadSourceRows = (lead: LeadSource | null): [string, string][] => {
  if (!lead) return [];
  const rows: [string, string][] = [['Lead source', channel(lead)]];
  if (lead.landingPage) rows.push(['Landing page', lead.landingPage]);
  if (lead.referrer) rows.push(['Referrer', lead.referrer]);
  return rows;
};

/** One line for the calendar entry. */
export const describeLeadSource = (lead: LeadSource | null): string =>
  lead
    ? `Lead source: ${channel(lead)}${lead.landingPage ? ` (landed on ${lead.landingPage})` : ''}`
    : '';
