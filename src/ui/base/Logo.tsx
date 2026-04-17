import Image from 'next/image';

type ILogoProps = {
  xl?: boolean;
};

const Logo = (props: ILogoProps) => {
  const fontStyle = props.xl ? 'font-semibold text-2xl' : 'font-semibold text-xl';
  const [width, height] = props.xl ? [200, 33] : [170, 28];

  return (
    <span className={`text-gray-900 inline-flex items-center ${fontStyle}`}>
      <Image
        src="/logos/fellowship-wordmark.svg"
        alt="Fellowship Event Hall"
        width={width}
        height={height}
        priority
      />
    </span>
  );
};

export { Logo };
