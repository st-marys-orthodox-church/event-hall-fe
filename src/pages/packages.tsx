import { Check, Info } from '@mui/icons-material';
import Image from 'next/image';
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { WhatsAppButton } from '../ui/components/WhatsAppButton';
import { Section } from '../ui/layout/Section';
import { AppConfig } from '../utils/AppConfig';
import { EVENT_TYPES } from '../utils/Constants';
import { breadcrumbJsonLd, offerCatalogJsonLd } from '../utils/StructuredData';

const Packages = () => {
  const { handleOpenModal } = useAppContext();

  const packageTiers = [
    { capacity: '50 People', price: '$2,000', popular: false },
    { capacity: '100 People', price: '$2,500', popular: false },
    { capacity: '150 People', price: '$3,000', popular: true },
    { capacity: '200 People', price: '$3,500', popular: false },
    { capacity: '300 People', price: '$4,000', popular: false },
  ];

  const jsonLd = [
    offerCatalogJsonLd(
      packageTiers.map((t) => ({
        name: `${t.capacity} Package`,
        price: t.price,
        capacity: Number.parseInt(t.capacity, 10),
        description: `Event package accommodating up to ${t.capacity.toLowerCase()} at Fellowship Event Hall.`,
      }))
    ),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Packages', path: '/packages' },
    ]),
  ];

  const includedItems = [
    'Tables & Chairs',
    'Tablecloths & Chair Covers',
    'Basic Sound System',
    'Setup & Cleanup Assistance',
    'On-site Coordinator',
    'Parking Access',
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta
        title={`Packages - ${AppConfig.title}`}
        description="View our event hall packages and pricing. Packages include tables, chairs, linens, and more. Starting at $2,000 for 50 guests."
        jsonLd={jsonLd}
      />
      <Template topPad>
        {/* Header — editorial, photograph-backed */}
        <div className="relative bg-stone-900 text-white py-28 md:py-36 overflow-hidden">
          <Image
            src="/photos/tier-3.jpg"
            alt="Fellowship Event Hall set for a wedding reception"
            fill
            priority
            className="object-cover object-center opacity-55"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-900/50 to-stone-900/80" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c9885]/25 via-transparent to-[#c9a86c]/15" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a86c]/60 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="eyebrow text-[#c9a86c]">Pricing</span>
            <h1 className="mt-4 font-display text-5xl md:text-6xl leading-tight drop-shadow-lg">
              Event Packages
            </h1>
            <div className="mx-auto mt-5 w-16 h-px bg-[#c9a86c]" />
            <p className="mt-6 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Transparent pricing for your special occasion. Every package includes our premium
              amenities.
            </p>
          </div>
        </div>

        <Section>
          <div className="max-w-6xl mx-auto space-y-24">
            {/* Pricing Table — flat, editorial */}
            <div>
              <div className="text-center mb-10">
                <span className="eyebrow text-[#c9a86c]">By Capacity</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                  Capacity &amp; Pricing
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-t border-l border-stone-200">
                {packageTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`relative flex flex-col items-center justify-center px-6 pb-8 text-center border-r border-b border-stone-200 transition-colors duration-500 ease-refined ${
                      tier.popular ? 'bg-stone-900 text-white' : 'bg-white hover:bg-stone-100'
                    }`}
                  >
                    <div className="h-7 flex items-center justify-center">
                      {tier.popular && (
                        <span className="eyebrow text-[#c9a86c] text-[0.625rem]">Most Popular</span>
                      )}
                    </div>
                    <div
                      className={`eyebrow mb-4 ${tier.popular ? 'text-white/60' : 'text-stone-500'}`}
                    >
                      {tier.capacity}
                    </div>
                    <div
                      className={`font-display text-4xl md:text-5xl font-medium ${
                        tier.popular ? 'text-white' : 'text-[#7c9885]'
                      }`}
                    >
                      {tier.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included — flat grid */}
            <div>
              <div className="text-center mb-10">
                <span className="eyebrow text-[#c9a86c]">Included</span>
                <h2 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                  What&apos;s Included in Every Package
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {includedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 py-4 border-b border-stone-200"
                  >
                    <Check className="w-5 h-5 text-[#c9a86c] flex-shrink-0" />
                    <span className="text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Quick Quote */}
            <div className="py-10 border-y border-stone-200 text-center">
              <span className="eyebrow text-[#c9a86c]">Fast Quote</span>
              <h3 className="mt-3 font-display text-2xl md:text-3xl text-stone-900">
                Get a Quick Quote via WhatsApp
              </h3>
              <p className="mt-3 text-stone-600 text-sm max-w-xl mx-auto">
                Select your event type for an instant quote request.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <WhatsAppButton eventType={EVENT_TYPES.WEDDING} size="medium">
                  Wedding Quote
                </WhatsAppButton>
                <WhatsAppButton eventType={EVENT_TYPES.CORPORATE} size="medium" variant="outlined">
                  Corporate Quote
                </WhatsAppButton>
                <WhatsAppButton eventType={EVENT_TYPES.BIRTHDAY} size="medium" variant="outlined">
                  Birthday Quote
                </WhatsAppButton>
              </div>
            </div>

            {/* Deposits Info — refined editorial note */}
            <div className="flex items-start gap-6 pl-6 border-l-2 border-[#c9a86c]">
              <div className="flex-shrink-0">
                <Info className="w-6 h-6 text-[#c9a86c]" />
              </div>
              <div className="space-y-4">
                <span className="eyebrow text-[#c9a86c]">Good to Know</span>
                <h3 className="font-display text-2xl text-stone-900">Refundable Deposits</h3>
                <p className="text-stone-700 leading-relaxed">
                  A <span className="font-semibold">$1,500 damage deposit</span> and a{' '}
                  <span className="font-semibold">$1,000 cleaning deposit</span> are required with
                  each rental. These fees are fully refundable as long as the venue is returned
                  clean and undamaged.
                </p>
                <p className="text-sm text-stone-500 italic leading-relaxed">
                  Prices are subject to change and provided for planning purposes only. Please
                  contact us to discuss your specific event requirements.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-12">
              <span className="eyebrow text-[#c9a86c]">Next Step</span>
              <h3 className="mt-3 font-display text-3xl md:text-4xl text-stone-900">
                Ready to Book Your Event?
              </h3>
              <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
              <p className="mt-5 text-stone-600 max-w-xl mx-auto leading-relaxed">
                Contact us today to schedule a tour and discuss how we can make your special
                occasion unforgettable.
              </p>
              <div className="mt-8">
                <ModernButton
                  buttonVariant="primary"
                  size="large"
                  onClick={() => handleOpenModal()}
                >
                  Get in Touch
                </ModernButton>
              </div>
            </div>
          </div>
        </Section>
      </Template>
    </div>
  );
};

export default Packages;
