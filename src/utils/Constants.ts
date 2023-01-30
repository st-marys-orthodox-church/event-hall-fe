import { BulletList } from "../ui/features/BulletList";
import { ICardGridListItemProps } from "../ui/features/CardGrid";

export const PACKAGES_LIST:ICardGridListItemProps[]  = [
    {
        title: 'Tier 1',
        description: BulletList({ title: '', bullets: ['Event Hall'] }),
        price: '$500',
        img: '/photos/tier-1.jpeg',
        cta: { text: 'Learn More', link: '/packages' }
      },
      {
        title: 'Tier 2',
        description: BulletList({ title: '', bullets: ['Event Hall', 'Tables', 'Decorations'] }),
        price: '$1000',
        img: '/photos/tier-2.jpeg',
        cta: { text: 'Learn More', link: '/packages' }
      },
      {
        title: 'Tier 3',
        description: BulletList({ title: '', bullets: ['Event Hall', 'Tables', 'Decorations', 'Food', 'Drinks'] }),
        price: '$3000',
        img: '/photos/tier-3.jpeg',
        cta: { text: 'Learn More', link: '/packages' }
      },
]