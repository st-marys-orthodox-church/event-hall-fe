import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'next-i18next/pages';
import { useId, useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import SSR from 'react-photo-album/ssr';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { fullBleedSrc, optimizedSrcSet } from '../../utils/CloudflareImages';
import {
  GALLERY_CATEGORY_KEYS,
  type IGalleryCategory,
  type IGalleryImgProps,
} from '../../utils/Photos';
import { Section } from '../layout/Section';

// Server-renders one layout per container width so crawlers get real <img> tags;
// container queries show the matching one before hydration, avoiding layout shift.
const GALLERY_BREAKPOINTS = [640, 1024, 1200];
// Section is max-w-screen-xl with px-3, so the album never exceeds 1256px.
const GALLERY_SIZES = {
  size: '1256px',
  sizes: [{ viewport: '(max-width: 1280px)', size: 'calc(100vw - 24px)' }],
};
const EAGER_PHOTO_COUNT = 3;

type IFilteredGalleryProps = {
  images: IGalleryImgProps[];
};

export const FilteredGallery = (props: IFilteredGalleryProps) => {
  const { t } = useTranslation('gallery');
  const filterId = useId();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<IGalleryCategory>('all');

  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return props.images;
    return props.images.filter((img) => img.category === activeCategory);
  }, [props.images, activeCategory]);

  const photos = useMemo(
    () =>
      filteredImages.map((img) => {
        const src = fullBleedSrc(img.src);
        return {
          src,
          width: img.width,
          height: img.height,
          alt: t(`photos.${img.altKey}`),
          srcSet: optimizedSrcSet(src, img.width, img.height),
        };
      }),
    [filteredImages, t]
  );

  return (
    <Section
      title={t('title')}
      titleAs="h1"
      titleClassName="text-[clamp(1.375rem,7vw,2.25rem)] md:text-5xl"
      description={t('description')}
    >
      <div className="md:hidden mb-6">
        <label htmlFor={filterId} className="eyebrow block mb-2 text-stone-500">
          {t('filterLabel')}
        </label>
        <div className="relative">
          <select
            id={filterId}
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value as IGalleryCategory)}
            className="eyebrow w-full appearance-none bg-white border border-stone-300 text-stone-800 px-4 py-3.5 pr-11 focus:outline-none focus:border-brand-green"
          >
            {GALLERY_CATEGORY_KEYS.map((categoryKey) => (
              <option key={categoryKey} value={categoryKey}>
                {t(`categories.${categoryKey}`)}
              </option>
            ))}
          </select>
          <ExpandMoreIcon
            fontSize="small"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500"
          />
        </div>
      </div>

      <div className="hidden md:flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 border-y border-stone-200 py-5">
        {GALLERY_CATEGORY_KEYS.map((categoryKey) => (
          <button
            key={categoryKey}
            type="button"
            onClick={() => setActiveCategory(categoryKey)}
            className={`eyebrow transition-colors duration-300 ease-refined pb-1 border-b ${
              activeCategory === categoryKey
                ? 'text-brand-green-ink border-brand-gold'
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
        <SSR breakpoints={GALLERY_BREAKPOINTS}>
          <RowsPhotoAlbum
            photos={photos}
            targetRowHeight={(containerWidth) => {
              if (containerWidth < 640) return 260;
              if (containerWidth < 1024) return 340;
              return 420;
            }}
            rowConstraints={{ minPhotos: 1, maxPhotos: 3 }}
            sizes={GALLERY_SIZES}
            componentsProps={{
              image: ({ index }) => ({
                loading: index < EAGER_PHOTO_COUNT ? 'eager' : 'lazy',
                fetchPriority: index === 0 ? 'high' : undefined,
                decoding: 'async',
              }),
            }}
            onClick={({ index }) => setLightboxIndex(index)}
          />
        </SSR>
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={filteredImages.map((img) => ({
          src: fullBleedSrc(img.src),
          alt: t(`photos.${img.altKey}`),
        }))}
      />

      {filteredImages.length === 0 && (
        <div className="text-center py-20 border border-stone-200">
          <p className="text-stone-500 font-display text-xl italic">{t('empty')}</p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="mt-5 eyebrow text-brand-green-ink hover:text-brand-green-deep border-b border-brand-gold pb-1"
          >
            {t('viewAll')}
          </button>
        </div>
      )}
    </Section>
  );
};
