import {
  DesignServices,
  Email,
  EmojiEvents,
  Event,
  Favorite,
  LocalOffer,
  LocationOn,
  People,
  Phone,
  Schedule,
} from '@mui/icons-material';
import Link from 'next/link';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { Faq } from '../ui/features/Faq';
import { Hero } from '../ui/features/Hero';
import { PackagesShowcase } from '../ui/features/PackagesShowcase';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { AppConfig } from '../utils/AppConfig';
import {
  eventVenueJsonLd,
  faqPageJsonLd,
  localBusinessJsonLd,
  offerCatalogJsonLd,
} from '../utils/StructuredData';

const PACKAGES_DATA = [
  {
    title: 'Intimate Gathering',
    capacity: '50 Guests',
    price: '$2,000',
    description:
      'Perfect for small celebrations, birthday parties, and intimate gatherings. Our cozy setup ensures your guests feel right at home.',
    features: [
      'Tables & Chairs',
      'Tablecloths & Chair Covers',
      'Basic Sound System',
      'Setup & Cleanup',
    ],
    img: '/photos/tier-1.jpeg',
  },
  {
    title: 'Grand Celebration',
    capacity: '150 Guests',
    price: '$3,000',
    description:
      'Our most popular choice for weddings and large celebrations. Spacious yet intimate, with all the amenities you need.',
    features: [
      'Premium Tables & Chairs',
      'Elegant Linens',
      'Advanced Sound System',
      'Bridal Suite Access',
      'Dedicated Event Coordinator',
    ],
    img: '/photos/tier-3.jpg',
    popular: true,
  },
  {
    title: 'Majestic Event',
    capacity: '250 Guests',
    price: '$4,000',
    description:
      'The ultimate venue experience for grand weddings and large corporate events. Full venue access with premium services.',
    features: [
      'Luxury Furnishings',
      'Premium Linens',
      'Professional Sound & Lighting',
      'Bridal Suite & Prep Area',
      'Event Coordinator',
      'Custom Layout Design',
    ],
    img: '/photos/tier-2.jpeg',
  },
];

const FAQ_ITEMS = [
  {
    question: 'What is the guest capacity of Fellowship Event Hall?',
    answer:
      'Fellowship Event Hall comfortably seats up to 250 guests and can accommodate up to 300 attendees for standing receptions. The space is approximately 5,000 square feet.',
  },
  {
    question: 'Where is Fellowship Event Hall located?',
    answer:
      'We are located at 2875 Winder Hwy, Dacula, GA 30019 — roughly 45 minutes northeast of downtown Atlanta, and convenient to Lawrenceville, Buford, Hoschton, Duluth, and Suwanee.',
  },
  {
    question: 'Is parking available on site?',
    answer:
      'Yes. Our property includes a large on-site parking lot with ample space for your guests at no additional charge.',
  },
  {
    question: 'Can we bring in our own catering and alcohol?',
    answer:
      'Yes — outside catering is welcome, and our prep kitchen is available to vendors. Alcohol is permitted under our standard rental guidelines, which we will review with you before booking.',
  },
  {
    question: 'What is included in the rental?',
    answer:
      'Every rental includes tables and chairs, tablecloths and chair covers, a basic sound system, on-site parking, an on-site coordinator, and setup and cleanup assistance. Higher-tier packages add premium linens, a bridal suite, enhanced sound and lighting, and dedicated coordination.',
  },
  {
    question: 'How do we book a tour or check availability?',
    answer:
      'Private venue tours are available by appointment. Use the contact form or send a WhatsApp message and we will follow up promptly with open dates.',
  },
];

const Index = () => {
  const jsonLd = [
    localBusinessJsonLd(),
    eventVenueJsonLd(),
    offerCatalogJsonLd(
      PACKAGES_DATA.map((p) => ({
        name: p.title,
        price: p.price,
        capacity: Number.parseInt(p.capacity, 10),
        description: p.description,
      }))
    ),
    faqPageJsonLd(FAQ_ITEMS),
  ];

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta
        title="Fellowship Event Hall | Wedding & Banquet Venue in Dacula, GA"
        description={AppConfig.description}
        jsonLd={jsonLd}
      />

      <Template>
        <Hero />

        {/* Features Section */}
        <VerticalFeatures />

        {/* Stats Banner — flattened, editorial */}
        <section className="relative py-24 bg-stone-100">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a86c]/40 to-transparent" />
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-14">
                <span className="eyebrow text-[#c9a86c]">The Venue</span>
                <h2 className="mt-3 font-display text-4xl md:text-5xl text-stone-900">
                  Why Choose Our Dacula Event Venue
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Creating memorable experiences for your special occasions
                </p>
              </div>
            </AnimationOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300/70 max-w-4xl mx-auto">
              <AnimationOnScroll animateIn="animate__fadeInUp" delay={0} animateOnce>
                <NumberDisplay
                  text="Guest Capacity"
                  value="250"
                  icon={<People fontSize="large" className="text-[#7c9885]" />}
                />
              </AnimationOnScroll>
              <AnimationOnScroll animateIn="animate__fadeInUp" delay={150} animateOnce>
                <NumberDisplay
                  text="Square Feet"
                  value="5,000"
                  icon={<DesignServices fontSize="large" className="text-[#c9a86c]" />}
                />
              </AnimationOnScroll>
              <AnimationOnScroll animateIn="animate__fadeInUp" delay={300} animateOnce>
                <NumberDisplay
                  text="Packages"
                  value="$2K–$4K"
                  icon={<LocalOffer fontSize="large" className="text-[#7c9885]" />}
                />
              </AnimationOnScroll>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a86c]/40 to-transparent" />
        </section>

        {/* Packages Section */}
        <PackagesShowcase
          title="Our Packages"
          description="Choose the perfect package for your event. All packages include tables, chairs, tablecloths, and chair covers."
          packages={PACKAGES_DATA}
        />

        {/* CTA Banner — full bleed dark */}
        <section className="relative py-24 bg-stone-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c9885]/25 via-transparent to-[#c9a86c]/20" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <span className="eyebrow text-[#c9a86c]">Book Your Date</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight">
                Ready to Book Your Dacula Wedding or Event?
              </h2>
              <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
              <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
                Let us help you create unforgettable memories at St. Mary&apos;s Event Hall.
              </p>
              <div className="mt-10">
                <ModernButton
                  component={Link}
                  href="/packages"
                  buttonVariant="secondary"
                  size="large"
                >
                  View All Packages
                </ModernButton>
              </div>
            </AnimationOnScroll>
          </div>
        </section>

        {/* Trust Badges — flat, editorial */}
        <div className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {[
                  {
                    icon: <Event className="w-7 h-7 text-[#7c9885]" />,
                    title: 'Flexible Booking',
                    text: 'Easy scheduling with multiple date options',
                  },
                  {
                    icon: <EmojiEvents className="w-7 h-7 text-[#c9a86c]" />,
                    title: 'Award Winning',
                    text: 'Highly rated venue in the Dacula area',
                  },
                  {
                    icon: <Favorite className="w-7 h-7 text-[#7c9885]" />,
                    title: 'Made with Love',
                    text: 'Personal attention to every detail',
                  },
                ].map((b) => (
                  <div key={b.title} className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 flex items-center justify-center border border-stone-200">
                      {b.icon}
                    </div>
                    <h3 className="font-display text-2xl text-stone-900">{b.title}</h3>
                    <p className="text-stone-600 max-w-xs">{b.text}</p>
                  </div>
                ))}
              </div>
            </AnimationOnScroll>
          </div>
        </div>

        {/* Visit Us — NAP section, flattened */}
        <section aria-labelledby="visit-us-heading" className="py-20 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-14">
                <span className="eyebrow text-[#c9a86c]">Visit</span>
                <h2
                  id="visit-us-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  Visit Fellowship Event Hall
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
                <p className="mt-5 text-stone-600 max-w-2xl mx-auto leading-relaxed">
                  Conveniently located in Dacula, Georgia — serving Gwinnett County, Lawrenceville,
                  Buford, Hoschton, and the North Atlanta metro area.
                </p>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-300/70"
                itemScope
                itemType="https://schema.org/EventVenue"
              >
                <meta itemProp="name" content={AppConfig.site_name} />
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <LocationOn className="text-[#7c9885]" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">Address</h3>
                  <address
                    className="not-italic text-stone-600 leading-relaxed"
                    itemProp="address"
                    itemScope
                    itemType="https://schema.org/PostalAddress"
                  >
                    <span itemProp="streetAddress">{AppConfig.address.street}</span>
                    <br />
                    <span itemProp="addressLocality">{AppConfig.address.city}</span>,{' '}
                    <span itemProp="addressRegion">{AppConfig.address.region}</span>{' '}
                    <span itemProp="postalCode">{AppConfig.address.postalCode}</span>
                  </address>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${AppConfig.address.street}, ${AppConfig.address.city}, ${AppConfig.address.region} ${AppConfig.address.postalCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="eyebrow text-[#7c9885] hover:text-[#6b8574] transition-colors mt-1"
                  >
                    Get Directions →
                  </a>
                </div>
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <Phone className="text-[#c9a86c]" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">Contact</h3>
                  <a
                    href={`tel:${AppConfig.telephone.replace(/[^\d+]/g, '')}`}
                    className="text-stone-600 hover:text-[#7c9885] transition"
                    itemProp="telephone"
                  >
                    {AppConfig.telephone}
                  </a>
                  <a
                    href={`mailto:${AppConfig.email}`}
                    className="text-stone-600 hover:text-[#7c9885] transition inline-flex items-center gap-1"
                    itemProp="email"
                  >
                    <Email fontSize="small" /> {AppConfig.email}
                  </a>
                </div>
                <div className="flex flex-col items-center text-center gap-3 py-8 md:py-4 px-6">
                  <Schedule className="text-[#7c9885]" fontSize="medium" />
                  <h3 className="font-display text-xl text-stone-900">Tours by Appointment</h3>
                  <p className="text-stone-600 leading-relaxed">
                    We schedule private venue tours by appointment — reach out to find a time that
                    works for you.
                  </p>
                </div>
              </div>
            </AnimationOnScroll>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-12">
                <span className="eyebrow text-[#c9a86c]">FAQ</span>
                <h2
                  id="faq-heading"
                  className="mt-3 font-display text-4xl md:text-5xl text-stone-900"
                >
                  Frequently Asked Questions
                </h2>
                <div className="mx-auto mt-4 w-12 h-px bg-[#c9a86c]" />
                <p className="mt-5 text-stone-600">
                  Everything you need to know before booking your Dacula event.
                </p>
              </div>
            </AnimationOnScroll>
            <Faq items={FAQ_ITEMS} />
          </div>
        </section>
      </Template>
    </div>
  );
};

export default Index;
