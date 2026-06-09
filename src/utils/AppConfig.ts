// Non-display configuration. All user-facing copy (site name, titles, descriptions,

import { PHONE_NUMBER, SOCIALS } from './Constants';

// OG alt text, meta descriptions) lives in public/locales/{locale}/seo.json.
export const AppConfig = {
  defaultLocale: 'en',
  url: 'https://events.saintmaryro.org',
  logo: 'https://events.saintmaryro.org/logos/logo.jpg',
  ogImage: 'https://events.saintmaryro.org/og-image.jpg',
  themeColor: '#7c9885',
  instagram: SOCIALS.IG,
  twitter: '',
  facebook: SOCIALS.FB,
  googleBusinessProfile: 'https://maps.app.goo.gl/XMYyAKG9XSL24X259',
  telephone: PHONE_NUMBER,
  email: 'events@saintmaryro.org',
  address: {
    street: '2875 Winder Hwy',
    city: 'Dacula',
    region: 'GA',
    postalCode: '30019',
    country: 'US',
  },
  geo: {
    latitude: 33.99224442833723,
    longitude: -83.88655118493534,
  },
  priceRange: '$2000-$4000',
};
