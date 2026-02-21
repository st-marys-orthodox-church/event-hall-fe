import Link from 'next/link';
import { Section } from '../layout/Section';
import FadeIn from '../components/FadeIn';
import Image from 'next/image';
import { ModernButton } from '../components/ModernButton';
import { HeroCarousel } from '../components/HeroCarousel';

const Hero = () => {
  return (
    <div className="relative h-screen flex items-center w-full">
      {/* Background Carousel */}
      <HeroCarousel />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 z-[1]" />
      
      <Section
        className="relative z-[2] w-full flex flex-col gap-5 items-center justify-center !max-w-none !px-0"
        yPadding="py-16"
      >
        <FadeIn>
          <div className="w-full flex flex-col gap-5 items-center justify-center !max-w-none !px-0">
            {/* Main Content */}
            <header className="text-center py-6 w-full max-w-4xl mx-auto px-4">
              <h3 className="text-4xl md:text-5xl text-white font-bold tracking-wide leading-tight mb-4 drop-shadow-lg">
                <Image
                  src={`/logos/logo-words-tp.png`}
                  alt="Fellowship Event Hall - Host Events"
                  width="480"
                  height="100"
                  className="brightness-[10] mx-auto"
                />
              </h3>
              <p className="text-xl md:text-2xl font-medium italic text-white/95 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
                An elegant event hall suited for all your special occasions
                <br />
                <span className="text-lg not-italic font-normal text-white/80">
                  Located in Dacula, GA
                </span>
              </p>
            </header>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 items-center">
              <Link href="/gallery">
                <ModernButton buttonVariant="primary" size="large">
                  View Gallery
                </ModernButton>
              </Link>
              <Link href="/packages">
                <ModernButton buttonVariant="outlineLight" size="large">
                  Explore Packages
                </ModernButton>
              </Link>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Scroll Indicator - positioned at bottom of hero */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-[2]">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export { Hero };