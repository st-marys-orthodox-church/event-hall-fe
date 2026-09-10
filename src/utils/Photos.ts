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
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/3d27db57-07bb-4fa8-2645-e32007c9e400/public',
    width: 2528,
    height: 1696,
    category: 'hall',
    altKey: 'hallMain',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/9f591660-aa82-47bd-340c-2234fc7c0d00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventPanorama',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/f744a954-c734-4796-ad13-e956a1e5a000/public',
    width: 3168,
    height: 1344,
    category: 'hall',
    altKey: 'hallOverview',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/68607ab5-f753-49b8-df1a-f8e2129b8d00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventMoment',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/e561ef79-50cf-4ffc-a1c4-7fb918df6d00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventGathering',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/01364dae-d2f5-48fc-b20c-d2654b1b2300/public',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'tableSetup',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/87fd951d-9a39-48b5-58be-906d9b2e8f00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventSetup',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/1a7c487e-e634-4899-9bb7-85805ed1ec00/public',
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
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/ccb865b9-405e-4364-6bfa-bd9b82357500/public',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'tableDecorations',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/0378b0e5-f911-4cf5-5415-ea5d66fe3a00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventWide',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/8a183893-5d18-481b-8e88-8e3774d05e00/public',
    width: 2400,
    height: 1792,
    category: 'hall',
    altKey: 'hallSeating',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/70d7db59-2fd7-43d9-1e3b-61d74508ec00/public',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'chairArrangement',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/f9e50ba1-0287-4a9d-db98-704dcd2a0b00/public',
    width: 1792,
    height: 2400,
    category: 'hall',
    altKey: 'hallLighting',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/dd2d39a7-a9c3-4518-e2ab-195922a72100/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventCelebration',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/690c3c8f-c8ce-4c7c-6e86-3c8051f08900/public',
    width: 2400,
    height: 1792,
    category: 'setup',
    altKey: 'stageSetup',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/eaf93013-511f-4dee-e98a-325a17def400/public',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'closeDetails',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/bb82d0d7-a2ef-4d24-8874-723384e27e00/public',
    width: 1792,
    height: 2400,
    category: 'hall',
    altKey: 'hallEntrance',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/b7fda63b-d60d-4af7-aeb1-b2762773a200/public',
    width: 1792,
    height: 2400,
    category: 'details',
    altKey: 'centerpiece',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/e5c28ef2-4e2b-4987-7d78-ad79dcc13a00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'eventDining',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/083661f6-b46f-4ea5-fdad-046759100f00/public',
    width: 1792,
    height: 2400,
    category: 'setup',
    altKey: 'roomConfig',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/4de364fd-7fd7-4aa4-200c-610fe06eca00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'sweet16Celebration',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/8164bd2d-b8f8-4177-50ca-ec5125d4db00/public',
    width: 2400,
    height: 1792,
    category: 'events',
    altKey: 'sweet16Party',
  },
];
