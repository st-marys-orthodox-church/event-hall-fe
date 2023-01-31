import { AppConfig } from '../utils/AppConfig';
import { Banner } from '../ui/features/Banner';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { Meta } from '../ui/base/Meta';
import { Hero } from '../ui/features/Hero';
import { Template } from '../ui/base/Template';
import { CardGrid } from '../ui/features/CardGrid';
import { PACKAGES_LIST } from '../utils/Constants';
import { NumberDisplay } from '../ui/components/NumberDisplay';
import { People, DesignServices, LocalOffer } from '@mui/icons-material';

const Index = () => (
      <div className="antialiased text-neutral-900">
        <Meta title={AppConfig.title} description={AppConfig.description} />

        <Template>
        <Hero />
        <VerticalFeatures />
        <Banner full>
          <h4 className="text-center text-3xl font-semibold mb-4">Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 justify-center gap-6">
            <NumberDisplay text="Capacity" value="400" icon={<People fontSize='large' />} />
            <NumberDisplay text="Square Feet" value="3000" icon={<DesignServices fontSize="large" />} />
            <NumberDisplay text="Rates" value="$1K - $6k" icon={<LocalOffer fontSize="large" />} />
          </div>
        </Banner>
        <CardGrid 
          title="Packages"
          description='Learn more about what we can offer you'
          list={PACKAGES_LIST}
        />
        <Banner />
        </Template>
      </div>
    
    
    );

export default Index;
