import { Email, LocationOn, Phone, Schedule } from '@mui/icons-material';
import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Link from 'next/link';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { Faq } from '../ui/features/Faq';
import { Hero } from '../ui/features/Hero';
import { PackagesShowcase } from '../ui/features/PackagesShowcase';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { AppConfig } from '../utils/AppConfig';
import { STATS_ITEMS, TRUST_BADGES } from '../utils/Features';
import { PACKAGES } from '../utils/Packages';
import {
  type StructuredDataCopy,
  eventVenueJsonLd,
  faqPageJsonLd,
  localBusinessJsonLd,
  offerCatalogJsonLd,
} from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const STAT_ANIMATION_DELAYS = [0, 150, 300];

const Index = () => {
  const { t: tHome } = useTranslation('home');
  const { t: tSeo } = useTranslation('seo');
  const { t: tPackages } = useTranslation('packages');

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

  const jsonLd = [
    localBusinessJsonLd(structuredDataCopy),
    eventVenueJsonLd(structuredDataCopy),
    offerCatalogJsonLd(
      PACKAGES.map((p) => ({
        name: tPackages(`tiers.${p.key}.title`),
        price: tPackages(`tiers.${p.key}.price`),
        capacity: Number.parseInt(tPackages(`tiers.${p.key}.capacity`), 10),
        description: tPackages(`tiers.${p.key}.description`),
      })),
      structuredDataCopy.offerCatalogName
    ),
    faqPageJsonLd(faqItems),
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
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-14">
                <span className="eyebrow text-brand-gold">{tHome('stats.eyebrow')}</span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900">
                  {tHome('stats.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  {tHome('stats.subheading')}
                </p>
              </div>
            </AnimationOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300/70 max-w-4xl mx-auto">
              {STATS_ITEMS.map((stat, index) => (
                <AnimationOnScroll
                  key={stat.key}
                  animateIn="animate__fadeInUp"
                  delay={STAT_ANIMATION_DELAYS[index] ?? 0}
                  animateOnce
                >
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
                </AnimationOnScroll>
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
        </section>

        {/* Packages Section */}
        <PackagesShowcase packages={PACKAGES} />

        {/* CTA Banner */}
        <section className="relative py-24 bg-stone-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/25 via-transparent to-brand-gold/20" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <span className="eyebrow text-brand-gold">{tHome('cta.eyebrow')}</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
                {tHome('cta.heading')}
              </h2>
              <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
                {tHome('cta.body')}
              </p>
              <div className="mt-10">
                <ModernButton
                  component={Link}
                  href="/packages"
                  buttonVariant="secondary"
                  size="large"
                >
                  {tHome('cta.button')}
                </ModernButton>
              </div>
            </AnimationOnScroll>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.key} className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center border border-stone-200">
                      <badge.Icon
                        className={`w-7 h-7 ${
                          badge.iconTone === 'green' ? 'text-brand-green' : 'text-brand-gold'
                        }`}
                      />
                    </div>
                    <h3 className="font-display text-2xl text-stone-900">
                      {tHome(`trustBadges.${badge.key}.title`)}
                    </h3>
                    <p className="text-stone-600 max-w-xs">
                      {tHome(`trustBadges.${badge.key}.text`)}
                    </p>
                  </div>
                ))}
              </div>
            </AnimationOnScroll>
          </div>
        </div>

        {/* Visit Us */}
        <section aria-labelledby="visit-us-heading" className="py-20 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-14">
                <span className="eyebrow text-brand-gold">{tHome('visit.eyebrow')}</span>
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
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow text-brand-green hover:text-brand-green-dark transition-colors mt-1"
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
                </div>
              </div>
            </AnimationOnScroll>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold">{tHome('faq.eyebrow')}</span>
                <h2
                  id="faq-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  {tHome('faq.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
                <p className="mt-5 text-stone-600">{tHome('faq.subheading')}</p>
              </div>
            </AnimationOnScroll>
            <Faq />
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
      'common',
      'home',
      'packages',
      'seo',
      'contact',
    ])),
  },
});

export default Index;
