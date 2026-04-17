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
import { useAppContext } from '../stores/Global';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { ModernButton } from '../ui/components/ModernButton';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { Banner } from '../ui/features/Banner';
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
  const { handleOpenModal } = useAppContext();
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

        {/* Stats Banner */}
        <Banner full className="bg-gradient-to-br from-[#7c9885]/10 via-stone-100 to-[#c9a86c]/10">
          <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
            <h2 className="text-center text-3xl md:text-4xl font-bold text-stone-800 mb-2">
              Why Choose Our Dacula Event Venue
            </h2>
            <p className="text-center text-stone-600 mb-10 max-w-2xl mx-auto">
              Creating memorable experiences for your special occasions
            </p>
          </AnimationOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center gap-8 max-w-5xl mx-auto">
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
                value="$2K-$4K"
                icon={<LocalOffer fontSize="large" className="text-[#7c9885]" />}
              />
            </AnimationOnScroll>
          </div>
        </Banner>

        {/* Packages Section */}
        <PackagesShowcase
          title="Our Packages"
          description="Choose the perfect package for your event. All packages include tables, chairs, tablecloths, and chair covers."
          packages={PACKAGES_DATA}
        />

        {/* Availability Calendar */}
        {/* <section aria-labelledby="availability-heading" className="py-16 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-10">
                <h2
                  id="availability-heading"
                  className="text-3xl md:text-4xl font-bold text-stone-800 mb-2"
                >
                  Check Availability
                </h2>
                <p className="text-stone-600 max-w-2xl mx-auto">
                  See open dates at a glance. Tap any available day to start an inquiry — we&apos;ll
                  follow up within one business day.
                </p>
              </div>
              <AvailabilityCalendar onDateSelect={(date) => handleOpenModal(date)} />
            </AnimationOnScroll>
          </div>
        </section> */}

        {/* CTA Banner */}
        <Banner className="bg-gradient-to-r from-[#7c9885] to-[#9db5a0] rounded-3xl shadow-lg">
          <div className="text-center text-white py-8">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Book Your Dacula Wedding or Event?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Let us help you create unforgettable memories at St. Mary&apos;s Event Hall
              </p>
              <ModernButton
                component={Link}
                href="/packages"
                buttonVariant="secondary"
                size="large"
              >
                View All Packages
              </ModernButton>
            </AnimationOnScroll>
          </div>
        </Banner>

        {/* Trust Badges */}
        <div className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                    <Event className="w-8 h-8 text-[#7c9885]" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Flexible Booking</h3>
                  <p className="text-stone-600">Easy scheduling with multiple date options</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#c9a86c]/10 flex items-center justify-center">
                    <EmojiEvents className="w-8 h-8 text-[#c9a86c]" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Award Winning</h3>
                  <p className="text-stone-600">Highly rated venue in Dacula area</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                    <Favorite className="w-8 h-8 text-[#7c9885]" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800">Made with Love</h3>
                  <p className="text-stone-600">Personal attention to every detail</p>
                </div>
              </div>
            </AnimationOnScroll>
          </div>
        </div>

        {/* Visit Us — NAP section for local SEO */}
        <section aria-labelledby="visit-us-heading" className="py-16 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-10">
                <h2
                  id="visit-us-heading"
                  className="text-3xl md:text-4xl font-bold text-stone-800 mb-2"
                >
                  Visit Fellowship Event Hall
                </h2>
                <p className="text-stone-600 max-w-2xl mx-auto">
                  Conveniently located in Dacula, Georgia — serving Gwinnett County, Lawrenceville,
                  Buford, Hoschton, and the North Atlanta metro area.
                </p>
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                itemScope
                itemType="https://schema.org/EventVenue"
              >
                <meta itemProp="name" content={AppConfig.site_name} />
                <div className="flex flex-col items-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                    <LocationOn className="text-[#7c9885]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Address</h3>
                  <address
                    className="not-italic text-stone-600"
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
                    className="text-sm text-[#7c9885] hover:underline"
                  >
                    Get Directions
                  </a>
                </div>
                <div className="flex flex-col items-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#c9a86c]/10 flex items-center justify-center">
                    <Phone className="text-[#c9a86c]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Contact</h3>
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
                <div className="flex flex-col items-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                    <Schedule className="text-[#7c9885]" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800">Tours by Appointment</h3>
                  <p className="text-stone-600">
                    We schedule private venue tours by appointment — reach out to find a time that
                    works for you.
                  </p>
                </div>
              </div>
            </AnimationOnScroll>
          </div>
        </section>

        {/* FAQ — FAQPage JSON-LD emitted via <Meta jsonLd> */}
        <section aria-labelledby="faq-heading" className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <div className="text-center mb-10">
                <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-stone-800 mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-stone-600">
                  Everything you need to know before booking your Dacula event.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {FAQ_ITEMS.map((item) => (
                  <details
                    key={item.question}
                    className="group bg-stone-50 rounded-2xl p-5 shadow-sm open:shadow-md transition"
                  >
                    <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold text-stone-800">
                      {item.question}
                      <span
                        aria-hidden
                        className="text-[#7c9885] text-xl transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-stone-600 leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </AnimationOnScroll>
          </div>
        </section>
      </Template>
    </div>
  );
};

export default Index;
