import { ICardGridListItemProps } from "../ui/features/CardGrid";

export const PACKAGES_LIST:ICardGridListItemProps[]  = [
    {
        title: 'Tier 1',
        description: 'Includes just empty event space',
        price: '$500',
        img: '/photos/hero-temp.jpg',
        cta: { text: 'Learn More', link: '/packages' }
      },
      {
        title: 'Tier 2',
        description: 'Includes event space with decorated tables',
        price: '$1000',
        img: '/photos/hero-temp.jpg',
        cta: { text: 'Learn More', link: '/packages' }
      },
      {
        title: 'Tier 3',
        description: 'Includes event space with decorated tables, speakers, food, and drinks',
        price: '$3000',
        img: '/photos/hero-temp.jpg',
        cta: { text: 'Learn More', link: '/packages' }
      },
]