export type IHeroSlide = {
  src: string;
  altKey: 'exterior' | 'receptionSetup' | 'grounds' | 'interior';
};

export const HERO_SLIDES: IHeroSlide[] = [
  { src: '/photos/hero-bg.JPG', altKey: 'exterior' },
  { src: '/photos/tier-3.jpg', altKey: 'receptionSetup' },
  { src: '/photos/about-2.jpg', altKey: 'grounds' },
  { src: '/photos/about-1.jpeg', altKey: 'interior' },
];
