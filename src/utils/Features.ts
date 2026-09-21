import { DesignServices, LocalOffer, People } from '@mui/icons-material';
import type { ComponentType } from 'react';

type IconComponent = ComponentType<{ className?: string; fontSize?: 'small' | 'medium' | 'large' }>;

export type IStatItemMeta = {
  key: 'capacity' | 'squareFeet' | 'packages';
  Icon: IconComponent;
  iconTone: 'green' | 'gold';
};

export const STATS_ITEMS: IStatItemMeta[] = [
  { key: 'capacity', Icon: People, iconTone: 'green' },
  { key: 'squareFeet', Icon: DesignServices, iconTone: 'gold' },
  { key: 'packages', Icon: LocalOffer, iconTone: 'green' },
];

export type IStoryFeatureMeta = {
  key: 'ourStory' | 'aboutYou';
  image: string;
  reverse?: boolean;
};

export const STORY_FEATURES: IStoryFeatureMeta[] = [
  {
    key: 'ourStory',
    image:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/70d7db59-2fd7-43d9-1e3b-61d74508ec00/public',
  },
  {
    key: 'aboutYou',
    image:
      'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/690c3c8f-c8ce-4c7c-6e86-3c8051f08900/public',
    reverse: true,
  },
];
