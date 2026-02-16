import React, { useState, useCallback, useMemo } from 'react';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { Section } from '../layout/Section';
import { GALLERY_CATEGORIES, IGalleryCategory, IGalleryImgProps } from '../../utils/Photos';

type IFilteredGalleryProps = {
  images: IGalleryImgProps[];
  title?: string;
  description?: string;
};

export const FilteredGallery = (props: IFilteredGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<IGalleryCategory>('all');

  const AnyGallery = Gallery as any;
  const AnyCarousel = Carousel as any;
  const AnyModalGateway = ModalGateway as any;
  const AnyModal = Modal as any;

  // Filter images based on active category
  const filteredImages = useMemo(() => {
    if (activeCategory === 'all') return props.images;
    return props.images.filter((img) => img.category === activeCategory);
  }, [props.images, activeCategory]);

  const openLightbox = useCallback((_event: any, { index }: { index: number }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <Section title={props.title} description={props.description}>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {GALLERY_CATEGORIES.map((category) => (
          <button
            key={category.key}
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

      {/* Photo Count */}
      <div className="text-center mb-6 text-stone-500 text-sm">
        Showing {filteredImages.length} {filteredImages.length === 1 ? 'photo' : 'photos'}
        {activeCategory !== 'all' && ` in ${GALLERY_CATEGORIES.find(c => c.key === activeCategory)?.label}`}
      </div>

      {/* Gallery Grid */}
      <div className="transition-opacity duration-300">
        <AnyGallery
          photos={filteredImages.map((img) => ({
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt,
          }))}
          onClick={openLightbox}
        />
      </div>

      {/* Lightbox */}
      <AnyModalGateway>
        {viewerIsOpen ? (
          <AnyModal onClose={closeLightbox}>
            <AnyCarousel
              currentIndex={currentImage}
              views={filteredImages.map((x) => ({
                ...x,
                source: x.src,
                caption: x.alt,
              }))}
            />
          </AnyModal>
        ) : null}
      </AnyModalGateway>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-16 bg-stone-50 rounded-2xl">
          <p className="text-stone-500 text-lg">
            No photos in this category yet.
          </p>
          <button
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