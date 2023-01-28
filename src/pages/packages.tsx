import { AppConfig } from '../utils/AppConfig';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { BasicTabs } from '../ui/features/Tabs';
import { BulletList } from '../ui/features/BulletList';

const Packages = () => {
    return (
      <div className="antialiased text-neutral-900">
        <Meta title={AppConfig.title} description={AppConfig.description} />

        <Template topPad>
        <BasicTabs 
            withRouter
          title="Packages"
                      tabs={[
                {
                    name: 'Tier 1',
                    children: <BulletList title="Package 1" bullets={['Event Hall']} />
                },
                {
                    name: 'Tier 2',
                    children: <BulletList title="Package 2" bullets={['Event Hall', 'Tables', 'Decorations']} />
                },
                {
                    name: 'Tier 3',
                    children: <BulletList title="Package 3" bullets={['Event Hall', 'Tables', 'Decorations', 'Food', 'Drinks']} />
                }
            ]}
        />
        </Template>
      </div>
    
    
    )
        }
export default Packages;
