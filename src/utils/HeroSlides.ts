export type IHeroSlide = {
  src: string;
  altKey: 'exterior' | 'receptionSetup' | 'grounds' | 'interior';
};

export const HERO_SLIDES: IHeroSlide[] = [
  {
    src: 'https://i.ibb.co/W4RQFfJD/hf-20260429-052703-08d351cf-f694-4868-8242-bc9b239748f9.png',
    altKey: 'exterior',
  },
  {
    src: 'https://i.ibb.co/0RmJx4CP/hf-20260429-052729-4f79efd2-f270-49eb-9e17-4ff0aaef050c.png',
    altKey: 'receptionSetup',
  },
  {
    src: 'https://i.ibb.co/Cp4QcWvC/hf-20260429-052910-7b7f30bd-1963-491e-a1b7-e46d640e0570.png',
    altKey: 'grounds',
  },
  {
    src: 'https://i.ibb.co/Gvb0LzwP/hf-20260429-052713-ab321634-f189-4a89-81ec-c622c894a006.png',
    altKey: 'interior',
  },
];
