import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const HERO_IMAGES = [
  '/photos/hero-bg.JPG',
  '/photos/tier-3.jpg',
  '/photos/about-2.jpg',
  '/photos/about-1.jpeg',
];

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Change every 5 seconds
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt={`Event hall scene ${index + 1}`}
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
};
