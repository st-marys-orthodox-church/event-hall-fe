import { useMemo, useState } from 'react';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  GALLERY_CATEGORIES,
  type IGalleryCategory,
  type IGalleryImgProps,
} from '../../utils/Photos';
import { Section } from '../layout/Section';

type IFilteredGalleryProps = {
  images: IGalleryImgProps[];
  title?: string;
  description?: string;
};

export const FilteredGallery = (props: IFilteredGalleryProps) => {
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
        alt: img.alt ?? '',
      })),
    [filteredImages]
  );

  return (
    <Section title={props.title} description={props.description}>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {GALLERY_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === category.key
                ? 'bg-gradient-to-r from-[#7c9885] to-[#9db5a0] text-white shadow-lg scale-105'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-6 text-stone-500 text-sm">
        Showing {filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'}
        {activeCategory !== 'all' &&
          ` in ${GALLERY_CATEGORIES.find((c) => c.key === activeCategory)?.label}`}
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
        slides={filteredImages.map((img) => ({ src: img.src, alt: img.alt ?? '' }))}
      />

      {filteredImages.length === 0 && (
        <div className="text-center py-16 bg-stone-50 rounded-2xl">
          <p className="text-stone-500 text-lg">No photos in this category yet.</p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="mt-4 text-[#7c9885] font-semibold hover:underline"
          >
            View all photos
          </button>
        </div>
      )}
    </Section>
  );
};
