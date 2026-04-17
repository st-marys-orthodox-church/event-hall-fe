import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '../components/FadeIn';
import { HeroCarousel } from '../components/HeroCarousel';
import { ModernButton } from '../components/ModernButton';
import { Section } from '../layout/Section';

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
              <h1 className="text-4xl md:text-5xl text-white font-bold tracking-wide leading-tight mb-4 drop-shadow-lg">
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src="/logos/fellowship-wordmark-minimal-white.svg"
                    alt="Fellowship Event Hall — wedding and banquet venue in Dacula, Georgia"
                    width={390}
                    height={110}
                    className="mx-auto"
                    priority
                  />
                  <Image
                    src="/logos/fellowship-wordmark-events-white.svg"
                    alt="Fellowship Event Hall — wedding and banquet venue in Dacula, Georgia"
                    width={260}
                    height={73}
                    className="mx-auto"
                    priority
                  />
                </div>
                <span className="sr-only">
                  Fellowship Event Hall — Wedding & Banquet Venue in Dacula, GA
                </span>
              </h1>
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
              <ModernButton component={Link} href="/gallery" buttonVariant="primary" size="large">
                View Gallery
              </ModernButton>
              <ModernButton
                component={Link}
                href="/packages"
                buttonVariant="outlineLight"
                size="large"
              >
                Explore Packages
              </ModernButton>
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
