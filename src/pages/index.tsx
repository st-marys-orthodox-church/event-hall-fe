import { AppConfig } from '../utils/AppConfig';
import { Banner } from '../ui/features/Banner';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { Meta } from '../ui/base/Meta';
import { Hero } from '../ui/features/Hero';
import { Template } from '../ui/base/Template';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { People, DesignServices, LocalOffer } from '@mui/icons-material';
import { AnimationOnScroll } from 'react-animation-on-scroll';
import { CardGrid } from '../ui/features/CardGrid';
import { PACKAGES_LIST } from '../utils/Constants';

const Index = () => (
  <div className="antialiased text-neutral-900">
    <Meta title={AppConfig.title} description={AppConfig.description} />

    <Template>
      <Hero />
      <VerticalFeatures />
      <Banner full>
        <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
          <h4 className="text-center text-3xl font-semibold mb-4">Details</h4>
        </AnimationOnScroll>
        <div className="grid grid-cols-1 sm:grid-cols-3 justify-center gap-6">
          <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
            <NumberDisplay
              text="Capacity"
              value="250"
              icon={<People fontSize="large" />}
            />
          </AnimationOnScroll>
          <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
            <NumberDisplay
              text="Square Feet"
              value="5000"
              icon={<DesignServices fontSize="large" />}
            />
          </AnimationOnScroll>
          <AnimationOnScroll animateIn="animate__fadeIn" animateOnce>
            <NumberDisplay
              text="Rates"
              value="$2K - $10k"
              icon={<LocalOffer fontSize="large" />}
            />
          </AnimationOnScroll>
        </div>
      </Banner>
      <CardGrid
        title="Packages"
        description="Learn more about what we can offer you"
        list={PACKAGES_LIST}
      />
      <Banner />
    </Template>
  </div>
);

export default Index;
