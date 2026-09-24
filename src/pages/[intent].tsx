import type { GetStaticPaths, GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollParallax } from '../hooks';
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { Reveal } from '../ui/components/Reveal';
import { WhatsAppButton } from '../ui/components/WhatsAppButton';
import { Faq } from '../ui/features/Faq';
import { Section } from '../ui/layout/Section';
import { fullBleedSrc } from '../utils/CloudflareImages';
import { INTENTS, type Intent, findIntent, intentPhotos } from '../utils/Intents';
import { breadcrumbJsonLd, eventServicesJsonLd, faqPageJsonLd } from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE, I18N_LOCALES } from '../utils/i18nConfig';

const GLANCE_KEYS = ['capacity', 'price', 'space', 'location'] as const;
const HIGHLIGHT_DELAYS = [0, 120, 240];
// The outlined WhatsApp green reads as near-black on the dark hero photo.
const HERO_WHATSAPP_SX = {
  color: '#ffffff',
  borderColor: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    color: '#ffffff',
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
};

type Props = { slug: string };

const IntentPage = ({ slug }: Props) => {
  const intent = findIntent(slug) as Intent;
  const { t } = useTranslation('intents');
  const { t: tSeo } = useTranslation('seo');
  const { t: tPackages } = useTranslation('packages');
  const { t: tGallery } = useTranslation('gallery');
  const { t: tCommon } = useTranslation('common');
  const { handleOpenViewing } = useAppContext();
  const { ref: heroRef, offset: heroOffset } = useScrollParallax<HTMLDivElement>({
    speed: 0.3,
    max: 180,
  });

  const k = intent.key;
  const paragraphs = t(`${k}.intro.paragraphs`, { returnObjects: true }) as string[];
  const highlights = t(`${k}.highlights`, { returnObjects: true }) as Array<{
    title: string;
    body: string;
  }>;
  const faqItems = t(`${k}.faq.items`, { returnObjects: true }) as Array<{
    question: string;
    answer: string;
  }>;
  const photos = intentPhotos(intent);
  const related = INTENTS.filter((other) => other.key !== k);

  const jsonLd = [
    breadcrumbJsonLd([
      { name: tPackages('breadcrumb.home'), path: '/' },
      { name: tCommon(`footer.occasions.${k}`), path: `/${intent.slug}` },
    ]),
    ...eventServicesJsonLd(
      [
        {
          key: k,
          name: tSeo(`structuredData.services.${k}.name`),
          description: tSeo(`structuredData.services.${k}.description`),
        },
      ],
      tSeo('structuredData.areaServed', { returnObjects: true }) as string[]
    ),
    faqPageJsonLd(faqItems),
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta
        title={tSeo(`intents.${k}.title`)}
        description={tSeo(`intents.${k}.description`)}
        ogImage={fullBleedSrc(intent.heroImage)}
        ogImageAlt={t(`${k}.hero.imageAlt`)}
        jsonLd={jsonLd}
      />
      <Template topPad>
        <div className="relative bg-stone-900 text-white py-28 md:py-36 overflow-hidden">
          <div ref={heroRef} className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -inset-y-20 inset-x-0 will-change-transform"
              style={{ transform: `translate3d(0, ${heroOffset}px, 0)` }}
            >
              <Image
                src={fullBleedSrc(intent.heroImage)}
                alt={t(`${k}.hero.imageAlt`)}
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
            <span className="eyebrow text-brand-gold-ink">{t(`${k}.hero.eyebrow`)}</span>
            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight drop-shadow-lg">
              {t(`${k}.hero.heading`)}
            </h1>
            <div className="mx-auto mt-5 w-16 h-px bg-brand-gold" />
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              {t(`${k}.hero.subheading`)}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <ModernButton
                buttonVariant="primary"
                size="large"
                onClick={() => handleOpenViewing()}
              >
                {t('shared.bookViewing')}
              </ModernButton>
              <WhatsAppButton
                eventType={intent.eventType}
                size="large"
                variant="outlined"
                sx={HERO_WHATSAPP_SX}
              >
                {t('shared.askWhatsapp')}
              </WhatsAppButton>
            </div>
          </div>
        </div>

        <Section yPadding="py-20 md:py-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <Reveal variant="fade">
                <span className="eyebrow text-brand-gold-ink">{t(`${k}.intro.eyebrow`)}</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900 leading-tight">
                  {t(`${k}.intro.heading`)}
                </h2>
                <div className="mt-4 w-12 h-px bg-brand-gold" />
                <div className="mt-6 space-y-5 text-stone-600 text-lg leading-relaxed">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="lg:col-span-2">
              <Reveal delay={120}>
                <dl className="border border-stone-200 bg-white divide-y divide-stone-200">
                  {GLANCE_KEYS.map((glance) => (
                    <div key={glance} className="px-6 py-5">
                      <dt className="eyebrow text-stone-500">{t(`shared.glance.${glance}`)}</dt>
                      <dd className="mt-2 font-display text-2xl text-stone-900">
                        {t(`shared.glanceValues.${glance}`)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </Section>

        <section className="py-20 bg-stone-100 border-y border-stone-200/80">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights.map((item, index) => (
                <Reveal key={item.title} delay={HIGHLIGHT_DELAYS[index] ?? 0}>
                  <div className="h-full bg-white border border-stone-200 p-8">
                    <div className="w-8 h-px bg-brand-gold" />
                    <h3 className="mt-5 font-display text-2xl text-stone-900">{item.title}</h3>
                    <p className="mt-3 text-stone-600 leading-relaxed">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Section yPadding="py-20 md:py-24">
          <div className="max-w-6xl mx-auto">
            <Reveal variant="fade">
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold-ink">{t('shared.galleryEyebrow')}</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                  {t(`${k}.galleryHeading`)}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {photos.map((photo, index) => (
                <Reveal key={photo.altKey} delay={(index % 3) * 100}>
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    <Image
                      src={photo.src}
                      alt={tGallery(`photos.${photo.altKey}`)}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-refined group-hover:scale-[1.04]"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/gallery"
                className="eyebrow text-brand-green-ink hover:text-brand-green-deep transition-colors"
              >
                {tGallery('viewAll')} →
              </Link>
            </div>
          </div>
        </Section>

        <section className="py-20 bg-stone-900 text-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Reveal variant="fade">
              <span className="eyebrow text-brand-gold">{t('shared.packagesEyebrow')}</span>
              <h2 className="mt-3 font-display text-3xl md:text-4xl leading-tight">
                {t('shared.packagesHeading')}
              </h2>
              <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              <p className="mt-6 text-lg text-white/75 leading-relaxed">{t(`${k}.packagesBody`)}</p>
              <div className="mt-8">
                <ModernButton
                  component={Link}
                  href="/packages"
                  buttonVariant="secondary"
                  size="large"
                >
                  {t('shared.packagesButton')}
                </ModernButton>
              </div>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="intent-faq-heading" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <Reveal variant="fade">
              <div className="text-center mb-12">
                <span className="eyebrow text-brand-gold-ink">{t('shared.faqEyebrow')}</span>
                <h2
                  id="intent-faq-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  {t(`${k}.faq.heading`)}
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
              </div>
            </Reveal>
            <Faq ns="intents" itemsKey={`${k}.faq.items`} />
          </div>
        </section>

        <section className="py-16 bg-stone-50 border-t border-stone-200/80">
          <div className="max-w-6xl mx-auto px-4">
            <span className="eyebrow text-stone-500">{t('shared.relatedTitle')}</span>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {related.map((other) => (
                <li key={other.key}>
                  <Link
                    href={`/${other.slug}`}
                    className="font-display text-2xl text-stone-900 hover:text-brand-green transition-colors"
                  >
                    {tCommon(`footer.occasions.${other.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative py-24 bg-brand-green-deep text-white text-center">
          <div className="max-w-3xl mx-auto px-6">
            <Reveal variant="fade">
              <span className="eyebrow text-brand-gold">{t('shared.ctaEyebrow')}</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
                {t('shared.ctaHeading')}
              </h2>
              <p className="mt-6 text-lg text-white/80 leading-relaxed">{t('shared.ctaBody')}</p>
              <div className="mt-10">
                <ModernButton
                  buttonVariant="secondary"
                  size="large"
                  onClick={() => handleOpenViewing()}
                >
                  {t('shared.bookViewing')}
                </ModernButton>
              </div>
            </Reveal>
          </div>
        </section>
      </Template>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: I18N_LOCALES.flatMap((locale) =>
    INTENTS.map((intent) => ({ params: { intent: intent.slug }, locale }))
  ),
  // Unknown slugs fall through to getStaticProps, which 404s in the request's
  // locale; `false` would serve the default-locale 404 instead.
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<Props> = async ({ locale, params }) => {
  const slug = typeof params?.intent === 'string' ? params.intent : '';
  if (!findIntent(slug)) return { notFound: true };
  return {
    props: {
      slug,
      ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
        'common',
        'intents',
        'seo',
        'packages',
        'gallery',
        'contact',
        'viewing',
        'chat',
      ])),
    },
  };
};

export default IntentPage;
