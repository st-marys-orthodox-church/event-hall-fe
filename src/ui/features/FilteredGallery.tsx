import { useTranslation } from 'next-i18next/pages';
import { useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  GALLERY_CATEGORY_KEYS,
  type IGalleryCategory,
  type IGalleryImgProps,
} from '../../utils/Photos';
import { Section } from '../layout/Section';

type IFilteredGalleryProps = {
  images: IGalleryImgProps[];
};

export const FilteredGallery = (props: IFilteredGalleryProps) => {
  const { t } = useTranslation('gallery');
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<IGalleryCategory>('all');

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return props.images;
    return props.images.filter((img) => img.category === activeCategory);
  }, [props.images, activeCategory]);

  const photos = useMemo(
    () =>
      filteredImages.map((img) => ({
        src: img.src,
        width: img.width,
        height: img.height,
        alt: t(`photos.${img.altKey}`),
      })),
    [filteredImages, t]
  );

  return (
    <Section title={t('title')} description={t('description')}>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 border-y border-stone-200 py-5">
        {GALLERY_CATEGORY_KEYS.map((categoryKey) => (
          <button
            key={categoryKey}
            type="button"
            onClick={() => setActiveCategory(categoryKey)}
            className={`eyebrow transition-colors duration-300 ease-refined pb-1 border-b ${
              activeCategory === categoryKey
                ? 'text-brand-green border-brand-gold'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            {t(`categories.${categoryKey}`)}
          </button>
        ))}
      </div>

      <div className="text-center mb-8 text-stone-500 text-sm">
        {t('showing', { count: filteredImages.length })}
        {activeCategory !== 'all' &&
          t('inCategory', { category: t(`categories.${activeCategory}`) })}
      </div>

      <div className="transition-opacity duration-300">
        <RowsPhotoAlbum
          photos={photos}
          targetRowHeight={220}
          onClick={({ index }) => setLightboxIndex(index)}
        />
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={filteredImages.map((img) => ({ src: img.src, alt: t(`photos.${img.altKey}`) }))}
      />

      {filteredImages.length === 0 && (
        <div className="text-center py-20 border border-stone-200">
          <p className="text-stone-500 font-display text-xl italic">{t('empty')}</p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="mt-5 eyebrow text-brand-green hover:text-brand-green-dark border-b border-brand-gold pb-1"
          >
            {t('viewAll')}
          </button>
        </div>
      )}
    </Section>
  );
};
