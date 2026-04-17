import type { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { FilteredGallery } from '../ui/features/FilteredGallery';
import { GALLERY_PHOTOS } from '../utils/Photos';
import { breadcrumbJsonLd } from '../utils/StructuredData';
import { I18N_DEFAULT_LOCALE } from '../utils/i18nConfig';

const GalleryPage = () => {
  const { t } = useTranslation(['seo', 'packages']);
  return (
    <div className="antialiased text-stone-800">
      <Meta
        title={t('seo:gallery.title')}
        description={t('seo:gallery.description')}
        jsonLd={breadcrumbJsonLd([
          { name: t('packages:breadcrumb.home'), path: '/' },
          { name: t('seo:gallery.title'), path: '/gallery' },
        ])}
      />

      <Template topPad>
        <FilteredGallery images={GALLERY_PHOTOS} />
      </Template>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? I18N_DEFAULT_LOCALE, [
      'common',
      'gallery',
      'seo',
      'packages',
      'contact',
    ])),
  },
});

export default GalleryPage;
