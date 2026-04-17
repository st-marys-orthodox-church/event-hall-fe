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

const AMENITY_KEYS = [
  'parking',
  'wifi',
  'sound',
  'bridal',
  'kitchen',
  'furniture',
  'accessibility',
] as const;

export type StructuredDataCopy = {
  siteName: string;
  description: string;
  areaServed: string[];
  amenities: Record<(typeof AMENITY_KEYS)[number], string>;
  offerCatalogName: string;
};

const buildAmenityFeature = (copy: StructuredDataCopy) =>
  AMENITY_KEYS.map((key) => ({
    '@type': 'LocationFeatureSpecification',
    name: copy.amenities[key],
    value: true,
  }));

const buildAreaServed = (copy: StructuredDataCopy) =>
  copy.areaServed.map((name) => ({ '@type': 'Place', name }));

export const eventVenueJsonLd = (copy: StructuredDataCopy) => ({
  '@context': 'https://schema.org',
  '@type': 'EventVenue',
  '@id': `${AppConfig.url}/#venue`,
  name: copy.siteName,
  description: copy.description,
  url: AppConfig.url,
  image: AppConfig.ogImage,
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
  areaServed: buildAreaServed(copy),
  openingHoursSpecification,
  amenityFeature: buildAmenityFeature(copy),
  sameAs,
});

export const localBusinessJsonLd = (copy: StructuredDataCopy) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${AppConfig.url}/#business`,
  name: copy.siteName,
  description: copy.description,
  url: AppConfig.url,
  image: AppConfig.ogImage,
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
  areaServed: buildAreaServed(copy),
  openingHoursSpecification,
  amenityFeature: buildAmenityFeature(copy),
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

export const offerCatalogJsonLd = (offers: PackageOffer[], offerCatalogName: string) => ({
  '@context': 'https://schema.org',
  '@type': 'OfferCatalog',
  '@id': `${AppConfig.url}/packages/#catalog`,
  name: offerCatalogName,
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
