import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useScrollParallax } from '../../hooks';

const HERO_SLIDES = [
  {
    src: '/photos/hero-bg.JPG',
    alt: 'Fellowship Event Hall exterior — wedding and banquet venue in Dacula, Georgia',
  },
  {
    src: '/photos/tier-3.jpg',
    alt: 'Main hall set up for a 150-guest wedding reception with round tables and linens',
  },
  {
    src: '/photos/about-2.jpg',
    alt: 'Landscaped grounds and on-site parking at Fellowship Event Hall',
  },
  {
    src: '/photos/about-1.jpeg',
    alt: 'Interior of Fellowship Event Hall prepared for a celebration',
  },
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { ref, offset } = useScrollParallax<HTMLDivElement>({ speed: 0.35, max: 220 });

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
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
                alt={slide.alt}
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
