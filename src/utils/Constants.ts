import { ICardGridListItemProps } from "../ui/features/CardGrid";

export const PACKAGES_LIST:ICardGridListItemProps[]  = [
    {
        title: 'Tier 1',
        description: 'Includes just empty event space',
        price: '$500',
        cta: { text: 'Learn More', action: () => {} }
      },
      {
        title: 'Tier 2',
        description: 'Includes event space with decorated tables',
        price: '$1000',
        cta: { text: 'Learn More', action: () => {} }
      },
      {
        title: 'Tier 3',
        description: 'Includes event space with decorated tables, speakers, food, and drinks',
        price: '$3000',
        cta: { text: 'Learn More', action: () => {} }
      },
]