import Image from 'next/image';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const fontStyle = props.xl
    ? 'font-semibold text-2xl'
    : 'font-semibold text-xl';

  // Always use cursive words logo, smaller size
  const renderLogo = () => {
    if (props.xl) return ['logo-words.png', '160', '44'];
    return ['logo-words.png', '140', '38'];
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
