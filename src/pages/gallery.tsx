import { Meta } from '../ui/base/Meta';
import { Template } from '../ui/base/Template';
import { FilteredGallery } from '../ui/features/FilteredGallery';
import { AppConfig } from '../utils/AppConfig';
import { GALLERY_PHOTOS } from '../utils/Photos';
import { breadcrumbJsonLd } from '../utils/StructuredData';

const GalleryPage = () => (
  <div className="antialiased text-stone-800">
    <Meta
      title={`Gallery - ${AppConfig.title}`}
      description="Browse our event hall gallery. View photos of weddings, celebrations, and events held at St. Mary's Orthodox Church event hall in Dacula, GA."
      jsonLd={breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Gallery', path: '/gallery' },
      ])}
    />

    <Template topPad>
      <FilteredGallery
        title="Our Gallery"
        description="Explore our beautiful event hall through photos of past events, setups, and details"
        images={GALLERY_PHOTOS}
      />
    </Template>
  </div>
);

export default GalleryPage;
