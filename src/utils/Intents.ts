import { EVENT_TYPES } from './Constants';
import { GALLERY_PHOTOS, type IGalleryImgProps, type IGalleryPhotoAltKey } from './Photos';

export type IntentKey = 'wedding' | 'quinceanera' | 'corporate' | 'birthday';

export type Intent = {
  key: IntentKey;
  /** URL segment, e.g. /weddings/ */
  slug: string;
  /** Pre-fills the WhatsApp message. */
  eventType: string;
  heroImage: string;
  /** Gallery photos shown on the page, in order. */
  photoAltKeys: IGalleryPhotoAltKey[];
};

export const INTENTS: Intent[] = [
  {
    key: 'wedding',
    slug: 'weddings',
    eventType: EVENT_TYPES.WEDDING,
    heroImage:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/8a183893-5d18-481b-8e88-8e3774d05e00/public',
    photoAltKeys: [
      'hallSeating',
      'hallInterior',
      'eventDining',
      'roomConfig',
      'hallMain',
      'eventCelebration',
    ],
  },
  {
    key: 'quinceanera',
    slug: 'quinceaneras',
    eventType: EVENT_TYPES.QUINCEANERA,
    heroImage:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/4de364fd-7fd7-4aa4-200c-610fe06eca00/public',
    photoAltKeys: [
      'sweet16Celebration',
      'sweet16Party',
      'stageSetup',
      'tableSetup',
      'eventWide',
      'tableDecorations',
    ],
  },
  {
    key: 'corporate',
    slug: 'corporate-events',
    eventType: EVENT_TYPES.CORPORATE,
    heroImage:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/70d7db59-2fd7-43d9-1e3b-61d74508ec00/public',
    photoAltKeys: [
      'chairArrangement',
      'hallOverview',
      'hallMain',
      'decorativeDetails',
      'closeDetails',
      'eventSetup',
    ],
  },
  {
    key: 'birthday',
    slug: 'birthday-parties',
    eventType: EVENT_TYPES.BIRTHDAY,
    heroImage:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/9f591660-aa82-47bd-340c-2234fc7c0d00/public',
    photoAltKeys: [
      'eventPanorama',
      'hallLighting',
      'hallEntrance',
      'stageSetup',
      'sweet16Party',
      'tableSetup',
    ],
  },
];

export const findIntent = (slug: string) => INTENTS.find((intent) => intent.slug === slug);

export const intentPhotos = (intent: Intent): IGalleryImgProps[] =>
  intent.photoAltKeys
    .map((altKey) => GALLERY_PHOTOS.find((photo) => photo.altKey === altKey))
    .filter((photo): photo is IGalleryImgProps => Boolean(photo));
