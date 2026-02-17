export type IGalleryCategory = 'all' | 'hall' | 'events' | 'details' | 'setup';

export type IGalleryImgProps = {
  src: string;
  width: number;
  height: number;
  category: IGalleryCategory;
  alt?: string;
};

export const GALLERY_CATEGORIES: { key: IGalleryCategory; label: string }[] = [
  { key: 'all', label: 'All Photos' },
  { key: 'hall', label: 'The Hall' },
  { key: 'events', label: 'Events' },
  { key: 'setup', label: 'Setup' },
  { key: 'details', label: 'Details' },
];

export const GALLERY_PHOTOS: IGalleryImgProps[] = [
  {
    src: 'https://i.imgur.com/ln47mhE.jpg',
    width: 4,
    height: 3,
    category: 'hall',
    alt: 'Main hall view',
  },
  {
    src: 'https://i.imgur.com/H9M6s5e.jpg',
    width: 4,
    height: 3,
    category: 'events',
    alt: 'Event setup',
  },
  {
    src: 'https://i.imgur.com/6KXQOQZ.jpg',
    width: 4,
    height: 3,
    category: 'hall',
    alt: 'Hall interior',
  },
  {
    src: 'https://i.imgur.com/WLiiqYQ.jpg',
    width: 4,
    height: 3,
    category: 'details',
    alt: 'Decorative details',
  },
  {
    src: 'https://i.imgur.com/AGlvxI4.jpg',
    width: 6,
    height: 3,
    category: 'events',
    alt: 'Event panorama',
  },
  {
    src: 'https://i.imgur.com/7IRrMHO.jpg',
    width: 4,
    height: 3,
    category: 'setup',
    alt: 'Table setup',
  },
  {
    src: 'https://i.imgur.com/X4e1Ha1.jpg',
    width: 4,
    height: 3,
    category: 'hall',
    alt: 'Hall seating',
  },
  {
    src: 'https://i.imgur.com/6nAJplD.jpg',
    width: 4,
    height: 2,
    category: 'events',
    alt: 'Event wide shot',
  },
  {
    src: 'https://i.imgur.com/BZtkcQp.jpg',
    width: 4,
    height: 2,
    category: 'setup',
    alt: 'Chair arrangement',
  },
  {
    src: 'https://i.imgur.com/vHNLSrJ.jpg',
    width: 4,
    height: 2,
    category: 'details',
    alt: 'Close-up details',
  },
  {
    src: 'https://i.imgur.com/lwdmV5l.jpg',
    width: 4,
    height: 3,
    category: 'hall',
    alt: 'Hall lighting',
  },
  {
    src: 'https://i.imgur.com/6UgCavp.jpg',
    width: 4,
    height: 2,
    category: 'events',
    alt: 'Event celebration',
  },
  {
    src: 'https://i.imgur.com/e1hXa6U.jpg',
    width: 4,
    height: 2,
    category: 'setup',
    alt: 'Stage setup',
  },
  {
    src: 'https://i.imgur.com/KMftC0m.jpg',
    width: 4,
    height: 3,
    category: 'details',
    alt: 'Table decorations',
  },
  {
    src: 'https://i.imgur.com/DB3sRpf.jpg',
    width: 4,
    height: 3,
    category: 'hall',
    alt: 'Hall entrance',
  },
  {
    src: 'https://i.imgur.com/7r6dEdZ.jpg',
    width: 4,
    height: 3,
    category: 'events',
    alt: 'Event dining',
  },
  {
    src: 'https://i.imgur.com/GbY9d67.jpg',
    width: 4,
    height: 2,
    category: 'setup',
    alt: 'Room configuration',
  },
  {
    src: 'https://i.imgur.com/d6oVq2s.jpg',
    width: 4,
    height: 3,
    category: 'details',
    alt: 'Centerpiece',
  },
  {
    src: 'https://i.imgur.com/fL5qyjB.jpg',
    width: 4,
    height: 2,
    category: 'hall',
    alt: 'Hall overview',
  },
];
