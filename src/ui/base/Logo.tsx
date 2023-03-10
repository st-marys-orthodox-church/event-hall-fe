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
    if (width > breakpoint) return ['logo-tp.png', '240', '60'];
    return ['logo-words.png', '180', '50'];
  };

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src={`/logos/${renderLogo()[0]}`}
        alt="Fellowship Event Hall - Host Events"
        width={renderLogo()[1]}
        height={renderLogo()[2]}
      />
    </span>
  );
};

export { Logo };
