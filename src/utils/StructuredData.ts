import { AppConfig } from './AppConfig';

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: AppConfig.address.street,
  addressLocality: AppConfig.address.city,
  addressRegion: AppConfig.address.region,
  postalCode: AppConfig.address.postalCode,
  addressCountry: AppConfig.address.country,
};

const sameAs = [AppConfig.facebook, AppConfig.instagram, AppConfig.twitter].filter(Boolean);

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/Saint+Mary%27s+Fellowship+Hall/@33.9922444,-83.8865512,17z';

const areaServed = [
  'Dacula, GA',
  'Lawrenceville, GA',
  'Buford, GA',
  'Hoschton, GA',
  'Duluth, GA',
  'Suwanee, GA',
  'Gwinnett County, GA',
  'North Atlanta metropolitan area',
].map((name) => ({ '@type': 'Place', name }));

const openingHoursSpecification = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday'],
    opens: '10:00',
    closes: '23:00',
  },
];

const amenityFeature = [
  { name: 'On-site parking', value: true },
  { name: 'Wi-Fi', value: true },
  { name: 'Sound system', value: true },
  { name: 'Bridal suite', value: true },
  { name: 'Prep kitchen', value: true },
  { name: 'Tables & chairs', value: true },
  { name: 'Wheelchair accessible', value: true },
].map((f) => ({
  '@type': 'LocationFeatureSpecification',
  name: f.name,
  value: f.value,
}));

export const eventVenueJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  '@id': `${AppConfig.url}/#venue`,
  name: AppConfig.site_name,
  description: AppConfig.description,
  url: AppConfig.url,
  image: AppConfig.logo,
  telephone: AppConfig.telephone,
  email: AppConfig.email,
  priceRange: AppConfig.priceRange,
  maximumAttendeeCapacity: 300,
  address: postalAddress,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: AppConfig.geo.latitude,
    longitude: AppConfig.geo.longitude,
  },
  hasMap: GOOGLE_MAPS_URL,
  areaServed,
  openingHoursSpecification,
  amenityFeature,
  sameAs,
});

export const localBusinessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${AppConfig.url}/#business`,
  name: AppConfig.site_name,
  description: AppConfig.description,
  url: AppConfig.url,
  image: AppConfig.logo,
  logo: AppConfig.logo,
  telephone: AppConfig.telephone,
  email: AppConfig.email,
  priceRange: AppConfig.priceRange,
  maximumAttendeeCapacity: 300,
  address: postalAddress,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: AppConfig.geo.latitude,
    longitude: AppConfig.geo.longitude,
  },
  hasMap: GOOGLE_MAPS_URL,
  areaServed,
  openingHoursSpecification,
  amenityFeature,
  parentOrganization: {
    '@type': 'Church',
    name: 'St. Mary Romanian Orthodox Church',
    url: 'https://saintmaryro.org',
  },
  sameAs,
});

type FaqItem = { question: string; answer: string };

export const faqPageJsonLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

type PackageOffer = {
  name: string;
  price: string;
  capacity: number;
  description?: string;
};

export const offerCatalogJsonLd = (offers: PackageOffer[]) => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': `${AppConfig.url}/packages/#catalog`,
  name: `${AppConfig.site_name} — Event Packages`,
  url: `${AppConfig.url}/packages`,
  itemListElement: offers.map((offer, idx) => ({
    '@type': 'Offer',
    '@id': `${AppConfig.url}/packages/#offer-${idx + 1}`,
    name: offer.name,
    description: offer.description,
    priceCurrency: 'USD',
    price: offer.price.replace(/[^\d.]/g, ''),
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: offer.price.replace(/[^\d.]/g, ''),
      priceCurrency: 'USD',
      valueAddedTaxIncluded: false,
    },
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      value: offer.capacity,
      unitText: 'guests',
    },
    availability: 'https://schema.org/InStock',
    itemOffered: {
      '@type': 'Service',
      name: offer.name,
      provider: { '@id': `${AppConfig.url}/#venue` },
    },
  })),
});

type BreadcrumbItem = { name: string; path: string };

export const breadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: `${AppConfig.url}${item.path}`,
  })),
});
