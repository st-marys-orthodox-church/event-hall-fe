import { Check, People } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AnimationOnScroll } from 'react-animation-on-scroll';
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

  return (
    <AnimationOnScroll animateIn="animate__fadeInUp" delay={index * 200} animateOnce>
      <div
        className={`relative flex flex-col lg:flex-row items-center gap-6 lg:gap-12 p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-white via-stone-50 to-stone-100 border border-stone-200 shadow-lg hover:shadow-xl transition-all duration-500 ${
          pkg.popular ? 'ring-2 ring-[#c9a86c] ring-offset-4' : ''
        }`}
      >
        {/* Popular Badge */}
        {pkg.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-[#c9a86c] to-[#d4b87a] text-white text-sm font-semibold rounded-full shadow-lg">
            Most Popular
          </div>
        )}

        {/* Image Section */}
        {pkg.img && (
          <div className={`w-full lg:w-1/2 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="relative group overflow-hidden rounded-2xl h-64 lg:h-80">
              <Image
                src={pkg.img}
                alt={`${pkg.title} package — event setup for ${pkg.capacity} at Fellowship Event Hall in Dacula, GA`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )}

        {/* Content Section */}
        <div
          className={`w-full lg:w-1/2 flex flex-col gap-6 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}
        >
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#7c9885]">
              <People className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Capacity: {pkg.capacity}
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-stone-800">{pkg.title}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl lg:text-4xl font-bold text-[#7c9885]">{pkg.price}</span>
              <span className="text-stone-500">/event</span>
            </div>
          </div>

          {/* Description */}
          {pkg.description && (
            <p className="text-stone-600 text-lg leading-relaxed">{pkg.description}</p>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pkg.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-stone-700">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#7c9885]" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-4">
            <ModernButton
              component={Link}
              href={`/packages?package=${index}`}
              buttonVariant={pkg.popular ? 'secondary' : 'primary'}
              size="large"
              fullWidth
            >
              Book This Package
            </ModernButton>
          </div>
        </div>
      </div>
    </AnimationOnScroll>
  );
};

const PackagesShowcase = ({ title, description, packages }: IPackagesShowcaseProps) => {
  return (
    <Section title={title} description={description} className="!py-20">
      <div className="flex flex-col gap-6 lg:gap-10">
        {packages.map((pkg, index) => (
          <PackageItem key={`package-${index}`} pkg={pkg} index={index} />
        ))}
      </div>
    </Section>
  );
};

export { PackagesShowcase };
