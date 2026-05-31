import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { Hero } from '../ui/features/Hero';
import { ParishHomepageHub } from '../ui/features/ParishHomepageHub';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const Index = () => {
  const { t: tSeo } = useTranslation('seo');

  return (
    <div className="bg-stone-50 text-stone-800 antialiased">
      <Meta title={tSeo('home.title')} description={tSeo('home.description')} />

      <Template>
        <Hero />
        <ParishHomepageHub />
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
