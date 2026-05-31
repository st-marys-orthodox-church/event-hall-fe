export type INavLink = {
  key: 'calendar' | 'donate' | 'gallery';
  link: string;
};

export const NAV_LINKS: INavLink[] = [
  { key: 'calendar', link: '/calendar' },
  { key: 'donate', link: '/donate' },
  { key: 'gallery', link: '/gallery' },
];
