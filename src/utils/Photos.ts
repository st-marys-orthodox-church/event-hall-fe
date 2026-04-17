export type IGalleryCategory = 'all' | 'hall' | 'events' | 'details' | 'setup';

export type IGalleryPhotoAltKey =
  | 'hallMain'
  | 'eventSetup'
  | 'hallInterior'
  | 'decorativeDetails'
  | 'eventPanorama'
  | 'tableSetup'
  | 'hallSeating'
  | 'eventWide'
  | 'chairArrangement'
  | 'closeDetails'
  | 'hallLighting'
  | 'eventCelebration'
  | 'stageSetup'
  | 'tableDecorations'
  | 'hallEntrance'
  | 'eventDining'
  | 'roomConfig'
  | 'centerpiece'
  | 'hallOverview';

export type IGalleryImgProps = {
  src: string;
  width: number;
  height: number;
  category: IGalleryCategory;
  altKey: IGalleryPhotoAltKey;
};

export const GALLERY_CATEGORY_KEYS: IGalleryCategory[] = [
  'all',
  'hall',
  'events',
  'setup',
  'details',
];

export const GALLERY_PHOTOS: IGalleryImgProps[] = [
  {
    src: 'https://i.imgur.com/ln47mhE.jpg',
    width: 2048,
    height: 1364,
    category: 'hall',
    altKey: 'hallMain',
  },
  {
    src: 'https://i.imgur.com/H9M6s5e.jpg',
    width: 4032,
    height: 3024,
    category: 'events',
    altKey: 'eventSetup',
  },
  {
    src: 'https://i.imgur.com/6KXQOQZ.jpg',
    width: 4032,
    height: 3024,
    category: 'hall',
    altKey: 'hallInterior',
  },
  {
    src: 'https://i.imgur.com/WLiiqYQ.jpg',
    width: 3024,
    height: 4032,
    category: 'details',
    altKey: 'decorativeDetails',
  },
  {
    src: 'https://i.imgur.com/AGlvxI4.jpg',
    width: 4032,
    height: 3024,
    category: 'events',
    altKey: 'eventPanorama',
  },
  {
    src: 'https://i.imgur.com/7IRrMHO.jpg',
    width: 4032,
    height: 3024,
    category: 'setup',
    altKey: 'tableSetup',
  },
  {
    src: 'https://i.imgur.com/X4e1Ha1.jpg',
    width: 3024,
    height: 4032,
    category: 'hall',
    altKey: 'hallSeating',
  },
  {
    src: 'https://i.imgur.com/6nAJplD.jpg',
    width: 4032,
    height: 3024,
    category: 'events',
    altKey: 'eventWide',
  },
  {
    src: 'https://i.imgur.com/BZtkcQp.jpg',
    width: 4032,
    height: 3024,
    category: 'setup',
    altKey: 'chairArrangement',
  },
  {
    src: 'https://i.imgur.com/vHNLSrJ.jpg',
    width: 4032,
    height: 3024,
    category: 'details',
    altKey: 'closeDetails',
  },
  {
    src: 'https://i.imgur.com/lwdmV5l.jpg',
    width: 3024,
    height: 4032,
    category: 'hall',
    altKey: 'hallLighting',
  },
  {
    src: 'https://i.imgur.com/6UgCavp.jpg',
    width: 4032,
    height: 3024,
    category: 'events',
    altKey: 'eventCelebration',
  },
  {
    src: 'https://i.imgur.com/e1hXa6U.jpg',
    width: 4032,
    height: 3024,
    category: 'setup',
    altKey: 'stageSetup',
  },
  {
    src: 'https://i.imgur.com/KMftC0m.jpg',
    width: 3024,
    height: 4032,
    category: 'details',
    altKey: 'tableDecorations',
  },
  {
    src: 'https://i.imgur.com/DB3sRpf.jpg',
    width: 3024,
    height: 4032,
    category: 'hall',
    altKey: 'hallEntrance',
  },
  {
    src: 'https://i.imgur.com/7r6dEdZ.jpg',
    width: 3024,
    height: 4032,
    category: 'events',
    altKey: 'eventDining',
  },
  {
    src: 'https://i.imgur.com/GbY9d67.jpg',
    width: 4032,
    height: 3024,
    category: 'setup',
    altKey: 'roomConfig',
  },
  {
    src: 'https://i.imgur.com/d6oVq2s.jpg',
    width: 3024,
    height: 4032,
    category: 'details',
    altKey: 'centerpiece',
  },
  {
    src: 'https://i.imgur.com/fL5qyjB.jpg',
    width: 4032,
    height: 3024,
    category: 'hall',
    altKey: 'hallOverview',
  },
];
