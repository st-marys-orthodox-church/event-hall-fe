import { Check, Info } from '@mui/icons-material';
import type { GetStaticProps } from 'next';
import { Trans, useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Image from 'next/image';
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { WhatsAppButton } from '../ui/components/WhatsAppButton';
import { Section } from '../ui/layout/Section';
import { EVENT_TYPES } from '../utils/Constants';
import { DEPOSIT_INFO, PACKAGE_TIERS } from '../utils/Packages';
import { breadcrumbJsonLd, offerCatalogJsonLd } from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const Packages = () => {
  const { handleOpenModal } = useAppContext();
  const { t } = useTranslation('packages');
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
          <Image
            src="/photos/tier-3.jpg"
            alt={t('hero.imageAlt')}
            fill
            priority
            className="object-cover object-center opacity-55"
            sizes="100vw"
          />
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
                        meta.popular ? 'bg-stone-900 text-white' : 'bg-white hover:bg-stone-100'
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
            <div className="py-10 border-y border-stone-200 text-center">
              <span className="eyebrow text-brand-gold">{t('quickQuote.eyebrow')}</span>
              <h3 className="mt-3 font-display text-2xl md:text-3xl text-stone-900">
                {t('quickQuote.heading')}
              </h3>
              <p className="mt-3 text-stone-600 text-sm max-w-xl mx-auto">
                {t('quickQuote.description')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <WhatsAppButton eventType={EVENT_TYPES.WEDDING} size="medium">
                  {t('quickQuote.weddingButton')}
                </WhatsAppButton>
                <WhatsAppButton
                  eventType={EVENT_TYPES.QUINCEANERA}
                  size="medium"
                  variant="outlined"
                >
                  {t('quickQuote.quinceaneraButton')}
                </WhatsAppButton>
                <WhatsAppButton eventType={EVENT_TYPES.CORPORATE} size="medium" variant="outlined">
                  {t('quickQuote.corporateButton')}
                </WhatsAppButton>
                <WhatsAppButton eventType={EVENT_TYPES.BIRTHDAY} size="medium" variant="outlined">
                  {t('quickQuote.birthdayButton')}
                </WhatsAppButton>
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

            {/* CTA */}
            <div className="text-center py-12">
              <span className="eyebrow text-brand-gold">{t('cta.eyebrow')}</span>
              <h3 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                {t('cta.heading')}
              </h3>
              <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              <p className="mt-5 text-stone-600 max-w-xl mx-auto leading-relaxed">
                {t('cta.body')}
              </p>
              <div className="mt-8">
                <ModernButton
                  buttonVariant="primary"
                  size="large"
                  onClick={() => handleOpenModal()}
                >
                  {t('cta.button')}
                </ModernButton>
              </div>
            </div>
          </div>
        </Section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
      'common',
      'packages',
      'seo',
      'contact',
    ])),
  },
});

export default Packages;
