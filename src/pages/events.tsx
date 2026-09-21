import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { loadUpcomingPublicEvents } from '../server/publicEvents';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { UpcomingEvents } from '../ui/features/UpcomingEvents';
import { fullBleedSrc } from '../utils/CloudflareImages';
import {
  type DisplayEvent,
  EVENTS_REVALIDATE_SECONDS,
  UPCOMING_EVENTS_MONTHS,
  toDisplayEvent,
} from '../utils/Events';
import { breadcrumbJsonLd, eventJsonLd } from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

type Props = { events: DisplayEvent[] };

const EventsPage = ({ events }: Props) => {
  const { t } = useTranslation('events');
  const { t: tSeo } = useTranslation('seo');
  const { t: tPackages } = useTranslation('packages');

  const jsonLd = [
    breadcrumbJsonLd([
      { name: tPackages('breadcrumb.home'), path: '/' },
      { name: t('breadcrumb.events'), path: '/events' },
    ]),
    ...events.map((event) => eventJsonLd(event, t('list.venueFallback'))),
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta title={tSeo('events.title')} description={tSeo('events.description')} jsonLd={jsonLd} />
      <Template topPad>
        <div className="relative bg-stone-900 text-white py-28 md:py-36 overflow-hidden">
          <Image
            src={fullBleedSrc(
              'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/8a183893-5d18-481b-8e88-8e3774d05e00/public'
            )}
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
            <span className="eyebrow text-brand-gold-ink">{t('hero.eyebrow')}</span>
            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight drop-shadow-lg">
              {t('hero.heading')}
            </h1>
            <div className="mx-auto mt-5 w-16 h-px bg-brand-gold" />
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              {t('hero.subheading')}
            </p>
          </div>
        </div>

        <section aria-label={t('hero.heading')} className="py-20 md:py-24 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <UpcomingEvents events={events} variant="full" />
          </div>
        </section>

        <section className="py-20 bg-white border-t border-stone-200">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <span className="eyebrow text-brand-gold-ink">{t('cta.eyebrow')}</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900 leading-tight">
              {t('cta.heading')}
            </h2>
            <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
            <p className="mt-6 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {t('cta.body')}
            </p>
            <div className="mt-10">
              <ModernButton component={Link} href="/packages" buttonVariant="primary" size="large">
                {t('cta.button')}
              </ModernButton>
            </div>
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    events: (await loadUpcomingPublicEvents(UPCOMING_EVENTS_MONTHS)).map((event) =>
      toDisplayEvent(event, locale ?? I18N_DEFAULT_LOCALE)
    ),
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
      'common',
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

export default EventsPage;
