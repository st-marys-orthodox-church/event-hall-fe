import { AppConfig } from '../utils/AppConfig';
import { Banner } from '../ui/features/Banner';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { Meta } from '../ui/base/Meta';
import { Hero } from '../ui/features/Hero';
import { Template } from '../ui/base/Template';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { People, DesignServices, LocalOffer, Event, EmojiEvents, Favorite } from '@mui/icons-material';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { PackagesShowcase } from '../ui/features/PackagesShowcase';
import { ModernButton } from '../ui/components/ModernButton';
import { useRouter } from 'next/router';

const PACKAGES_DATA = [
  {
    title: 'Intimate Gathering',
    capacity: '50 Guests',
    price: '$2,000',
    description: 'Perfect for small celebrations, birthday parties, and intimate gatherings. Our cozy setup ensures your guests feel right at home.',
    features: ['Tables & Chairs', 'Tablecloths & Chair Covers', 'Basic Sound System', 'Setup & Cleanup'],
    img: 'https://i.imgur.com/7r6dEdZ.jpg',
  },
  {
    title: 'Grand Celebration',
    capacity: '150 Guests',
    price: '$3,000',
    description: 'Our most popular choice for weddings and large celebrations. Spacious yet intimate, with all the amenities you need.',
    features: ['Premium Tables & Chairs', 'Elegant Linens', 'Advanced Sound System', 'Bridal Suite Access', 'Dedicated Event Coordinator'],
    img: '/photos/tier-3.jpg',
    popular: true,
  },
  {
    title: 'Majestic Event',
    capacity: '250 Guests',
    price: '$4,000',
    description: 'The ultimate venue experience for grand weddings and large corporate events. Full venue access with premium services.',
    features: ['Luxury Furnishings', 'Premium Linens', 'Professional Sound & Lighting', 'Bridal Suite & Prep Area', 'Event Coordinator', 'Custom Layout Design'],
    img: '/photos/tier-2.jpeg',
  },
];

const Index = () => {
  const { push } = useRouter();

  return (
    <div className="antialiased text-stone-800 bg-stone-50">
      <Meta title={AppConfig.title} description={AppConfig.description} />

      <Template>
        <Hero />
        
        {/* Features Section */}
        <VerticalFeatures />
        
        {/* Stats Banner */}
        <Banner full className="bg-gradient-to-br from-[#7c9885]/10 via-stone-100 to-[#c9a86c]/10">
          <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
            <h4 className="text-center text-3xl md:text-4xl font-bold text-stone-800 mb-2">
              Why Choose Us
            </h4>
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

        {/* CTA Banner */}
        <Banner className="bg-gradient-to-r from-[#7c9885] to-[#9db5a0] rounded-3xl shadow-lg">
          <div className="text-center text-white py-8">
            <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Host Your Event?
              </h3>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Let us help you create unforgettable memories at St. Mary&apos;s Event Hall
              </p>
              <ModernButton
                buttonVariant="secondary"
                size="large"
                onClick={() => push('/packages')}
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
                  <h4 className="text-xl font-bold text-stone-800">Flexible Booking</h4>
                  <p className="text-stone-600">Easy scheduling with multiple date options</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#c9a86c]/10 flex items-center justify-center">
                    <EmojiEvents className="w-8 h-8 text-[#c9a86c]" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-800">Award Winning</h4>
                  <p className="text-stone-600">Highly rated venue in Dacula area</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#7c9885]/10 flex items-center justify-center">
                    <Favorite className="w-8 h-8 text-[#7c9885]" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-800">Made with Love</h4>
                  <p className="text-stone-600">Personal attention to every detail</p>
                </div>
              </div>
            </AnimationOnScroll>
          </div>
        </div>
      </Template>
    </div>
  );
};

export default Index;