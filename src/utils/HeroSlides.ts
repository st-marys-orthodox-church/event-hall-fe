export type IHeroSlide = {
  src: string;
  altKey: 'celebrationBackdrop' | 'receptionSetup' | 'quinceaneraHeadTable' | 'interior';
};

export const HERO_SLIDES: IHeroSlide[] = [
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/9f591660-aa82-47bd-340c-2234fc7c0d00/public',
    altKey: 'celebrationBackdrop',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/0378b0e5-f911-4cf5-5415-ea5d66fe3a00/public',
    altKey: 'receptionSetup',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/e561ef79-50cf-4ffc-a1c4-7fb918df6d00/public',
    altKey: 'quinceaneraHeadTable',
  },
  {
    src: 'https://imagedelivery.net/J9QDi-Ui04SJHIZBSNVpSQ/3d7897e5-7c18-4bd5-4eb0-63dd22470200/public',
    altKey: 'interior',
  },
];
