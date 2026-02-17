import Image from 'next/image';
import { useWindowSize } from '../../hooks';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const { width, breakpoint } = useWindowSize();
  const fontStyle = props.xl
    ? 'font-semibold text-2xl'
    : 'font-semibold text-xl';

  const renderLogo = () => {
    if (width > breakpoint) return ['logo-tp.png', 240, 60] as const;
    return ['logo-words.png', 180, 50] as const;
  };

  const [logoSrc, logoWidth, logoHeight] = renderLogo();

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src={`/logos/${logoSrc}`}
        alt="Fellowship Event Hall - Host Events"
        width={logoWidth}
        height={logoHeight}
      />
    </span>
  );
};

export { Logo };
