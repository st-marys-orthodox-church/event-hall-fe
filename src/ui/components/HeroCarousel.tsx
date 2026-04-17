import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useScrollParallax } from '../../hooks';
import { TIMING } from '../../utils/DesignTokens';
import { HERO_SLIDES } from '../../utils/HeroSlides';

export const HeroCarousel = () => {
  const { t } = useTranslation('home');
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, offset } = useScrollParallax<HTMLDivElement>({ speed: 0.35, max: 220 });

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, TIMING.heroCarouselIntervalMs);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const nextIndex = (currentIndex + 1) % HERO_SLIDES.length;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-y-24 inset-x-0 will-change-transform"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          const isPreload = index === nextIndex;
          if (!isActive && !isPreload) return null;
          return (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide.src}
                alt={t(`hero.slides.${slide.altKey}`)}
                fill
                priority={index === 0}
                className="object-cover scale-[1.04]"
                sizes="100vw"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
