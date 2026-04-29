export type IPackageKey = 'intimate' | 'grand' | 'majestic';

export type IPackageMeta = {
  key: IPackageKey;
  img: string;
  popular?: boolean;
};

export const PACKAGES: IPackageMeta[] = [
  {
    key: 'intimate',
    img: 'https://i.ibb.co/tPK5dkkr/hf-20260429-052718-69542eb9-8854-4bfe-9893-484126107025.png',
  },
  {
    key: 'grand',
    img: 'https://i.ibb.co/h1dnK7Gr/hf-20260429-052653-a6626937-aade-4ada-8881-d2c3490d4c28.png',
    popular: true,
  },
  {
    key: 'majestic',
    img: 'https://i.ibb.co/Cp4QcWvC/hf-20260429-052910-7b7f30bd-1963-491e-a1b7-e46d640e0570.png',
  },
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
