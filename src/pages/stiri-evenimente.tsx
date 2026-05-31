import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const pageCopy = {
  en: {
    body: 'This page will become the Facebook-powered parish news feed, with imported photos, AI-generated titles, repost support, and live-video posts filtered out.',
    kicker: 'Coming Next',
  },
  es: {
    body: 'Esta página será el feed parroquial conectado a Facebook, con fotos importadas, títulos generados por IA, soporte para republicaciones y exclusión de publicaciones en vivo.',
    kicker: 'Próximamente',
  },
  ro: {
    body: 'Această pagină va deveni fluxul parohial conectat la Facebook, cu fotografii importate, titluri generate cu AI, suport pentru repostări și excluderea transmisiunilor live.',
    kicker: 'Urmează',
  },
} as const;

const StiriEvenimentePage = () => {
  const { t, i18n } = useTranslation('home');
  const { t: tSeo } = useTranslation('seo');
  const locale = (i18n.language.split('-')[0] as keyof typeof pageCopy) || 'en';
  const copy = pageCopy[locale] ?? pageCopy.en;

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={tSeo('home.title')} description={tSeo('home.description')} />
      <Template topPad>
        <section className="mx-auto max-w-4xl px-4 py-20">
          <span className="eyebrow text-brand-green">{copy.kicker}</span>
          <h1 className="mt-4 text-4xl text-stone-900 md:text-5xl">
            {t('homepageHub.news.titlePrefix')} {t('homepageHub.news.titleAccent')}
          </h1>
          <div className="mt-4 h-px w-16 bg-brand-green" />
          <p className="mt-8 max-w-3xl text-lg leading-8 text-stone-600">{copy.body}</p>
        </section>
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, ['common', 'home', 'seo'])),
  },
});

export default StiriEvenimentePage;
