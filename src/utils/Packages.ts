export type IPackageKey = 'intimate' | 'grand' | 'majestic';

export type IPackageMeta = {
  key: IPackageKey;
  img: string;
  popular?: boolean;
};

export const PACKAGES: IPackageMeta[] = [
  {
    key: 'intimate',
    img: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/01364dae-d2f5-48fc-b20c-d2654b1b2300/public',
  },
  {
    key: 'grand',
    img: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/3d27db57-07bb-4fa8-2645-e32007c9e400/public',
    popular: true,
  },
  {
    key: 'majestic',
    img: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/e561ef79-50cf-4ffc-a1c4-7fb918df6d00/public',
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
