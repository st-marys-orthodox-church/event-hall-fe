import { Check, People } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { useScrollParallax } from '../../hooks';
import { ModernButton } from '../components/ModernButton';
import { Section } from '../layout/Section';

export type IPackageItemProps = {
  title: string;
  capacity: string;
  price: string;
  description?: string | ReactNode;
  features: string[];
  img?: string;
  popular?: boolean;
};

type IPackagesShowcaseProps = {
  title?: string;
  description?: string;
  packages: IPackageItemProps[];
};

const PackageItem = ({ pkg, index }: { pkg: IPackageItemProps; index: number }) => {
  const isEven = index % 2 === 0;
  const { ref, offset } = useScrollParallax<HTMLDivElement>({ speed: 0.2, max: 160 });

  return (
    <AnimationOnScroll animateIn="animate__fadeInUp" delay={index * 150} animateOnce>
      <div
        className={`relative flex flex-col lg:flex-row items-stretch gap-8 lg:gap-16 py-10 lg:py-14 border-t border-stone-200 ${
          pkg.popular ? 'bg-gradient-to-br from-[#7c9885]/[0.03] to-[#c9a86c]/[0.04]' : ''
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
                  alt={`${pkg.title} package — event setup for ${pkg.capacity} at Fellowship Event Hall in Dacula, GA`}
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
                <span className="h-px w-6 bg-[#c9a86c]" />
                <span className="eyebrow text-[#c9a86c]">Most Popular</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[#7c9885]">
              <People className="w-4 h-4" />
              <span className="eyebrow">Capacity · {pkg.capacity}</span>
            </div>
            <h3 className="font-display text-4xl lg:text-5xl text-stone-900 leading-tight">
              {pkg.title}
            </h3>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-display text-4xl lg:text-5xl text-[#7c9885] font-medium">
                {pkg.price}
              </span>
              <span className="text-stone-500 text-sm tracking-wide">/ event</span>
            </div>
          </div>

          {pkg.description && (
            <p className="text-stone-600 text-lg leading-relaxed max-w-xl">{pkg.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 max-w-xl">
            {pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-stone-700">
                <Check className="w-4 h-4 text-[#c9a86c] flex-shrink-0" />
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
              Inquire About This Package
            </ModernButton>
          </div>
        </div>
      </div>
    </AnimationOnScroll>
  );
};

const PackagesShowcase = ({ title, description, packages }: IPackagesShowcaseProps) => {
  return (
    <Section className="!py-24 !max-w-6xl">
      {(title || description) && (
        <div className="text-center mb-8">
          <span className="eyebrow text-[#c9a86c]">Packages</span>
          {title && (
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900 leading-tight">
              {title}
            </h2>
          )}
          <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
          {description && (
            <p className="mt-5 text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col">
        {packages.map((pkg, index) => (
          <PackageItem key={`package-${index}`} pkg={pkg} index={index} />
        ))}
      </div>
    </Section>
  );
};

export { PackagesShowcase };
