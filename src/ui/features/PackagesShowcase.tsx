import { Check, People } from '@mui/icons-material';
import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';
import Link from 'next/link';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { useScrollParallax } from '../../hooks';
import { TIMING } from '../../utils/DesignTokens';
import type { IPackageMeta } from '../../utils/Packages';
import { ModernButton } from '../components/ModernButton';
import { Section } from '../layout/Section';

type IPackagesShowcaseProps = {
  packages: IPackageMeta[];
};

const PackageItem = ({ pkg, index }: { pkg: IPackageMeta; index: number }) => {
  const { t } = useTranslation('packages');
  const isEven = index % 2 === 0;
  const { ref, offset } = useScrollParallax<HTMLDivElement>({ speed: 0.2, max: 160 });

  const title = t(`tiers.${pkg.key}.title`);
  const capacity = t(`tiers.${pkg.key}.capacity`);
  const price = t(`tiers.${pkg.key}.price`);
  const description = t(`tiers.${pkg.key}.description`);
  const features = t(`tiers.${pkg.key}.features`, { returnObjects: true }) as string[];

  return (
    <AnimationOnScroll
      animateIn="animate__fadeInUp"
      delay={index * TIMING.packageStaggerMs}
      animateOnce
    >
      <div
        className={`relative flex flex-col lg:flex-row items-stretch gap-8 lg:gap-16 py-10 lg:py-14 border-t border-stone-200 ${
          pkg.popular ? 'bg-gradient-to-br from-brand-green/[0.03] to-brand-gold/[0.04]' : ''
        }`}
      >
        {pkg.img && (
          <div className={`w-full lg:w-1/2 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
            <div
              ref={ref}
              className="relative group overflow-hidden h-72 lg:h-full lg:min-h-[560px] shadow-luxe"
            >
              <div
                className="absolute -inset-y-16 inset-x-0 will-change-transform"
                style={{ transform: `translate3d(0, ${offset}px, 0)` }}
              >
                <Image
                  src={pkg.img}
                  alt={t('showcase.imageAlt', { title, capacity })}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-refined group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        )}

        <div
          className={`w-full lg:w-1/2 flex flex-col justify-center gap-6 ${
            isEven ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <div className="space-y-3">
            {pkg.popular && (
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="h-px w-6 bg-brand-gold" />
                <span className="eyebrow text-brand-gold">{t('showcase.mostPopular')}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-brand-green">
              <People className="w-4 h-4" />
              <span className="eyebrow">{t('showcase.capacityLabel', { capacity })}</span>
            </div>
            <h3 className="font-display text-4xl lg:text-5xl text-stone-900 leading-tight">
              {title}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-display text-4xl lg:text-5xl text-brand-green font-medium">
                {price}
              </span>
              <span className="text-stone-500 text-sm tracking-wide">{t('showcase.perEvent')}</span>
            </div>
          </div>

          {description && (
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl">{description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 max-w-xl">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-stone-700">
                <Check className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <ModernButton
              component={Link}
              href={`/packages?package=${index}`}
              buttonVariant={pkg.popular ? 'secondary' : 'outline'}
              size="large"
            >
              {t('showcase.inquireButton')}
            </ModernButton>
          </div>
        </div>
      </div>
    </AnimationOnScroll>
  );
};

const PackagesShowcase = ({ packages }: IPackagesShowcaseProps) => {
  const { t } = useTranslation(['home', 'packages']);
  const title = t('home:packagesSection.title');
  const description = t('home:packagesSection.description');

  return (
    <Section className="!py-24 !max-w-6xl">
      <div className="text-center mb-8">
        <span className="eyebrow text-brand-gold">{t('packages:showcase.eyebrow')}</span>
        <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900 leading-tight">
          {title}
        </h2>
        <div className="mx-auto mt-4 w-12 h-px bg-brand-gold" />
        <p className="mt-5 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex flex-col">
        {packages.map((pkg, index) => (
          <PackageItem key={pkg.key} pkg={pkg} index={index} />
        ))}
      </div>
    </Section>
  );
};

export { PackagesShowcase };
