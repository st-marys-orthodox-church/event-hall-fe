export const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/XMYyAKG9XSL24X259';

export type IReviewMeta = {
  key: 'laura' | 'yuritzia' | 'ioana';
  rating: 5;
  sourceUrl: string;
  datePublished: string;
};

export const REVIEWS: IReviewMeta[] = [
  {
    key: 'laura',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/mW2jeNyPFkoSmVoX8',
    datePublished: '2022-12-15',
  },
  {
    key: 'yuritzia',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/kGPDnFmkYBZzPm55A',
    datePublished: '2025-04-01',
  },
  {
    key: 'ioana',
    rating: 5,
    sourceUrl: 'https://maps.app.goo.gl/nH2yn7Pz3MHz1tzf8',
    datePublished: '2025-04-01',
  },
];
