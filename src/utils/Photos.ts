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
  | 'hallOverview'
  | 'sweet16Celebration'
  | 'sweet16Party'
  | 'eventMoment'
  | 'eventGathering';

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
    src: 'https://i.ibb.co/h1dnK7Gr/hf-20260429-052653-a6626937-aade-4ada-8881-d2c3490d4c28.png',
    width: 2528,
    height: 1696,
    category: 'hall',
    altKey: 'hallMain',
  },
  {
    src: 'https://i.ibb.co/W4RQFfJD/hf-20260429-052703-08d351cf-f694-4868-8242-bc9b239748f9.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventPanorama',
  },
  {
    src: 'https://i.ibb.co/ccQ6nDPq/hf-20260429-052900-55ff8689-1004-41a6-9997-287f134d1bbd.png',
    width: 3168,
    height: 1344,
    category: 'hall',
    altKey: 'hallOverview',
  },
  {
    src: 'https://i.ibb.co/Y4mhSxpt/hf-20260429-052905-263887fb-770b-4bc0-87f3-ca7b13ce1b6b.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventMoment',
  },
  {
    src: 'https://i.ibb.co/Cp4QcWvC/hf-20260429-052910-7b7f30bd-1963-491e-a1b7-e46d640e0570.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventGathering',
  },
  {
    src: 'https://i.ibb.co/tPK5dkkr/hf-20260429-052718-69542eb9-8854-4bfe-9893-484126107025.png',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'tableSetup',
  },
  {
    src: 'https://i.ibb.co/d0rtDVRQ/hf-20260429-052658-59a42a49-60af-4b02-9680-a53ecfa5544e.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventSetup',
  },
  {
    src: 'https://i.ibb.co/PG9dNXpy/hf-20260429-052708-e37aff46-c04a-4cdc-91c2-7b61d0b2c072.png',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'decorativeDetails',
  },
  {
    src: 'https://i.ibb.co/Gvb0LzwP/hf-20260429-052713-ab321634-f189-4a89-81ec-c622c894a006.png',
    width: 2400,
    height: 1792,
    category: 'hall',
    altKey: 'hallInterior',
  },
  {
    src: 'https://i.ibb.co/0jGd987Y/hf-20260429-052723-9b258bfa-f1a3-487b-b982-f62ae3bb6c5e.png',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'tableDecorations',
  },
  {
    src: 'https://i.ibb.co/0RmJx4CP/hf-20260429-052729-4f79efd2-f270-49eb-9e17-4ff0aaef050c.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventWide',
  },
  {
    src: 'https://i.ibb.co/hx3FtCqj/hf-20260429-052734-58410ebd-b2e2-4f9b-974e-4aa316a2b668.png',
    width: 2400,
    height: 1792,
    category: 'hall',
    altKey: 'hallSeating',
  },
  {
    src: 'https://i.ibb.co/0y7WJtJK/hf-20260429-052739-b23979a5-e533-49e9-84d7-4e53faf42ee9.png',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'chairArrangement',
  },
  {
    src: 'https://i.ibb.co/xtPhXZvg/hf-20260429-052744-a928e3be-1eed-4a39-a655-aeb7b29bddcd.png',
    width: 1792,
    height: 2400,
    category: 'hall',
    altKey: 'hallLighting',
  },
  {
    src: 'https://i.ibb.co/JjsS7wDn/hf-20260429-052749-a8a99f87-5229-435e-8b3a-335908b7d3cf.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventCelebration',
  },
  {
    src: 'https://i.ibb.co/zcrtSqd/hf-20260429-052821-f57ba732-b7fe-43b5-b21c-2f96b03b03be.png',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'stageSetup',
  },
  {
    src: 'https://i.ibb.co/gbh0j90y/hf-20260429-052825-b8f6c8f7-f9ba-46dd-87a0-ec57a0bdb5eb.png',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'closeDetails',
  },
  {
    src: 'https://i.ibb.co/XrdHVJBk/hf-20260429-052829-62f06c80-6b3c-4c94-8a81-8891df43e671.png',
    width: 1792,
    height: 2400,
    category: 'hall',
    altKey: 'hallEntrance',
  },
  {
    src: 'https://i.ibb.co/jkVtW84Y/hf-20260429-052835-18c10135-d149-4092-9e97-976d25fa4966.png',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'centerpiece',
  },
  {
    src: 'https://i.ibb.co/VYwxw3Lg/hf-20260429-052840-3fc72a7b-5af2-4930-871b-50dbe06d131e.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventDining',
  },
  {
    src: 'https://i.ibb.co/nMb1LRNp/hf-20260429-052846-f728193d-01f3-408e-bacf-a413aa41421e.png',
    width: 1792,
    height: 2400,
    category: 'setup',
    altKey: 'roomConfig',
  },
  {
    src: 'https://i.ibb.co/tPFgWvKr/hf-20260429-052851-80db481c-9b08-4163-b8d1-5d7af6de0823.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'sweet16Celebration',
  },
  {
    src: 'https://i.ibb.co/bhWKhx5/hf-20260429-052856-2a421975-f90d-404f-bcb6-30dfd54fdf1d.png',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'sweet16Party',
  },
];
