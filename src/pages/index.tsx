import { Email, LocationOn, Phone, Schedule } from '@mui/icons-material';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollParallax } from '../hooks';
import { loadUpcomingPublicEvents } from '../server/publicEvents';
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { Reveal } from '../ui/components/Reveal';
import { AvailabilityCalendar } from '../ui/features/AvailabilityCalendar';
import { Faq } from '../ui/features/Faq';
import { Hero } from '../ui/features/Hero';
import { PackagesShowcase } from '../ui/features/PackagesShowcase';
import { Reviews } from '../ui/features/Reviews';
import { UpcomingEvents } from '../ui/features/UpcomingEvents';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { AppConfig } from '../utils/AppConfig';
import { fullBleedSrc } from '../utils/CloudflareImages';
import {
  type DisplayEvent,
  EVENTS_REVALIDATE_SECONDS,
  HOME_UPCOMING_EVENTS_LIMIT,
  UPCOMING_EVENTS_MONTHS,
  toDisplayEvent,
} from '../utils/Events';
import { STATS_ITEMS } from '../utils/Features';
import { PACKAGES } from '../utils/Packages';
import { REVIEWS } from '../utils/Reviews';
import {
  type StructuredDataCopy,
  type StructuredReview,
  breadcrumbJsonLd,
  eventServicesJsonLd,
  eventVenueJsonLd,
  faqPageJsonLd,
  localBusinessJsonLd,
  offerCatalogJsonLd,
} from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const STAT_ANIMATION_DELAYS = [0, 150, 300];

type Props = { events: DisplayEvent[] };

const Index = ({ events }: Props) => {
  const { t: tHome } = useTranslation('home');
  const { t: tSeo } = useTranslation('seo');
  const { t: tPackages } = useTranslation('packages');
  const { t: tViewing } = useTranslation('viewing');
  const { handleOpenModal, handleOpenViewing } = useAppContext();
  const { ref: ctaRef, offset: ctaOffset } = useScrollParallax<HTMLDivElement>({
    speed: 0.3,
    max: 180,
  });

  const structuredDataCopy: StructuredDataCopy = {
    siteName: tSeo('siteName'),
    description: tSeo('siteDescription'),
    areaServed: tSeo('structuredData.areaServed', { returnObjects: true }) as string[],
    amenities: tSeo('structuredData.amenities', {
      returnObjects: true,
    }) as StructuredDataCopy['amenities'],
    offerCatalogName: tSeo('structuredData.offerCatalogName'),
  };

  const faqItems = tHome('faq.items', { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;

  const structuredReviews: StructuredReview[] = REVIEWS.map((review) => ({
    author: tHome(`reviews.items.${review.key}.name`),
    reviewBody: tHome(`reviews.items.${review.key}.text`),
    datePublished: review.datePublished,
    rating: review.rating,
  }));

  const eventServiceKeys = ['wedding', 'quinceanera', 'corporate', 'birthday'] as const;
  const services = eventServiceKeys.map((key) => ({
    key,
    name: tSeo(`structuredData.services.${key}.name`),
    description: tSeo(`structuredData.services.${key}.description`),
  }));

  const jsonLd = [
    localBusinessJsonLd(structuredDataCopy, structuredReviews),
    eventVenueJsonLd(structuredDataCopy, structuredReviews),
    offerCatalogJsonLd(
      PACKAGES.map((p) => ({
        name: tPackages(`tiers.${p.key}.title`),
        price: tPackages(`tiers.${p.key}.price`),
        capacity: Number.parseInt(tPackages(`tiers.${p.key}.capacity`), 10),
        description: tPackages(`tiers.${p.key}.description`),
      })),
      structuredDataCopy.offerCatalogName
    ),
    ...eventServicesJsonLd(services, structuredDataCopy.areaServed),
    faqPageJsonLd(faqItems),
    breadcrumbJsonLd([{ name: tPackages('breadcrumb.home'), path: '/' }]),
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta title={tSeo('home.title')} description={tSeo('home.description')} jsonLd={jsonLd} />

      <Template>
        <Hero />

        {/* Features Section */}
        <VerticalFeatures />

        {/* Stats Banner */}
        <section className="relative py-24 bg-stone-100">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          <div className="max-w-5xl mx-auto px-4">
            <Reveal variant="fade">
              <div className="text-center mb-14">
                <span className="eyebrow text-brand-gold-ink">{tHome('stats.eyebrow')}</span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900">
                  {tHome('stats.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  {tHome('stats.subheading')}
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300/70 max-w-4xl mx-auto">
              {STATS_ITEMS.map((stat, index) => (
                <Reveal key={stat.key} delay={STAT_ANIMATION_DELAYS[index] ?? 0}>
                  <NumberDisplay
                    text={tHome(`stats.items.${stat.key}`)}
                    value={tHome(`stats.values.${stat.key}`)}
                    icon={
                      <stat.Icon
                        fontSize="large"
                        className={
                          stat.iconTone === 'green' ? 'text-brand-green' : 'text-brand-gold'
                        }
                      />
                    }
                  />
                </Reveal>
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        </section>

        {/* Packages Section */}
        <PackagesShowcase packages={PACKAGES} />

        {/* Guest Reviews */}
        <Reviews />

        {/* Upcoming church events */}
        {events.length > 0 && (
          <section
            id="events"
            aria-labelledby="events-heading"
            className="py-24 bg-white border-y border-stone-200/80"
          >
            <div className="max-w-6xl mx-auto px-4">
              <Reveal variant="fade">
                <div className="text-center mb-12">
                  <span className="eyebrow text-brand-gold-ink">{tHome('events.eyebrow')}</span>
                  <h2
                    id="events-heading"
                    className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                  >
                    {tHome('events.heading')}
                  </h2>
                  <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                  <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                    {tHome('events.subheading')}
                  </p>
                </div>
              </Reveal>
              <UpcomingEvents events={events} variant="compact" />
              <div className="mt-12 text-center">
                <Link
                  href="/events"
                  className="eyebrow text-brand-green-ink hover:text-brand-green-deep transition-colors"
                >
                  {tHome('events.viewAll')} →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Availability Calendar */}
        <section
          id="availability"
          aria-labelledby="availability-heading"
          className="pb-32 bg-stone-50"
        >
          <div className="max-w-5xl mx-auto px-4">
            <Reveal variant="fade">
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold-ink">{tHome('availability.eyebrow')}</span>
                <h2
                  id="availability-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  {tHome('availability.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  {tHome('availability.subheading')}
                </p>
              </div>
            </Reveal>
            <AvailabilityCalendar onDateSelect={handleOpenModal} />
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative py-28 text-white overflow-hidden">
          {/* Parallax background image */}
          <div ref={ctaRef} className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-y-20 inset-x-0 will-change-transform"
              style={{ transform: `translate3d(0, ${ctaOffset}px, 0)` }}
            >
              <Image
                src={fullBleedSrc(
                  'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/dd2d39a7-a9c3-4518-e2ab-195922a72100/public'
                )}
                alt={tHome('cta.imageAlt')}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-gold/15 z-[1]" />

          <div className="relative z-[2] max-w-3xl mx-auto px-6 text-center">
            <Reveal variant="fade">
              <span className="eyebrow text-brand-gold-ink">{tHome('cta.eyebrow')}</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
                {tHome('cta.heading')}
              </h2>
              <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
                {tHome('cta.body')}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <ModernButton
                  buttonVariant="secondary"
                  size="large"
                  onClick={() => handleOpenViewing()}
                >
                  {tViewing('cta.button')}
                </ModernButton>
                <ModernButton
                  component={Link}
                  href="/packages"
                  buttonVariant="outlineLight"
                  size="large"
                >
                  {tHome('cta.button')}
                </ModernButton>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Visit Us */}
        <section aria-labelledby="visit-us-heading" className="py-20 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <Reveal variant="fade">
              <div className="text-center mb-14">
                <span className="eyebrow text-brand-gold-ink">{tHome('visit.eyebrow')}</span>
                <h2
                  id="visit-us-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  {tHome('visit.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  {tHome('visit.subheading')}
                </p>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-300/70"
                itemScope
                itemType="https://schema.org/EventVenue"
              >
                <meta itemProp="name" content={tSeo('siteName')} />
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <LocationOn className="text-brand-green" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">
                    {tHome('visit.addressTitle')}
                  </h3>
                  <address
                    className="not-italic text-stone-600 leading-relaxed"
                    itemProp="address"
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                  >
                    <span itemProp="streetAddress">{AppConfig.address.street}</span>
                    <br />
                    <span itemProp="addressLocality">{AppConfig.address.city}</span>,{' '}
                    <span itemProp="addressRegion">{AppConfig.address.region}</span>{' '}
                    <span itemProp="postalCode">{AppConfig.address.postalCode}</span>
                  </address>
                  <a
                    href={'https://maps.app.goo.gl/XMYyAKG9XSL24X259'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow text-brand-green-ink hover:text-brand-green-deep transition-colors mt-1"
                  >
                    {tHome('visit.getDirections')}
                  </a>
                </div>
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <Phone className="text-brand-gold" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">
                    {tHome('visit.contactTitle')}
                  </h3>
                  <a
                    href={`tel:${AppConfig.telephone.replace(/[^\d+]/g, '')}`}
                    aria-label={`Call Fellowship Event Hall at ${AppConfig.telephone}`}
                    className="text-stone-600 hover:text-brand-green transition"
                    itemProp="telephone"
                  >
                    {AppConfig.telephone}
                  </a>
                  <a
                    href={`mailto:${AppConfig.email}`}
                    className="text-stone-600 hover:text-brand-green transition inline-flex items-center gap-1"
                    itemProp="email"
                  >
                    <Email fontSize="small" /> {AppConfig.email}
                  </a>
                </div>
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <Schedule className="text-brand-green" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">
                    {tHome('visit.toursTitle')}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">{tHome('visit.toursText')}</p>
                  <ModernButton
                    buttonVariant="outline"
                    size="small"
                    onClick={() => handleOpenViewing()}
                  >
                    {tViewing('cta.button')}
                  </ModernButton>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <Reveal variant="fade">
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold-ink">{tHome('faq.eyebrow')}</span>
                <h2
                  id="faq-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  {tHome('faq.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600">{tHome('faq.subheading')}</p>
              </div>
            </Reveal>
            <Faq />
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    events: (
      await loadUpcomingPublicEvents(UPCOMING_EVENTS_MONTHS, HOME_UPCOMING_EVENTS_LIMIT)
    ).map((event) => toDisplayEvent(event, locale ?? I18N_DEFAULT_LOCALE)),
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
      'common',
      'home',
      'events',
      'packages',
      'seo',
      'contact',
      'viewing',
      'chat',
    ])),
  },
  revalidate: EVENTS_REVALIDATE_SECONDS,
});

export default Index;
