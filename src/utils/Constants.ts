import { BulletList } from '../ui/features/BulletList';
import { ICardGridListItemProps } from '../ui/features/CardGrid';

export const SOCIALS = {
  FB: 'https://www.facebook.com/bisericasfantamariadacula',
  IG: 'https://www.instagram.com/fellowshipstmary/',
  // dud pr3
};

export const PACKAGES_LIST: ICardGridListItemProps[] = [
  {
    title: '50 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $2000',
    img: 'https://i.imgur.com/7r6dEdZ.jpg',
    cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '150 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $3000',
    img: '/photos/tier-3.jpg',
    cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '250 People',
    description: BulletList({
      title: '',
      bullets: ['Tables', 'Chairs', 'Tablecloths', 'Chair Covers'],
    }),
    price: '~ $4000',
    img: '/photos/tier-2.jpeg',
    cta: { text: 'Learn More', link: '/packages' },
  },
];
