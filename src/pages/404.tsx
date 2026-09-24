import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import Link from 'next/link';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const NotFound = () => {
  const { t } = useTranslation('common');
  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta title={t('notFound.title')} description={t('notFound.body')} noindex />
      <Template topPad>
        <section className="min-h-[60vh] flex items-center py-24">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <span className="eyebrow text-brand-gold-ink">404</span>
            <h1 className="mt-4 font-display text-4xl md:text-5xl text-stone-900 leading-tight">
              {t('notFound.heading')}
            </h1>
            <div className="mx-auto mt-5 w-12 h-px bg-brand-gold" />
            <p className="mt-6 text-lg text-stone-600 leading-relaxed">{t('notFound.body')}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <ModernButton component={Link} href="/" buttonVariant="primary" size="large">
                {t('notFound.home')}
              </ModernButton>
              <ModernButton component={Link} href="/packages" buttonVariant="outline" size="large">
                {t('notFound.packages')}
              </ModernButton>
            </div>
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
      'contact',
      'viewing',
      'chat',
    ])),
  },
});

export default NotFound;
