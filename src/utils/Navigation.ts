export type INavLink = {
  key: 'gallery' | 'packages';
  link: string;
};

export const NAV_LINKS: INavLink[] = [
  { key: 'gallery', link: '/gallery' },
  { key: 'packages', link: '/packages' },
];
