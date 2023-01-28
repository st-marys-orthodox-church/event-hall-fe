import { AppConfig } from '../utils/AppConfig';
import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { GalleryGrid } from '../ui/features/Gallery';
import { GALLERY_PHOTOS } from '../utils/Photos';

const Packages = () => (
      <div className="antialiased text-neutral-900">
        <Meta title={AppConfig.title} description={AppConfig.description} />

        <Template topPad>
        <GalleryGrid 
            title="Gallery"
            images={GALLERY_PHOTOS}
        />
        </Template>
      </div>
    
    
    );

export default Packages;
