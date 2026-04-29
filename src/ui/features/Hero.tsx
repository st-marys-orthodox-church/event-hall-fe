import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '../components/FadeIn';
import { HeroCarousel } from '../components/HeroCarousel';
import { ModernButton } from '../components/ModernButton';
import { Section } from '../layout/Section';

const Hero = () => {
  const { t } = useTranslation('home');
  return (
    <div className="relative min-h-screen flex items-center w-full overflow-hidden">
      <HeroCarousel />

      {/* Layered overlay — vignette + warm tint for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.45)_100%)] z-[1]" />

      <Section
        className="relative z-[2] w-full flex flex-col gap-5 items-center justify-center !max-w-none !px-0"
        yPadding="py-16"
      >
        <FadeIn>
          <div className="w-full flex flex-col gap-8 items-center justify-center !max-w-none !px-0">
            <header className="text-center py-6 w-full max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-5xl text-white tracking-wide leading-tight mb-6 drop-shadow-lg">
                <span className="sr-only">{t('hero.srOnly')}</span>
                <span aria-hidden className="flex flex-col items-center justify-center">
                  <Image
                    src="/logos/fellowship-wordmark-minimal-white.svg"
                    alt=""
                    width={390}
                    height={110}
                    className="mx-auto w-full max-w-[300px] sm:max-w-[390px] h-auto"
                    priority
                  />
                  <Image
                    src="/logos/fellowship-wordmark-events-white.svg"
                    alt=""
                    width={260}
                    height={73}
                    className="mx-auto w-full max-w-[200px] sm:max-w-[260px] h-auto"
                    priority
                  />
                </span>
              </h1>

              <div className="mx-auto w-16 h-px bg-brand-gold/80 mb-6" />

              <h2 className="text-xl md:text-2xl font-display italic text-white/95 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
                {t('hero.tagline')}
              </h2>
              <p className="mt-3 eyebrow text-white/75">{t('hero.location')}</p>
            </header>

            <div className="flex flex-col sm:flex-row gap-4 mt-2 items-center">
              <ModernButton component={Link} href="/gallery" buttonVariant="primary" size="large">
                {t('hero.viewGallery')}
              </ModernButton>
              <ModernButton
                component={Link}
                href="/packages"
                buttonVariant="outlineLight"
                size="large"
              >
                {t('hero.explorePackages')}
              </ModernButton>
            </div>
          </div>
        </FadeIn>
      </Section>

      {/* Refined scroll indicator — thin line + dot */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex-col items-center gap-2">
        <span className="eyebrow text-white/70 text-[0.65rem]">{t('hero.scroll')}</span>
        <div className="relative w-px h-12 bg-white/25 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-white/80 animate-[scrollLine_2.4s_cubic-bezier(0.22,1,0.36,1)_infinite]" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollLine {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(300%);
          }
        }
      `}</style>
    </div>
  );
};

export { Hero };
