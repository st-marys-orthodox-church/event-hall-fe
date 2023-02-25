// import { BulletList } from '../ui/features/BulletList';
import { ICardGridListItemProps } from '../ui/features/CardGrid';

export const SOCIALS = {
  FB: 'https://www.facebook.com/bisericasfantamariadacula',
  IG: '#', // TODO
};

export const PACKAGES_LIST: ICardGridListItemProps[] = [
  {
    title: '50 People',
    // description: BulletList({ title: '', bullets: ['Event Hall'] }),
    price: '~ $1000',
    img: 'https://i.imgur.com/7r6dEdZ.jpg',
    // cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '150 People',
    // description: BulletList({
    //   title: '',
    //   bullets: ['Event Hall', 'Tables', 'Decorations'],
    // }),
    price: '~ $2000',
    img: '/photos/tier-3.jpg',
    // cta: { text: 'Learn More', link: '/packages' },
  },
  {
    title: '250 People',
    // description: BulletList({
    //   title: '',
    //   bullets: ['Event Hall', 'Tables', 'Decorations', 'Food', 'Drinks'],
    // }),
    price: '~ $5000',
    img: '/photos/tier-2.jpeg',
    // cta: { text: 'Learn More', link: '/packages' },
  },
];
