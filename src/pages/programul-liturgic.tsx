import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const pageCopy = {
  en: {
    body: 'This page is the next step. The layout will be wired to the three private calendar feeds so today’s events appear first, past events are hidden, and upcoming services follow below.',
    kicker: 'Coming Next',
  },
  es: {
    body: 'Esta página es el siguiente paso. Aquí conectaremos los tres calendarios privados para mostrar primero los eventos de hoy, ocultar los eventos pasados y listar después los próximos servicios.',
    kicker: 'Próximamente',
  },
  ro: {
    body: 'Aceasta este următoarea etapă. Aici vom conecta cele trei calendare private astfel încât evenimentele de astăzi să apară primele, cele trecute să fie ascunse, iar slujbele viitoare să continue mai jos.',
    kicker: 'Urmează',
  },
} as const;

const ProgramulLiturgicPage = () => {
  const { t, i18n } = useTranslation('home');
  const { t: tSeo } = useTranslation('seo');
  const locale = (i18n.language.split('-')[0] as keyof typeof pageCopy) || 'en';
  const copy = pageCopy[locale] ?? pageCopy.en;

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={tSeo('home.title')} description={tSeo('home.description')} />
      <Template topPad>
        <section className="mx-auto max-w-4xl px-4 py-20">
          <span className="eyebrow text-brand-gold">{copy.kicker}</span>
          <h1 className="mt-4 text-4xl text-stone-900 md:text-5xl">
            {t('homepageHub.schedule.titlePrefix')} {t('homepageHub.schedule.titleAccent')}
          </h1>
          <div className="mt-4 h-px w-16 bg-brand-gold" />
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

export default ProgramulLiturgicPage;
