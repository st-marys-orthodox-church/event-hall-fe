import React, { useState, useCallback } from 'react';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { Section } from '../layout/Section';

type IGalleryGridProps = {
  images: any[];
  title?: string;
  description?: string;
};

export const GalleryGrid = (props: IGalleryGridProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const AnyGallery = Gallery as any;
  const AnyCarousel = Carousel as any;
  const AnyModalGateway = ModalGateway as any;
  const AnyModal = Modal as any;

  const openLightbox = useCallback((event, { index }) => {
    if (process.env.NEXT_PUBLIC_DEV) console.log('openLightbox', event);
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <Section title={props.title} description={props.description}>
      <AnyGallery
        photos={props.images && props.images}
        onClick={openLightbox}
      />
      <AnyModalGateway>
        {viewerIsOpen ? (
          <AnyModal onClose={closeLightbox}>
            <AnyCarousel
              currentIndex={currentImage}
              views={
                props.images &&
                props.images.map((x) => ({
                  ...x,
                  source: x.src,
                }))
              }
            />
          </AnyModal>
        ) : null}
      </AnyModalGateway>
    </Section>
  );
};
