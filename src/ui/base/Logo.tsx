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
    if (width > breakpoint) return 'logo-tp.png';
    return 'logo-words.jpg';
  };

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src={`/logos/${renderLogo()}`}
        alt="Fellowship Event Hall - Host Events"
        width="240"
        height="60"
      />
    </span>
  );
};

export { Logo };
