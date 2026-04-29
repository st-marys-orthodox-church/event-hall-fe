export const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/XMYyAKG9XSL24X259';

export type IReviewMeta = {
  key: 'laura' | 'yuritzia' | 'ioana';
  rating: 5;
  sourceUrl: string;
};

export const REVIEWS: IReviewMeta[] = [
  {
    key: 'laura',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/mW2jeNyPFkoSmVoX8',
  },
  {
    key: 'yuritzia',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/kGPDnFmkYBZzPm55A',
  },
  {
    key: 'ioana',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/nH2yn7Pz3MHz1tzf8',
  },
];
