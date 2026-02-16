import { Facebook, Instagram } from '@mui/icons-material';
import Link from 'next/link';
import { SOCIALS } from '../../utils/Constants';
import { Section } from '../layout/Section';
import FadeIn from '../components/FadeIn';
import Image from 'next/image';
import { ModernButton } from '../components/ModernButton';

const Hero = () => {
  return (
    <div
      className={`relative bg-[url('/photos/hero-bg.JPG')] bg-cover bg-center h-screen flex items-center w-full`}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      
      <Section
        className="relative z-10 w-full flex flex-col gap-5 items-center justify-center !max-w-none !px-0"
        yPadding="py-16"
      >
        <FadeIn>
          <div className="w-full flex flex-col gap-5 items-center justify-center !max-w-none !px-0">
            {/* Social Links */}
            <div className="flex items-center gap-4 text-white/90">
              <Link href={SOCIALS.FB} target="_blank">
                <a className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <Facebook className="w-6 h-6" />
                </a>
              </Link>

              <Link href={SOCIALS.IG} target="_blank">
                <a className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <Instagram className="w-6 h-6" />
                </a>
              </Link>
            </div>

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
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/gallery">
                <a>
                  <ModernButton variant="primary" size="large">
                    View Gallery
                  </ModernButton>
                </a>
              </Link>
              <Link href="/packages">
                <a>
                  <ModernButton variant="outline" size="large">
                    Explore Packages
                  </ModernButton>
                </a>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
                <div className="w-1.5 h-3 bg-white/70 rounded-full" />
              </div>
            </div>
          </div>
        </FadeIn>
      </Section>
    </div>
  );
};

export { Hero };