import { useTranslation } from 'next-i18next/pages';
import { getImageProps } from 'next/image';

type ILogoProps = {
  xl?: boolean;
};

// A <picture> lets the browser fetch only the mark its breakpoint shows, so
// the header logo can load eagerly (it is the LCP element on every page)
// without also downloading the hidden one. Both marks stay in the markup, so
// server, first client render, and hydrated tree agree.
const Logo = (props: ILogoProps) => {
  const { t } = useTranslation('common');
  const fontStyle = props.xl ? 'font-semibold text-2xl' : 'font-semibold text-xl';
  const [width, height] = props.xl ? [200, 56] : [170, 48];
  const common = { alt: t('logo.alt'), priority: true, fetchPriority: 'high' as const };
  const {
    props: { src: wordmarkSrc },
  } = getImageProps({ ...common, src: '/logos/fellowship-wordmark.svg', width, height });
  const { props: logomark } = getImageProps({
    ...common,
    src: '/logos/fellowship-logomark.svg',
    width: 30,
    height: 42,
  });

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <picture>
        <source media="(min-width: 1024px)" srcSet={wordmarkSrc} />
        <img
          {...logomark}
          alt={logomark.alt}
          className={`w-[30px] h-[42px] ${props.xl ? 'lg:w-[200px] lg:h-[56px]' : 'lg:w-[170px] lg:h-12'}`}
        />
      </picture>
    </span>
  );
};

export { Logo };
