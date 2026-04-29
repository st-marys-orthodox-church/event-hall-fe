import { Check, Info } from '@mui/icons-material';
import type { GetStaticProps } from 'next';
import { Trans, useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Image from 'next/image';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { useScrollParallax } from '../hooks';
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { WhatsAppButton } from '../ui/components/WhatsAppButton';
import { AvailabilityCalendar } from '../ui/features/AvailabilityCalendar';
import { Section } from '../ui/layout/Section';
import { EVENT_TYPES } from '../utils/Constants';
import { DEPOSIT_INFO, PACKAGE_TIERS } from '../utils/Packages';
import { breadcrumbJsonLd, offerCatalogJsonLd } from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const Packages = () => {
  const { handleOpenModal } = useAppContext();
  const { t } = useTranslation('packages');
  const { t: tHome } = useTranslation('home');
  const { ref: heroRef, offset: heroOffset } = useScrollParallax<HTMLDivElement>({
    speed: 0.3,
    max: 180,
  });
  const { ref: quoteImgRef, offset: quoteImgOffset } = useScrollParallax<HTMLDivElement>({
    speed: 0.2,
    max: 160,
  });
  const { ref: ctaRef, offset: ctaOffset } = useScrollParallax<HTMLDivElement>({
    speed: 0.3,
    max: 180,
  });
  const { t: tSeo } = useTranslation('seo');

  const tiers = t('pricingTable.tiers', { returnObjects: true }) as Array<{
    capacity: string;
    price: string;
  }>;
  const includedItems = t('included.items', { returnObjects: true }) as string[];

  const jsonLd = [
    offerCatalogJsonLd(
      tiers.map((tier) => ({
        name: `${tier.capacity} ${tSeo('structuredData.packageSuffix')}`,
        price: tier.price,
        capacity: Number.parseInt(tier.capacity, 10),
        description: tSeo('structuredData.packageDescription', {
          capacity: tier.capacity.toLowerCase(),
        }),
      })),
      tSeo('structuredData.offerCatalogName')
    ),
    breadcrumbJsonLd([
      { name: t('breadcrumb.home'), path: '/' },
      { name: t('breadcrumb.packages'), path: '/packages' },
    ]),
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta
        title={tSeo('packages.title')}
        description={tSeo('packages.description')}
        jsonLd={jsonLd}
      />
      <Template topPad>
        {/* Header */}
        <div className="relative bg-stone-900 text-white py-28 md:py-36 overflow-hidden">
          <div ref={heroRef} className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-y-20 inset-x-0 will-change-transform"
              style={{ transform: `translate3d(0, ${heroOffset}px, 0)` }}
            >
              <Image
                src="https://i.ibb.co/hx3FtCqj/hf-20260429-052734-58410ebd-b2e2-4f9b-974e-4aa316a2b668.png"
                alt={t('hero.imageAlt')}
                fill
                priority
                className="object-cover object-center opacity-55"
                sizes="100vw"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/50 to-stone-900/80" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/25 via-transparent to-brand-gold/15" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="eyebrow text-brand-gold">{t('hero.eyebrow')}</span>
            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight drop-shadow-lg">
              {t('hero.heading')}
            </h1>
            <div className="mx-auto mt-5 w-16 h-px bg-brand-gold" />
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              {t('hero.subheading')}
            </p>
          </div>
        </div>

        <Section>
          <div className="max-w-6xl mx-auto space-y-24">
            {/* Pricing Table */}
            <div>
              <div className="text-center mb-10">
                <span className="eyebrow text-brand-gold">{t('pricingTable.eyebrow')}</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                  {t('pricingTable.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-stone-200">
                {PACKAGE_TIERS.map((meta) => {
                  const tier = tiers[meta.index];
                  if (!tier) return null;
                  return (
                    <div
                      key={meta.index}
                      className={`relative flex flex-col items-center justify-center px-6 pb-8 text-center border-r border-b border-stone-200 transition-colors duration-500 ease-refined ${
                        meta.popular
                          ? 'bg-stone-900 text-white pt-10'
                          : 'bg-white hover:bg-stone-100'
                      }`}
                    >
                      <div className="h-7 flex items-center justify-center">
                        {meta.popular && (
                          <span className="eyebrow text-brand-gold text-[0.625rem]">
                            {t('pricingTable.mostPopular')}
                          </span>
                        )}
                      </div>
                      <div
                        className={`eyebrow mb-4 ${
                          meta.popular ? 'text-white/60' : 'text-stone-500'
                        }`}
                      >
                        {tier.capacity}
                      </div>
                      <div
                        className={`font-display text-4xl md:text-5xl font-medium ${
                          meta.popular ? 'text-white' : 'text-brand-green'
                        }`}
                      >
                        {tier.price}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* What's Included */}
            <div>
              <div className="text-center mb-10">
                <span className="eyebrow text-brand-gold">{t('included.eyebrow')}</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                  {t('included.heading')}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {includedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-4 border-b border-stone-200"
                  >
                    <Check className="w-5 h-5 text-brand-gold flex-shrink-0" />
                    <span className="text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Quick Quote */}
            <div className="relative flex flex-col lg:flex-row items-stretch gap-8 lg:gap-16 py-10 lg:py-14 border-t border-stone-200">
              {/* Image */}
              <div className="w-full lg:w-1/2 lg:order-2">
                <div
                  ref={quoteImgRef}
                  className="relative group overflow-hidden h-72 lg:h-full lg:min-h-[480px] shadow-luxe"
                >
                  <div
                    className="absolute -inset-y-16 inset-x-0 will-change-transform"
                    style={{ transform: `translate3d(0, ${quoteImgOffset}px, 0)` }}
                  >
                    <Image
                      src="https://i.ibb.co/0RmJx4CP/hf-20260429-052729-4f79efd2-f270-49eb-9e17-4ff0aaef050c.png"
                      alt={t('quickQuote.imageAlt')}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1200ms] ease-refined group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 lg:order-1 flex flex-col justify-center gap-6">
                <div className="space-y-3">
                  <span className="eyebrow text-brand-gold">{t('quickQuote.eyebrow')}</span>
                  <h3 className="font-display text-4xl lg:text-5xl text-stone-900 leading-tight">
                    {t('quickQuote.heading')}
                  </h3>
                  <p className="text-stone-600 text-lg leading-relaxed max-w-xl">
                    {t('quickQuote.description')}
                  </p>
                </div>
                <div className="flex flex-col gap-3 max-w-sm">
                  <WhatsAppButton eventType={EVENT_TYPES.WEDDING} size="large" fullWidth>
                    {t('quickQuote.weddingButton')}
                  </WhatsAppButton>
                  <WhatsAppButton
                    eventType={EVENT_TYPES.QUINCEANERA}
                    size="large"
                    variant="outlined"
                    fullWidth
                  >
                    {t('quickQuote.quinceaneraButton')}
                  </WhatsAppButton>
                  <WhatsAppButton
                    eventType={EVENT_TYPES.CORPORATE}
                    size="large"
                    variant="outlined"
                    fullWidth
                  >
                    {t('quickQuote.corporateButton')}
                  </WhatsAppButton>
                  <WhatsAppButton
                    eventType={EVENT_TYPES.BIRTHDAY}
                    size="large"
                    variant="outlined"
                    fullWidth
                  >
                    {t('quickQuote.birthdayButton')}
                  </WhatsAppButton>
                </div>
              </div>
            </div>

            {/* Deposits Info */}
            <div className="flex items-start gap-6 pl-6 border-l-2 border-brand-gold">
              <div className="flex-shrink-0">
                <Info className="w-6 h-6 text-brand-gold" />
              </div>
              <div className="space-y-4">
                <span className="eyebrow text-brand-gold">{t('deposits.eyebrow')}</span>
                <h3 className="font-display text-2xl text-stone-900">{t('deposits.heading')}</h3>
                <p className="text-stone-700 leading-relaxed">
                  <Trans
                    t={t}
                    i18nKey="deposits.body"
                    values={{
                      damage: DEPOSIT_INFO.damageDeposit,
                      cleaning: DEPOSIT_INFO.cleaningDeposit,
                    }}
                    components={{
                      1: <span className="font-semibold" />,
                      3: <span className="font-semibold" />,
                    }}
                  />
                </p>
                <p className="text-sm text-stone-500 italic leading-relaxed">
                  {t('deposits.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Availability Calendar */}
        <section
          id="availability"
          aria-labelledby="availability-heading"
          className="py-24 bg-stone-50"
        >
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold">{tHome('availability.eyebrow')}</span>
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
            </AnimationOnScroll>
            <AvailabilityCalendar onDateSelect={handleOpenModal} />
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-28 text-white overflow-hidden mt-12">
          <div ref={ctaRef} className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-y-20 inset-x-0 will-change-transform"
              style={{ transform: `translate3d(0, ${ctaOffset}px, 0)` }}
            >
              <Image
                src="https://i.ibb.co/JjsS7wDn/hf-20260429-052749-a8a99f87-5229-435e-8b3a-335908b7d3cf.png"
                alt={t('cta.imageAlt')}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 via-transparent to-brand-gold/15 z-[1]" />

          <div className="relative z-[2] max-w-3xl mx-auto px-6 text-center">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <span className="eyebrow text-brand-gold">{t('cta.eyebrow')}</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
                {t('cta.heading')}
              </h2>
              <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
                {t('cta.body')}
              </p>
              <div className="mt-10">
                <ModernButton
                  buttonVariant="secondary"
                  size="large"
                  onClick={() => handleOpenModal()}
                >
                  {t('cta.button')}
                </ModernButton>
              </div>
            </AnimationOnScroll>
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

export default Packages;
