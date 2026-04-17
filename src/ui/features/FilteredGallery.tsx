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
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 border-y border-stone-200 py-5">
        {GALLERY_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setActiveCategory(category.key)}
            className={`eyebrow transition-colors duration-300 ease-refined pb-1 border-b ${
              activeCategory === category.key
                ? 'text-[#7c9885] border-[#c9a86c]'
                : 'text-stone-500 border-transparent hover:text-stone-800'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="text-center mb-8 text-stone-500 text-sm">
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
        <div className="text-center py-20 border border-stone-200">
          <p className="text-stone-500 font-display text-xl italic">
            No photos in this category yet.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="mt-5 eyebrow text-[#7c9885] hover:text-[#6b8574] border-b border-[#c9a86c] pb-1"
          >
            View all photos
          </button>
        </div>
      )}
    </Section>
  );
};
