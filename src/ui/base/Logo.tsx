import { useTranslation } from 'next-i18next/pages';
import Image from 'next/image';

type ILogoProps = {
  xl?: boolean;
};

// Both marks are rendered and toggled with CSS so the server, first client
// render, and hydrated tree agree. Swapping `src` after measuring the window
// briefly laid the wordmark out at the logomark's aspect ratio (170x238),
// which is what made the navbar flash tall.
const Logo = (props: ILogoProps) => {
  const { t } = useTranslation('common');
  const fontStyle = props.xl ? 'font-semibold text-2xl' : 'font-semibold text-xl';
  const [width, height] = props.xl ? [200, 56] : [170, 48];

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src="/logos/fellowship-logomark.svg"
        alt={t('logo.alt')}
        width={30}
        height={42}
        className="lg:hidden w-[30px] h-[42px]"
      />
      <Image
        src="/logos/fellowship-wordmark.svg"
        alt={t('logo.alt')}
        width={width}
        height={height}
        className={`hidden lg:block ${props.xl ? 'w-[200px] h-[56px]' : 'w-[170px] h-12'}`}
      />
    </span>
  );
};

export { Logo };
