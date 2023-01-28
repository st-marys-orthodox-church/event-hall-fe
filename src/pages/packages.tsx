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
                    children: 
                        <div className="grid grid-cols-1 gap-3 justify-between md:grid-cols-2">
                            <BulletList title="Package 1" bullets={['Event Hall']} />
                            <img src="/photos/tier-1.jpeg" alt="Package 1" className="h-80 object-cover w-full" />
                        </div>
                },
                {
                    name: 'Tier 2',
                    children:
                    <div className="grid grid-cols-1 gap-3 justify-between md:grid-cols-2">
                    <BulletList title="Package 2" bullets={['Event Hall', 'Tables', 'Decorations']} />
                            <img src="/photos/tier-2.jpeg" alt="Package 2"  className="h-80 w-full object-cover" />
                        </div>
                },
                {
                    name: 'Tier 3',
                    children: 
                    <div className="grid grid-cols-1 gap-3 justify-between md:grid-cols-2">
                    <BulletList title="Package 3" bullets={['Event Hall', 'Tables', 'Decorations', 'Food', 'Drinks']} />
                            <img src="/photos/tier-3.jpeg" alt="Package 3"  className="h-80 w-full object-cover" />
                        </div>                }
            ]}
        />
        </Template>
      </div>
    
    
    )
        }
export default Packages;
