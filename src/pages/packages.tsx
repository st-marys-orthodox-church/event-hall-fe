import { AppConfig } from '../utils/AppConfig';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { Section } from '../ui/layout/Section';
import { Button, Divider } from '@mui/material';
import { ModernButton } from '../ui/components/ModernButton';
import { WhatsAppButton } from '../ui/components/WhatsAppButton';
import { useAppContext } from '../stores/Global';
import { Info, Check } from '@mui/icons-material';
import { EVENT_TYPES } from '../utils/Constants';

const Packages = () => {
  const { handleOpenModal } = useAppContext();

  const packageTiers = [
    { capacity: '50 People', price: '$2,000', popular: false },
    { capacity: '100 People', price: '$2,500', popular: false },
    { capacity: '150 People', price: '$3,000', popular: true },
    { capacity: '200 People', price: '$3,500', popular: false },
    { capacity: '300 People', price: '$4,000', popular: false },
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
      <Meta title={`Packages - ${AppConfig.title}`} description="View our event hall packages and pricing. Packages include tables, chairs, linens, and more. Starting at $2,000 for 50 guests." />
      <Template topPad>
        {/* Header */}
        <div className="bg-gradient-to-br from-[#7c9885] to-[#9db5a0] text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Event Packages
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Transparent pricing for your special occasion. All packages include our premium amenities.
            </p>
          </div>
        </div>

        <Section>
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Pricing Table */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center">
                  Capacity & Pricing
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {packageTiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`relative p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                        tier.popular
                          ? 'bg-gradient-to-br from-[#7c9885] to-[#9db5a0] text-white shadow-lg scale-105'
                          : 'bg-stone-50 hover:bg-stone-100'
                      }`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#c9a86c] text-white text-xs font-bold rounded-full">
                          POPULAR
                        </div>
                      )}
                      <div className="text-sm font-medium text-stone-500 mb-2">
                        {tier.capacity}
                      </div>
                      <div className={`text-3xl font-bold ${tier.popular ? 'text-white' : 'text-[#7c9885]'}`}>
                        {tier.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-8 text-center">
                What&apos;s Included in Every Package
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {includedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-stone-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#7c9885]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#7c9885]" />
                    </div>
                    <span className="font-medium text-stone-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Divider className="my-6" />

            {/* WhatsApp Quick Quote Section */}
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h4 className="text-xl font-semibold text-center mb-2 text-green-800">
                Get a Quick Quote via WhatsApp
              </h4>
              <p className="text-center text-neutral-600 mb-4 text-sm">
                Click your event type below for an instant quote request
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <WhatsAppButton
                  eventType={EVENT_TYPES.WEDDING}
                  size="medium"
                  className="w-full sm:w-auto"
                >
                  💍 Wedding Quote
                </WhatsAppButton>
                <WhatsAppButton
                  eventType={EVENT_TYPES.CORPORATE}
                  size="medium"
                  variant="outlined"
                  className="w-full sm:w-auto"
                >
                  💼 Corporate Quote
                </WhatsAppButton>
                <WhatsAppButton
                  eventType={EVENT_TYPES.BIRTHDAY}
                  size="medium"
                  variant="outlined"
                  className="w-full sm:w-auto"
                >
                  🎉 Birthday Quote
                </WhatsAppButton>
              </div>
            </div>

            {/* Deposits Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-1">
                      Refundable Deposits
                    </h3>
                    <p className="text-amber-800">
                      A <span className="font-bold">$1,500 damage deposit</span> and a{' '}
                      <span className="font-bold">$1,000 cleaning deposit</span> are required with each rental. 
                      These fees are fully refundable as long as the venue is returned clean with no damages.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-sm text-amber-700 italic">
                      <span className="font-bold">Note:</span> Prices are subject to change and provided for planning purposes only. 
                      Please contact us to discuss your specific event requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-stone-800 mb-4">
                Ready to Book Your Event?
              </h3>
              <p className="text-stone-600 mb-8 max-w-xl mx-auto">
                Contact us today to schedule a tour and discuss how we can make your special occasion unforgettable.
              </p>
              <ModernButton
                buttonVariant="primary"
                size="large"
                onClick={handleOpenModal}
              >
                Get in Touch
              </ModernButton>
            </div>
          </div>
        </Section>
      </Template>
    </div>
  );
};

export default Packages;