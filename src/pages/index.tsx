import { AppConfig } from '../utils/AppConfig';
import { Banner } from '../ui/features/Banner';
import { VerticalFeatures } from '../ui/features/VerticalFeatures';
import { Meta } from '../ui/base/Meta';
import { Hero } from '../ui/features/Hero';
import { Template } from '../ui/base/Template';
import { CardGrid } from '../ui/features/CardGrid';
import { PACKAGES_LIST } from '../utils/Constants';

const Index = () => (
      <div className="antialiased text-neutral-900">
        <Meta title={AppConfig.title} description={AppConfig.description} />

        <Template>
        <Hero />
        <VerticalFeatures />
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
