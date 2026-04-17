export type IPackageKey = 'intimate' | 'grand' | 'majestic';

export type IPackageMeta = {
  key: IPackageKey;
  img: string;
  popular?: boolean;
};

export const PACKAGES: IPackageMeta[] = [
  { key: 'intimate', img: '/photos/tier-1.jpeg' },
  { key: 'grand', img: '/photos/tier-3.jpg', popular: true },
  { key: 'majestic', img: '/photos/tier-2.jpeg' },
];

export type IPackageTierMeta = {
  index: number;
  popular: boolean;
};

export const PACKAGE_TIERS: IPackageTierMeta[] = [
  { index: 0, popular: false },
  { index: 1, popular: false },
  { index: 2, popular: true },
  { index: 3, popular: false },
  { index: 4, popular: false },
];

export const DEPOSIT_INFO = {
  damageDeposit: '$1,500',
  cleaningDeposit: '$1,000',
};
