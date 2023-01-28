import { AppConfig } from '../utils/AppConfig';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { BasicTabs } from '../ui/features/Tabs';

const Packages = () => (
      <div className="antialiased text-neutral-900">
        <Meta title={AppConfig.title} description={AppConfig.description} />

        <Template topPad>
        <BasicTabs 
          title="Packages"
          description='Learn more about what we can offer you'
                      tabs={[
                {
                    name: 'Tier 1',
                    children: <span>Package 1</span>
                },
                {
                    name: 'Tier 2',
                    children: <span>Package 2</span>
                },
                {
                    name: 'Tier 3',
                    children: <span>Package 3</span>
                }
            ]}
        />
        </Template>
      </div>
    
    
    );

export default Packages;
