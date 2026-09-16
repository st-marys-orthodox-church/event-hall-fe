export type INavLink = {
  key: 'gallery' | 'packages' | 'events';
  link: string;
};

export const NAV_LINKS: INavLink[] = [
  { key: 'gallery', link: '/gallery' },
  { key: 'packages', link: '/packages' },
  { key: 'events', link: '/events' },
];
