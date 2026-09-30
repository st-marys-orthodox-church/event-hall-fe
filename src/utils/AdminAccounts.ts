import { AppConfig } from './AppConfig';
import { SOCIALS } from './Constants';

export type AccountCategory = 'Listings and social' | 'Communication' | 'Website';

export type AccountCatalogEntry = {
  id: string;
  name: string;
  category: AccountCategory;
  url: string;
  purpose: string;
};

// Public facts only. Who owns each account is private and comes from ADMIN_DIRECTORY_JSON.
export const ACCOUNT_CATALOG: AccountCatalogEntry[] = [
  {
    id: 'google-business',
    name: 'Google Business Profile',
    category: 'Listings and social',
    url: 'https://business.google.com',
    purpose: 'Maps listing, hours, photos, reviews',
  },
  {
    id: 'yelp',
    name: 'Yelp for Business',
    category: 'Listings and social',
    url: 'https://biz.yelp.com',
    purpose: 'Yelp listing and reviews',
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    category: 'Listings and social',
    url: SOCIALS.FB,
    purpose: 'Posts, messages, event promotion',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Listings and social',
    url: SOCIALS.IG,
    purpose: 'Photos, stories, direct messages',
  },
  {
    id: 'events-mailbox',
    name: AppConfig.email,
    category: 'Communication',
    url: `mailto:${AppConfig.email}`,
    purpose: 'Receives inquiries and booking notices; sends viewing confirmations',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Communication',
    url: `https://wa.me/${AppConfig.telephone.replace(/\D/g, '')}`,
    purpose: `Venue number ${AppConfig.telephone}`,
  },
  {
    id: 'zoho-calendar',
    name: 'Zoho Calendar',
    category: 'Website',
    url: 'https://calendar.zoho.com',
    purpose: 'Booked dates, Viewings calendar, Public Events calendar',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Website',
    url: 'https://vercel.com',
    purpose: 'Hosting, deployments, environment variables',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Website',
    url: 'https://github.com/st-marys-orthodox-church/event-hall-fe',
    purpose: 'Website source code',
  },
  {
    id: 'domain-dns',
    name: 'Domain and DNS',
    category: 'Website',
    url: 'https://events.saintmaryro.org',
    purpose: 'saintmaryro.org registrar and DNS records',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'Website',
    url: 'https://app.sendgrid.com',
    purpose: 'Delivers contact form and viewing emails',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Images',
    category: 'Website',
    url: 'https://dash.cloudflare.com',
    purpose: 'Hosts the site photos',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics and Search Console',
    category: 'Website',
    url: 'https://analytics.google.com',
    purpose: 'Traffic and search performance',
  },
  {
    id: 'gemini',
    name: 'Google AI Studio (Gemini key)',
    category: 'Website',
    url: 'https://aistudio.google.com/apikey',
    purpose: 'Powers the chat assistant',
  },
  {
    id: 'website-support',
    name: 'Website developer contact',
    category: 'Website',
    url: '',
    purpose: 'Who to call when the site or a form breaks',
  },
];

export type AccountRecord = {
  owner?: string;
  backupOwner?: string;
  loginEmail?: string;
  credentialsIn?: string;
  twoFactor?: string;
  reviewedOn?: string;
  notes?: string;
};

export const ACCOUNT_RECORD_FIELDS: (keyof AccountRecord)[] = [
  'owner',
  'backupOwner',
  'loginEmail',
  'credentialsIn',
  'twoFactor',
  'reviewedOn',
  'notes',
];

export type AccountRow = AccountCatalogEntry & { record: AccountRecord };
