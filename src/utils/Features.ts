import {
  DesignServices,
  EmojiEvents,
  Event,
  Favorite,
  LocalOffer,
  People,
} from '@mui/icons-material';
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

export type ITrustBadgeMeta = {
  key: 'flexibleBooking' | 'awardWinning' | 'madeWithLove';
  Icon: IconComponent;
  iconTone: 'green' | 'gold';
};

export const TRUST_BADGES: ITrustBadgeMeta[] = [
  { key: 'flexibleBooking', Icon: Event, iconTone: 'green' },
  { key: 'awardWinning', Icon: EmojiEvents, iconTone: 'gold' },
  { key: 'madeWithLove', Icon: Favorite, iconTone: 'green' },
];

export type IStoryFeatureMeta = {
  key: 'ourStory' | 'aboutYou';
  image: string;
  reverse?: boolean;
};

export const STORY_FEATURES: IStoryFeatureMeta[] = [
  {
    key: 'ourStory',
    image: 'https://i.ibb.co/Gvb0LzwP/hf-20260429-052713-ab321634-f189-4a89-81ec-c622c894a006.png',
  },
  {
    key: 'aboutYou',
    image: 'https://i.ibb.co/zcrtSqd/hf-20260429-052821-f57ba732-b7fe-43b5-b21c-2f96b03b03be.png',
    reverse: true,
  },
];
